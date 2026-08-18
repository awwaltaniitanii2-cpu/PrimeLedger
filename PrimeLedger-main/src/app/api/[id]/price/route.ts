import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

type SessionUser = {
  id?: string;
  role?: string;
  email?: string | null;
  name?: string | null;
};

async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      error: NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      ),
    };
  }

  const user = session.user as SessionUser;

  if (user.role !== "ADMIN") {
    return {
      error: NextResponse.json(
        { error: "Administrator access required." },
        { status: 403 }
      ),
    };
  }

  return { user };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authorization = await requireAdmin();

    if ("error" in authorization) {
      return authorization.error;
    }

    const { user } = authorization;
    const { id } = await params;
    const body = await request.json();

    const currentPrice = Number(body.currentPrice);

    if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
      return NextResponse.json(
        { error: "A valid current price is required." },
        { status: 400 }
      );
    }

    const trade = await prisma.trade.findUnique({
      where: { id },
    });

    if (!trade) {
      return NextResponse.json(
        { error: "Trade not found." },
        { status: 404 }
      );
    }

    if (trade.status !== "OPEN") {
      return NextResponse.json(
        {
          error: "Only open trades can receive live price updates.",
        },
        { status: 400 }
      );
    }

    if (!trade.entryPrice) {
      return NextResponse.json(
        {
          error: "Trade does not have an entry price.",
        },
        { status: 400 }
      );
    }

    const entryPrice = Number(trade.entryPrice);
    const quantity = Number(trade.quantity);

    const unrealizedProfitLoss =
      trade.side === "BUY"
        ? (currentPrice - entryPrice) * quantity
        : (entryPrice - currentPrice) * quantity;

    const updatedTrade = await prisma.$transaction(async (tx) => {
      const updated = await tx.trade.update({
        where: { id },
        data: {
          currentPrice,
          unrealizedProfitLoss,
          priceUpdatedAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          actor:
            user.id ||
            user.email ||
            user.name ||
            "Administrator",
          action: "TRADE_PRICE_UPDATED",
          target: updated.id,
          details: JSON.stringify({
            symbol: updated.symbol,
            entryPrice,
            currentPrice,
            quantity,
            unrealizedProfitLoss,
          }),
        },
      });

      return updated;
    });

    return NextResponse.json({
      trade: updatedTrade,
      floatingProfitLoss: unrealizedProfitLoss,
      message: "Live market price updated.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update trade price.",
      },
      { status: 500 }
    );
  }
}