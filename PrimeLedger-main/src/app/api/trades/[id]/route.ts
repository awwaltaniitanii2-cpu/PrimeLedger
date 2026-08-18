import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

type TradeAction = "EDIT" | "OPEN" | "CLOSE" | "CANCEL" | "RESTORE";

type SessionUser = {
  id?: string;
  role?: string;
  email?: string | null;
  name?: string | null;
};

function parseOptionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

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

function getActor(user: SessionUser) {
  return (
    user.id ||
    user.email ||
    user.name ||
    "PrimeLedger Administrator"
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authorization = await requireAdmin();

    if ("error" in authorization) {
      return authorization.error;
    }

    const { id } = await params;

    const trade = await prisma.trade.findUnique({
      where: { id },
      include: {
        client: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                username: true,
              },
            },
          },
        },
        account: true,
      },
    });

    if (!trade) {
      return NextResponse.json(
        { error: "Trade not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ trade });
  } catch (error) {
    console.error("GET_TRADE_ERROR:", error);

    return NextResponse.json(
      { error: "Failed to load trade." },
      { status: 500 }
    );
  }
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

    const { user: adminUser } = authorization;
    const actor = getActor(adminUser);
    const { id } = await params;
    const body = await request.json();

    const action =
      typeof body.action === "string"
        ? (body.action.toUpperCase() as TradeAction)
        : "EDIT";

    const allowedActions: TradeAction[] = [
      "EDIT",
      "OPEN",
      "CLOSE",
      "CANCEL",
      "RESTORE",
    ];

    if (!allowedActions.includes(action)) {
      return NextResponse.json(
        { error: "Invalid trade action." },
        { status: 400 }
      );
    }

    const existingTrade = await prisma.trade.findUnique({
      where: { id },
      include: {
        account: true,
        client: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!existingTrade) {
      return NextResponse.json(
        { error: "Trade not found." },
        { status: 404 }
      );
    }

    if (action !== "RESTORE" && existingTrade.deletedAt) {
      return NextResponse.json(
        { error: "Deleted trades must be restored before modification." },
        { status: 400 }
      );
    }

    if (action === "RESTORE") {
      if (!existingTrade.deletedAt) {
        return NextResponse.json(
          { error: "Trade is not deleted." },
          { status: 400 }
        );
      }

      const restoredTrade = await prisma.$transaction(async (transaction) => {
        const trade = await transaction.trade.update({
          where: { id },
          data: {
            deletedAt: null,
          },
          include: {
            account: true,
            client: {
              include: {
                user: true,
              },
            },
          },
        });

        await transaction.auditLog.create({
          data: {
            actor,
            action: "TRADE_RESTORED",
            target: trade.id,
            details: JSON.stringify({
              clientId: trade.clientId,
              accountId: trade.accountId,
              symbol: trade.symbol,
              status: trade.status,
            }),
          },
        });

        return trade;
      });

      return NextResponse.json({
        trade: restoredTrade,
        message: "Trade restored successfully.",
      });
    }

    if (action === "EDIT") {
      if (
        existingTrade.status !== "PENDING" &&
        existingTrade.status !== "OPEN"
      ) {
        return NextResponse.json(
          { error: "Only pending or open trades can be edited." },
          { status: 400 }
        );
      }

      const symbol =
        typeof body.symbol === "string" && body.symbol.trim()
          ? body.symbol.trim().toUpperCase()
          : undefined;

      const quantity = parseOptionalNumber(body.quantity);
      const entryPrice = parseOptionalNumber(body.entryPrice);
      const stopLoss = parseOptionalNumber(body.stopLoss);
      const takeProfit = parseOptionalNumber(body.takeProfit);
      const fees = parseOptionalNumber(body.fees);

      const note =
        typeof body.note === "string"
          ? body.note.trim() || null
          : undefined;

      if (quantity !== null && quantity <= 0) {
        return NextResponse.json(
          { error: "Quantity must be greater than zero." },
          { status: 400 }
        );
      }

      if (entryPrice !== null && entryPrice <= 0) {
        return NextResponse.json(
          { error: "Entry price must be greater than zero." },
          { status: 400 }
        );
      }

      if (stopLoss !== null && stopLoss <= 0) {
        return NextResponse.json(
          { error: "Stop loss must be greater than zero." },
          { status: 400 }
        );
      }

      if (takeProfit !== null && takeProfit <= 0) {
        return NextResponse.json(
          { error: "Take profit must be greater than zero." },
          { status: 400 }
        );
      }

      if (fees !== null && fees < 0) {
        return NextResponse.json(
          { error: "Fees cannot be negative." },
          { status: 400 }
        );
      }

      const updatedTrade = await prisma.$transaction(async (transaction) => {
        const trade = await transaction.trade.update({
          where: { id },
          data: {
            ...(symbol !== undefined ? { symbol } : {}),
            ...(quantity !== null ? { quantity: String(quantity) } : {}),
            ...(entryPrice !== null
              ? { entryPrice: String(entryPrice) }
              : {}),
            ...(body.entryPrice === "" ? { entryPrice: null } : {}),
            ...(stopLoss !== null ? { stopLoss: String(stopLoss) } : {}),
            ...(body.stopLoss === "" ? { stopLoss: null } : {}),
            ...(takeProfit !== null
              ? { takeProfit: String(takeProfit) }
              : {}),
            ...(body.takeProfit === "" ? { takeProfit: null } : {}),
            ...(fees !== null ? { fees: String(fees) } : {}),
            ...(note !== undefined ? { note } : {}),
          },
          include: {
            account: true,
            client: {
              include: {
                user: true,
              },
            },
          },
        });

        await transaction.auditLog.create({
          data: {
            actor,
            action: "TRADE_UPDATED",
            target: trade.id,
            details: JSON.stringify({
              symbol: trade.symbol,
              quantity: Number(trade.quantity),
              entryPrice: trade.entryPrice
                ? Number(trade.entryPrice)
                : null,
              stopLoss: trade.stopLoss
                ? Number(trade.stopLoss)
                : null,
              takeProfit: trade.takeProfit
                ? Number(trade.takeProfit)
                : null,
              fees: Number(trade.fees),
              status: trade.status,
            }),
          },
        });

        return trade;
      });

      return NextResponse.json({
        trade: updatedTrade,
        message: "Trade updated successfully.",
      });
    }

    if (action === "OPEN") {
      if (existingTrade.status !== "PENDING") {
        return NextResponse.json(
          { error: "Only pending trades can be opened." },
          { status: 400 }
        );
      }

      const entryPrice =
        parseOptionalNumber(body.entryPrice) ??
        (existingTrade.entryPrice
          ? Number(existingTrade.entryPrice)
          : null);

      if (entryPrice === null || entryPrice <= 0) {
        return NextResponse.json(
          { error: "A valid entry price is required." },
          { status: 400 }
        );
      }

      const openedTrade = await prisma.$transaction(async (transaction) => {
        const trade = await transaction.trade.update({
          where: { id },
          data: {
            status: "OPEN",
            entryPrice: String(entryPrice),
            openedAt: new Date(),
            openedBy: actor,
            cancelledAt: null,
          },
          include: {
            account: true,
            client: {
              include: {
                user: true,
              },
            },
          },
        });

        await transaction.auditLog.create({
          data: {
            actor,
            action: "TRADE_OPENED",
            target: trade.id,
            details: JSON.stringify({
              symbol: trade.symbol,
              side: trade.side,
              quantity: Number(trade.quantity),
              entryPrice,
              clientId: trade.clientId,
              accountId: trade.accountId,
            }),
          },
        });

        return trade;
      });

      return NextResponse.json({
        trade: openedTrade,
        message: "Trade opened successfully.",
      });
    }

    if (action === "CLOSE") {
      if (existingTrade.status !== "OPEN") {
        return NextResponse.json(
          { error: "Only open trades can be closed." },
          { status: 400 }
        );
      }

      const exitPrice = parseOptionalNumber(body.exitPrice);

      if (exitPrice === null || exitPrice <= 0) {
        return NextResponse.json(
          { error: "A valid exit price is required." },
          { status: 400 }
        );
      }

      if (!existingTrade.entryPrice) {
        return NextResponse.json(
          { error: "Trade does not have an entry price." },
          { status: 400 }
        );
      }

      const entryPrice = Number(existingTrade.entryPrice);
      const quantity = Number(existingTrade.quantity);
      const fees = Number(existingTrade.fees || 0);

      const grossProfitLoss =
        existingTrade.side === "BUY"
          ? (exitPrice - entryPrice) * quantity
          : (entryPrice - exitPrice) * quantity;

      const realizedProfitLoss = grossProfitLoss - fees;
      const currentAccountProfitLoss = Number(
        existingTrade.account.profitLoss || 0
      );

      const closedTrade = await prisma.$transaction(async (transaction) => {
        const trade = await transaction.trade.update({
          where: { id },
          data: {
            status: "CLOSED",
            exitPrice: String(exitPrice),
            realizedProfitLoss: String(realizedProfitLoss),
            closedAt: new Date(),
            closedBy: actor,
          },
          include: {
            account: true,
            client: {
              include: {
                user: true,
              },
            },
          },
        });

        await transaction.tradingAccount.update({
          where: {
            id: existingTrade.accountId,
          },
          data: {
            profitLoss: String(
              currentAccountProfitLoss + realizedProfitLoss
            ),
          },
        });

        await transaction.transaction.create({
          data: {
            clientId: existingTrade.clientId,
            accountId: existingTrade.accountId,
            type: realizedProfitLoss >= 0 ? "PROFIT" : "LOSS",
            amount: String(Math.abs(realizedProfitLoss)),
            status: "APPROVED",
            note: `Trade ${trade.symbol} closed. Realized P/L: ${realizedProfitLoss.toFixed(
              2
            )}`,
          },
        });

        await transaction.auditLog.create({
          data: {
            actor,
            action: "TRADE_CLOSED",
            target: trade.id,
            details: JSON.stringify({
              symbol: trade.symbol,
              side: trade.side,
              quantity,
              entryPrice,
              exitPrice,
              fees,
              realizedProfitLoss,
              clientId: trade.clientId,
              accountId: trade.accountId,
            }),
          },
        });

        return trade;
      });

      return NextResponse.json({
        trade: closedTrade,
        realizedProfitLoss,
        message: "Trade closed successfully.",
      });
    }

    if (action === "CANCEL") {
      if (existingTrade.status !== "PENDING") {
        return NextResponse.json(
          { error: "Only pending trades can be cancelled." },
          { status: 400 }
        );
      }

      const cancelledTrade = await prisma.$transaction(
        async (transaction) => {
          const trade = await transaction.trade.update({
            where: { id },
            data: {
              status: "CANCELLED",
              cancelledAt: new Date(),
            },
            include: {
              account: true,
              client: {
                include: {
                  user: true,
                },
              },
            },
          });

          await transaction.auditLog.create({
            data: {
              actor,
              action: "TRADE_CANCELLED",
              target: trade.id,
              details: JSON.stringify({
                symbol: trade.symbol,
                clientId: trade.clientId,
                accountId: trade.accountId,
              }),
            },
          });

          return trade;
        }
      );

      return NextResponse.json({
        trade: cancelledTrade,
        message: "Pending trade cancelled successfully.",
      });
    }

    return NextResponse.json(
      { error: "Unsupported action." },
      { status: 400 }
    );
  } catch (error) {
    console.error("UPDATE_TRADE_ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update trade.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authorization = await requireAdmin();

    if ("error" in authorization) {
      return authorization.error;
    }

    const { user: adminUser } = authorization;
    const actor = getActor(adminUser);
    const { id } = await params;

    const existingTrade = await prisma.trade.findUnique({
      where: { id },
      include: {
        client: {
          include: {
            user: true,
          },
        },
        account: true,
      },
    });

    if (!existingTrade) {
      return NextResponse.json(
        { error: "Trade not found." },
        { status: 404 }
      );
    }

    if (existingTrade.deletedAt) {
      return NextResponse.json(
        { error: "Trade is already deleted." },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.trade.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });

      await transaction.auditLog.create({
        data: {
          actor,
          action: "TRADE_SOFT_DELETED",
          target: existingTrade.id,
          details: JSON.stringify({
            clientId: existingTrade.clientId,
            clientName: existingTrade.client.user.name,
            accountId: existingTrade.accountId,
            accountReference: existingTrade.account.accountId,
            symbol: existingTrade.symbol,
            status: existingTrade.status,
            realizedProfitLoss: Number(
              existingTrade.realizedProfitLoss || 0
            ),
          }),
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Trade removed from visible history.",
    });
  } catch (error) {
    console.error("DELETE_TRADE_ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete trade.",
      },
      { status: 500 }
    );
  }
}