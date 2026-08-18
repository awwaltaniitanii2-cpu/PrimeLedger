"use client";

import { useMemo, useState } from "react";
import TradingViewWidget from "@/components/markets/TradingViewWidget";
import PageShell from "@/components/ui/PageShell";
import GlassPanel from "@/components/ui/GlassPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import GlowButton from "@/components/ui/GlowButton";
import { markets, type MarketCategory, type MarketSymbol } from "@/lib/market-data";

export default function MarketsPage() {
  const categories = Object.keys(markets) as MarketCategory[];

  const [category, setCategory] = useState<MarketCategory>("Crypto");
  const [selected, setSelected] = useState<MarketSymbol>(markets.Crypto[0]);
  const [search, setSearch] = useState("");

  const filteredMarkets = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return markets[category];
    }

    return markets[category].filter((item) => {
      return (
        item.name.toLowerCase().includes(query) ||
        item.pair.toLowerCase().includes(query)
      );
    });
  }, [category, search]);

  function changeCategory(nextCategory: MarketCategory) {
    setCategory(nextCategory);
    setSelected(markets[nextCategory][0]);
    setSearch("");
  }

  return (
    <PageShell>
      <div className="space-y-8 pb-12">
        <GlassPanel className="p-8 lg:p-10">
          <SectionHeader
            eyebrow="PrimeLedger Markets"
            title="Global Market Terminal"
            description="Explore crypto, stocks, forex, commodities, and indices from one private PrimeLedger market interface."
            action={<GlowButton href="/dashboard">Dashboard</GlowButton>}
          />
        </GlassPanel>

        <GlassPanel className="p-5">
          <div className="grid gap-3 md:grid-cols-5">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => changeCategory(item)}
                className={`rounded-2xl border px-5 py-4 text-sm font-black transition ${
                  category === item
                    ? "border-[#00D9FF]/40 bg-[#00D9FF]/15 text-[#00D9FF]"
                    : "border-white/10 bg-white/[0.035] text-slate-300 hover:border-[#D8C37A]/30 hover:text-[#D8C37A]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </GlassPanel>

        <div className="grid gap-8 xl:grid-cols-[420px_1fr]">
          <GlassPanel className="p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-[#D8C37A]">
                  {category} Market
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">
                  Instruments
                </h2>
              </div>

              <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs font-bold text-[#7F8DA3]">
                {markets[category].length}
              </span>
            </div>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${category.toLowerCase()}...`}
              className="mt-6 w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none transition placeholder:text-[#566174] focus:border-[#00D9FF]/50 focus:bg-black/40"
            />

            <div className="mt-6 max-h-[720px] space-y-3 overflow-y-auto pr-2">
              {filteredMarkets.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/25 p-6 text-center text-sm text-[#7F8DA3]">
                  No instruments found.
                </div>
              ) : (
                filteredMarkets.map((item) => (
                  <button
                    key={item.symbol}
                    onClick={() => setSelected(item)}
                    className={`w-full rounded-2xl border px-5 py-4 text-left transition ${
                      selected.symbol === item.symbol
                        ? "border-[#00D9FF]/40 bg-[#00D9FF]/15"
                        : "border-white/10 bg-white/[0.035] hover:border-[#D8C37A]/30 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p
                          className={`font-black ${
                            selected.symbol === item.symbol
                              ? "text-[#00D9FF]"
                              : "text-white"
                          }`}
                        >
                          {item.pair}
                        </p>

                        <p className="mt-1 text-xs text-[#7F8DA3]">
                          {item.name}
                        </p>
                      </div>

                      <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[10px] uppercase tracking-widest text-[#7F8DA3]">
                        Live
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </GlassPanel>

          <GlassPanel className="p-6">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-[#D8C37A]">
                  Active Instrument
                </p>

                <h2 className="mt-3 text-5xl font-black tracking-[-0.06em]">
                  {selected.pair}
                </h2>

                <p className="mt-2 text-sm text-[#7F8DA3]">
                  {selected.name} · {category}
                </p>
              </div>

              <span className="rounded-full border border-[#2FFFA7]/20 bg-[#2FFFA7]/10 px-4 py-2 text-xs font-bold text-[#2FFFA7]">
                LIVE MARKET
              </span>
            </div>

            <div className="overflow-hidden rounded-[32px] border border-white/10 bg-black/30 p-2">
              <TradingViewWidget symbol={selected.symbol} />
            </div>
          </GlassPanel>
        </div>
      </div>
    </PageShell>
  );
}