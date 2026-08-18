export type MarketCategory =
  | "Crypto"
  | "Stocks"
  | "Forex"
  | "Commodities"
  | "Indices";

export type MarketSymbol = {
  name: string;
  pair: string;
  symbol: string;
};

const cryptoPairs = [
  "BTC","ETH","BNB","SOL","XRP","ADA","DOGE","AVAX","LINK","DOT",
  "LTC","BCH","UNI","ATOM","XLM","FIL","APT","ARB","OP","NEAR",
  "ICP","HBAR","VET","AAVE","GRT","ALGO","SAND","MANA","AXS","EGLD",
  "THETA","EOS","XTZ","FTM","FLOW","KAVA","CHZ","RUNE","CRV","SNX",
  "COMP","MKR","ZEC","DASH","ENJ","BAT","ZIL","QTUM","IOTA","KSM",
  "WAVES","OMG","YFI","BAL","SUSHI","1INCH","STORJ","COTI","HOT","IOST",
  "AR","MINA","ROSE","IMX","LDO","GMX","DYDX","INJ","RNDR","FET",
  "GALA","APE","GMT","PEOPLE","ENS","MASK","QNT","SUI","SEI","TIA",
  "PYTH","JUP","WIF","BONK","FLOKI","PEPE","SHIB","ORDI","MEME","STRK",
  "WLD","BLUR","ARKM","ID","MAGIC","PENDLE","CFX","CKB","CELO","ASTR"
];

const stocks: MarketSymbol[] = [
  ["Apple","AAPL","NASDAQ:AAPL"],["Microsoft","MSFT","NASDAQ:MSFT"],
  ["Nvidia","NVDA","NASDAQ:NVDA"],["Amazon","AMZN","NASDAQ:AMZN"],
  ["Meta","META","NASDAQ:META"],["Tesla","TSLA","NASDAQ:TSLA"],
  ["Alphabet","GOOGL","NASDAQ:GOOGL"],["Netflix","NFLX","NASDAQ:NFLX"],
  ["Adobe","ADBE","NASDAQ:ADBE"],["AMD","AMD","NASDAQ:AMD"],
  ["Intel","INTC","NASDAQ:INTC"],["Oracle","ORCL","NYSE:ORCL"],
  ["Salesforce","CRM","NYSE:CRM"],["Palantir","PLTR","NASDAQ:PLTR"],
  ["JPMorgan","JPM","NYSE:JPM"],["Goldman Sachs","GS","NYSE:GS"],
  ["Morgan Stanley","MS","NYSE:MS"],["Bank of America","BAC","NYSE:BAC"],
  ["Wells Fargo","WFC","NYSE:WFC"],["BlackRock","BLK","NYSE:BLK"],
  ["Visa","V","NYSE:V"],["Mastercard","MA","NYSE:MA"],
  ["Walmart","WMT","NYSE:WMT"],["Costco","COST","NASDAQ:COST"],
  ["Nike","NKE","NYSE:NKE"],["Starbucks","SBUX","NASDAQ:SBUX"],
  ["McDonald's","MCD","NYSE:MCD"],["Coca-Cola","KO","NYSE:KO"],
  ["PepsiCo","PEP","NASDAQ:PEP"],["Disney","DIS","NYSE:DIS"],
  ["UnitedHealth","UNH","NYSE:UNH"],["Johnson & Johnson","JNJ","NYSE:JNJ"],
  ["Pfizer","PFE","NYSE:PFE"],["Eli Lilly","LLY","NYSE:LLY"],
  ["Exxon Mobil","XOM","NYSE:XOM"],["Chevron","CVX","NYSE:CVX"],
  ["Boeing","BA","NYSE:BA"],["Lockheed Martin","LMT","NYSE:LMT"],
  ["Caterpillar","CAT","NYSE:CAT"],["Ford","F","NYSE:F"],
  ["General Motors","GM","NYSE:GM"],["Rivian","RIVN","NASDAQ:RIVN"],
  ["Uber","UBER","NYSE:UBER"],["Airbnb","ABNB","NASDAQ:ABNB"],
  ["Shopify","SHOP","NYSE:SHOP"],["Cloudflare","NET","NYSE:NET"],
  ["CrowdStrike","CRWD","NASDAQ:CRWD"],["Coinbase","COIN","NASDAQ:COIN"],
  ["ASML","ASML","NASDAQ:ASML"],["TSMC","TSM","NYSE:TSM"],
  ["Micron","MU","NASDAQ:MU"],["IBM","IBM","NYSE:IBM"]
].map(([name, pair, symbol]) => ({ name, pair, symbol }));

export const markets: Record<MarketCategory, MarketSymbol[]> = {
  Crypto: cryptoPairs.map((coin) => ({
    name: coin,
    pair: `${coin}/USDT`,
    symbol: `BINANCE:${coin}USDT`,
  })),

  Stocks: stocks,

  Forex: [
    { name: "Euro / US Dollar", pair: "EUR/USD", symbol: "FX:EURUSD" },
    { name: "British Pound / US Dollar", pair: "GBP/USD", symbol: "FX:GBPUSD" },
    { name: "US Dollar / Japanese Yen", pair: "USD/JPY", symbol: "FX:USDJPY" },
    { name: "US Dollar / Swiss Franc", pair: "USD/CHF", symbol: "FX:USDCHF" },
    { name: "Australian Dollar / US Dollar", pair: "AUD/USD", symbol: "FX:AUDUSD" },
    { name: "US Dollar / Canadian Dollar", pair: "USD/CAD", symbol: "FX:USDCAD" },
    { name: "Euro / British Pound", pair: "EUR/GBP", symbol: "FX:EURGBP" },
    { name: "Euro / Japanese Yen", pair: "EUR/JPY", symbol: "FX:EURJPY" },
    { name: "British Pound / Japanese Yen", pair: "GBP/JPY", symbol: "FX:GBPJPY" },
  ],

  Commodities: [
    { name: "Gold", pair: "XAU/USD", symbol: "OANDA:XAUUSD" },
    { name: "Silver", pair: "XAG/USD", symbol: "OANDA:XAGUSD" },
    { name: "Crude Oil", pair: "WTI", symbol: "TVC:USOIL" },
    { name: "Brent Oil", pair: "BRENT", symbol: "TVC:UKOIL" },
    { name: "Natural Gas", pair: "NATGAS", symbol: "TVC:NATGAS" },
    { name: "Copper", pair: "COPPER", symbol: "COMEX:HG1!" },
    { name: "Platinum", pair: "PLATINUM", symbol: "TVC:PLATINUM" },
    { name: "Coffee", pair: "COFFEE", symbol: "ICEUS:KC1!" },
    { name: "Corn", pair: "CORN", symbol: "CBOT:ZC1!" },
    { name: "Wheat", pair: "WHEAT", symbol: "CBOT:ZW1!" },
  ],

  Indices: [
    { name: "S&P 500", pair: "SPX", symbol: "SP:SPX" },
    { name: "Nasdaq 100", pair: "NDX", symbol: "NASDAQ:NDX" },
    { name: "Dow Jones", pair: "DJI", symbol: "DJ:DJI" },
    { name: "Russell 2000", pair: "RUT", symbol: "TVC:RUT" },
    { name: "DAX", pair: "DAX", symbol: "XETR:DAX" },
    { name: "FTSE 100", pair: "FTSE", symbol: "TVC:UKX" },
    { name: "Nikkei 225", pair: "NI225", symbol: "TVC:NI225" },
    { name: "Hang Seng", pair: "HSI", symbol: "TVC:HSI" },
  ],
};