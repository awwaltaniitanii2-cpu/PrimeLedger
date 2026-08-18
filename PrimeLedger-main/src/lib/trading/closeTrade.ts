import { prisma } from "@/lib/prisma";

export type TradeCloseReason =
  | "MANUAL"
  | "TAKE_PROFIT"
  | "STOP_LOSS";

type CloseTradeParams = {
  tradeId: string;
  exitPrice: number;
  actor: string;
  note?: string;
  reason?: TradeCloseReason;
};

export async function closeTrade({
  tradeId,
  exitPrice,
  actor,
  note,
}: CloseTradeParams) {
  const trade = await prisma.trade.findUnique({
    where: {
      id: tradeId,
    },
    include: {
      account: true,
    },
  });

  if (!trade) {
    throw new Error("Trade not found.");
  }

  if (trade.status !== "OPEN") {
    throw new Error("Only open trades can be closed.");
  }

  const entryPrice = Number(trade.entryPrice || 0);
  const quantity = Number(trade.quantity || 0);
  const fees = Number(trade.fees || 0);

  const realizedProfitLoss =
    trade.side === "BUY"
      ? (exitPrice - entryPrice) * quantity - fees
      : (entryPrice - exitPrice) * quantity - fees;

  const updatedTrade = await prisma.$transaction(
    async (tx) => {
      const closedTrade = await tx.trade.update({
        where: {
          id: tradeId,
        },
        data: {
          status: "CLOSED",
          exitPrice,
          currentPrice: exitPrice,
          realizedProfitLoss,
          unrealizedProfitLoss: 0,
          closedAt: new Date(),
          closedBy: actor,
          note: note || trade.note,
        },
      });

      await tx.tradingAccount.update({
        where: {
          id: trade.accountId,
        },
        data: {
          profitLoss:
            Number(trade.account.profitLoss) +
            realizedProfitLoss,
        },
      });

      await tx.transaction.create({
        data: {
          clientId: trade.clientId,
          accountId: trade.accountId,
          type:
            realizedProfitLoss >= 0
              ? "PROFIT"
              : "LOSS",
          amount: Math.abs(realizedProfitLoss),
          status: "APPROVED",
          note: `${trade.symbol} trade closed.`,
        },
      });

      return closedTrade;
    }
  );

  return updatedTrade;
}