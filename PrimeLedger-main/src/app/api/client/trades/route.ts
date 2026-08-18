import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

type SessionUser = {
  id?: string;
  role?: string;
  email?: string | null;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const sessionUser = session.user as SessionUser;

    if (sessionUser.role === "ADMIN") {
      return NextResponse.json(
        { error: "This endpoint is for client accounts only." },
        { status: 403 }
      );
    }

    let client: { id: string } | null = null;

    if (sessionUser.id) {
      client = await prisma.client.findFirst({
        where: {
          userId: sessionUser.id,
        },
        select: {
          id: true,
        },
      });
    }

    if (!client && sessionUser.email) {
      client = await prisma.client.findFirst({
        where: {
          user: {
            email: sessionUser.email,
          },
        },
        select: {
          id: true,
        },
      });
    }

    if (!client) {
      return NextResponse.json(
        { error: "Client profile not found." },
        { status: 404 }
      );
    }

    const trades = await prisma.trade.findMany({
      where: {
        clientId: client.id,
        deletedAt: null,
      },
      include: {
        account: {
          select: {
            id: true,
            accountId: true,
            accountType: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const openTrades = trades.filter(
      (trade) => trade.status === "OPEN"
    );

    const pendingTrades = trades.filter(
      (trade) => trade.status === "PENDING"
    );

    const closedTrades = trades.filter(
      (trade) => trade.status === "CLOSED"
    );

    const cancelledTrades = trades.filter(
      (trade) => trade.status === "CANCELLED"
    );

    const realizedProfitLoss = closedTrades.reduce(
      (total, trade) =>
        total + Number(trade.realizedProfitLoss || 0),
      0
    );

    const winningTrades = closedTrades.filter(
      (trade) => Number(trade.realizedProfitLoss || 0) > 0
    ).length;

    const losingTrades = closedTrades.filter(
      (trade) => Number(trade.realizedProfitLoss || 0) < 0
    ).length;

    const winRate =
      closedTrades.length > 0
        ? (winningTrades / closedTrades.length) * 100
        : 0;

    const averageTrade =
      closedTrades.length > 0
        ? realizedProfitLoss / closedTrades.length
        : 0;

    return NextResponse.json({
      trades,
      sections: {
        open: openTrades,
        pending: pendingTrades,
        closed: closedTrades,
        cancelled: cancelledTrades,
      },
      summary: {
        totalTrades: trades.length,
        openTrades: openTrades.length,
        pendingTrades: pendingTrades.length,
        closedTrades: closedTrades.length,
        cancelledTrades: cancelledTrades.length,
        winningTrades,
        losingTrades,
        winRate,
        averageTrade,
        realizedProfitLoss,
      },
    });
  } catch (error) {
    console.error("GET_CLIENT_TRADES_ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load client trades.",
      },
      { status: 500 }
    );
  }
}