export function calculateSpotPnL(
  side: "BUY" | "SELL",
  entryPrice: number,
  currentPrice: number,
  quantity: number,
  fees = 0
) {
  const gross =
    side === "BUY"
      ? (currentPrice - entryPrice) * quantity
      : (entryPrice - currentPrice) * quantity;

  return gross - fees;
}

export function calculateFuturesPnL(
  side: "BUY" | "SELL",
  entryPrice: number,
  currentPrice: number,
  quantity: number,
  leverage: number,
  fees = 0
) {
  const gross =
    side === "BUY"
      ? (currentPrice - entryPrice) * quantity * leverage
      : (entryPrice - currentPrice) * quantity * leverage;

  return gross - fees;
}

export function calculateFloatingPnL(params: {
  marketType: "SPOT" | "FUTURES";
  side: "BUY" | "SELL";
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  leverage?: number;
  fees?: number;
}) {
  const {
    marketType,
    side,
    entryPrice,
    currentPrice,
    quantity,
    leverage = 1,
    fees = 0,
  } = params;

  if (marketType === "FUTURES") {
    return calculateFuturesPnL(
      side,
      entryPrice,
      currentPrice,
      quantity,
      leverage,
      fees
    );
  }

  return calculateSpotPnL(
    side,
    entryPrice,
    currentPrice,
    quantity,
    fees
  );
}

export function calculatePositionValue(
  quantity: number,
  price: number
) {
  return quantity * price;
}

export function calculateRequiredMargin(
  quantity: number,
  entryPrice: number,
  leverage: number
) {
  if (leverage <= 0) return 0;

  return (quantity * entryPrice) / leverage;
}

export function calculateLiquidationPrice(params: {
  side: "BUY" | "SELL";
  entryPrice: number;
  leverage: number;
}) {
  const { side, entryPrice, leverage } = params;

  if (leverage <= 0) return entryPrice;

  const distance = entryPrice / leverage;

  return side === "BUY"
    ? entryPrice - distance
    : entryPrice + distance;
}