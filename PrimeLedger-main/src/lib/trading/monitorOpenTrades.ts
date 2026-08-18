import { prisma } from "@/lib/prisma";
import { getMarketQuote } from "@/lib/markets/provider";
import { closeTrade } from "@/lib/trading/closeTrade";

type MonitorResult = {
  scanned: number;
  updated: number;
  takeProfits: number;
  stopLosses: number;
  skipped: number;
  errors: number;
};

export async function monitorOpenTrades(): Promise<MonitorResult> {
  const result: MonitorResult = {
    scanned: 0,
    updated: 0,
    takeProfits: 0,
    stopLosses: 0,
    skipped: 0,
    errors: 0,
  };

  const trades = await prisma.trade.findMany({
    where: {
      status: "OPEN",
      deletedAt: null,
    },
    select: {
      id: true,
      symbol: true,
      side: true,
      quantity: true,
      entryPrice: true,
      stopLoss: true,
      takeProfit: true,
      fees: true,
      status: true,
    },
  });

  result.scanned = trades.length;

  for (const trade of trades) {
    try {
      if (trade.status !== "OPEN") {
        result.skipped += 1;
        continue;
      }

      if (!trade.entryPrice) {
        result.skipped += 1;
        continue;
      }

      const quote = await getMarketQuote(trade.symbol);

      if (!quote) {
        result.skipped += 1;
        continue;
      }

      const currentPrice = Number(quote.price);
      const entryPrice = Number(trade.entryPrice);
      const quantity = Number(trade.quantity);
      const fees = Number(trade.fees || 0);

      if (
        !Number.isFinite(currentPrice) ||
        currentPrice <= 0 ||
        !Number.isFinite(entryPrice) ||
        entryPrice <= 0 ||
        !Number.isFinite(quantity) ||
        quantity <= 0
      ) {
        result.skipped += 1;
        continue;
      }

      const floatingPnL =
        trade.side === "BUY"
          ? (currentPrice - entryPrice) * quantity - fees
          : (entryPrice - currentPrice) * quantity - fees;

      const stopLoss =
        trade.stopLoss !== null
          ? Number(trade.stopLoss)
          : null;

      const takeProfit =
        trade.takeProfit !== null
          ? Number(trade.takeProfit)
          : null;

      const stopLossTriggered =
        stopLoss !== null &&
        Number.isFinite(stopLoss) &&
        stopLoss > 0 &&
        (trade.side === "BUY"
          ? currentPrice <= stopLoss
          : currentPrice >= stopLoss);

      const takeProfitTriggered =
        takeProfit !== null &&
        Number.isFinite(takeProfit) &&
        takeProfit > 0 &&
        (trade.side === "BUY"
          ? currentPrice >= takeProfit
          : currentPrice <= takeProfit);

      if (stopLossTriggered || takeProfitTriggered) {
        const closeReason = stopLossTriggered
          ? "STOP_LOSS"
          : "TAKE_PROFIT";

        try {
          await closeTrade({
            tradeId: trade.id,
            exitPrice: currentPrice,
            actor: "SYSTEM",
            reason: closeReason,
            note:
              closeReason === "TAKE_PROFIT"
                ? `Automatic Take Profit triggered at ${currentPrice}.`
                : `Automatic Stop Loss triggered at ${currentPrice}.`,
          });

          if (closeReason === "TAKE_PROFIT") {
            result.takeProfits += 1;
          } else {
            result.stopLosses += 1;
          }

          result.updated += 1;
        } catch (closeError) {
          const message =
            closeError instanceof Error
              ? closeError.message
              : "Unknown trade close error.";

          if (
            !message
              .toLowerCase()
              .includes("only open trades")
          ) {
            console.error(
              `TP_SL_CLOSE_ERROR ${trade.id}:`,
              closeError
            );

            result.errors += 1;
          }
        }

        continue;
      }

      await prisma.trade.update({
        where: {
          id: trade.id,
        },
        data: {
          currentPrice: String(currentPrice),
          unrealizedProfitLoss: String(floatingPnL),
          priceUpdatedAt: new Date(),
        },
      });

      result.updated += 1;
    } catch (error) {
      console.error(
        `TP_SL_MONITOR_ERROR ${trade.id}:`,
        error
      );

      result.errors += 1;
    }
  }

  return result;
}