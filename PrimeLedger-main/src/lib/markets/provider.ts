type BinanceTickerResponse = {
  symbol: string;
  price: string;
};

export type MarketQuote = {
  symbol: string;
  price: number;
  source: "BINANCE";
  fetchedAt: Date;
};

const BINANCE_MARKET_DATA_BASE_URL =
  "https://data-api.binance.vision";

const SYMBOL_ALIASES: Record<string, string> = {
  BTC: "BTCUSDT",
  BTCUSD: "BTCUSDT",
  BTCUSDT: "BTCUSDT",

  ETH: "ETHUSDT",
  ETHUSD: "ETHUSDT",
  ETHUSDT: "ETHUSDT",

  SOL: "SOLUSDT",
  SOLUSD: "SOLUSDT",
  SOLUSDT: "SOLUSDT",

  BNB: "BNBUSDT",
  BNBUSD: "BNBUSDT",
  BNBUSDT: "BNBUSDT",

  XRP: "XRPUSDT",
  XRPUSD: "XRPUSDT",
  XRPUSDT: "XRPUSDT",

  DOGE: "DOGEUSDT",
  DOGEUSD: "DOGEUSDT",
  DOGEUSDT: "DOGEUSDT",

  ADA: "ADAUSDT",
  ADAUSD: "ADAUSDT",
  ADAUSDT: "ADAUSDT",

  AVAX: "AVAXUSDT",
  AVAXUSD: "AVAXUSDT",
  AVAXUSDT: "AVAXUSDT",
};

export async function getMarketQuote(
  inputSymbol: string,
): Promise<MarketQuote | null> {
  const symbol = normalizeSymbol(inputSymbol);

  if (!symbol) {
    return null;
  }

  const url = new URL(
    "/api/v3/ticker/price",
    BINANCE_MARKET_DATA_BASE_URL,
  );

  url.searchParams.set("symbol", symbol);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        `[MARKET PROVIDER] Binance returned ${response.status} for ${symbol}`,
      );

      return null;
    }

    const data =
      (await response.json()) as BinanceTickerResponse;

    const price = Number(data.price);

    if (!Number.isFinite(price) || price <= 0) {
      console.error(
        `[MARKET PROVIDER] Invalid price returned for ${symbol}:`,
        data.price,
      );

      return null;
    }

    return {
      symbol: data.symbol,
      price,
      source: "BINANCE",
      fetchedAt: new Date(),
    };
  } catch (error) {
    console.error(
      `[MARKET PROVIDER] Failed to fetch ${symbol}:`,
      error,
    );

    return null;
  }
}

function normalizeSymbol(inputSymbol: string): string | null {
  const cleaned = inputSymbol
    .trim()
    .toUpperCase()
    .replace(/[\s/_-]/g, "");

  if (!cleaned) {
    return null;
  }

  const alias = SYMBOL_ALIASES[cleaned];

  if (alias) {
    return alias;
  }

  if (cleaned.endsWith("USDT")) {
    return cleaned;
  }

  if (cleaned.endsWith("USD")) {
    return `${cleaned.slice(0, -3)}USDT`;
  }

  return `${cleaned}USDT`;
}