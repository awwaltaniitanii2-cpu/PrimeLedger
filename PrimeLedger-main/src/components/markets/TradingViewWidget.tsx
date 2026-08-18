type TradingViewWidgetProps = {
  symbol: string;
};

export default function TradingViewWidget({ symbol }: TradingViewWidgetProps) {
  return (
    <iframe
      title={`TradingView ${symbol}`}
      src={`https://www.tradingview.com/widgetembed/?symbol=${encodeURIComponent(
        symbol
      )}&interval=60&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&hide_side_toolbar=0&allow_symbol_change=1&save_image=1`}
      className="h-[680px] w-full rounded-[28px] border border-white/10"
    />
  );
}