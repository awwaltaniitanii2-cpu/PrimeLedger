"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type TradeStatus = "PENDING" | "OPEN" | "CLOSED" | "CANCELLED";

type ClientTrade = {
  id: string;
  symbol: string;
  assetClass: string;
  side: "BUY" | "SELL";
  orderType: string;
  status: TradeStatus;
  quantity: string;
  entryPrice: string | null;
  exitPrice: string | null;
  stopLoss: string | null;
  takeProfit: string | null;
  fees: string;
  realizedProfitLoss: string;
  openedAt: string | null;
  closedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  note: string | null;
  account: {
    id: string;
    accountId: string;
    accountType: string;
  };
};

type TradeResponse = {
  trades: ClientTrade[];
  sections: {
    open: ClientTrade[];
    pending: ClientTrade[];
    closed: ClientTrade[];
    cancelled: ClientTrade[];
  };
  summary: {
    totalTrades: number;
    openTrades: number;
    pendingTrades: number;
    closedTrades: number;
    cancelledTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    averageTrade: number;
    realizedProfitLoss: number;
  };
};

type TabKey = "OPEN" | "PENDING" | "CLOSED" | "CANCELLED" | "ALL";

const emptyResponse: TradeResponse = {
  trades: [],
  sections: {
    open: [],
    pending: [],
    closed: [],
    cancelled: [],
  },
  summary: {
    totalTrades: 0,
    openTrades: 0,
    pendingTrades: 0,
    closedTrades: 0,
    cancelledTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    winRate: 0,
    averageTrade: 0,
    realizedProfitLoss: 0,
  },
};

export default function ClientTradeTerminal() {
  const [data, setData] = useState<TradeResponse>(emptyResponse);
  const [activeTab, setActiveTab] = useState<TabKey>("OPEN");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTrades = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/client/trades", {
        cache: "no-store",
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData?.error || "Failed to load your trades."
        );
      }

      setData(responseData);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load your trades."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTrades();
  }, [loadTrades]);

  const visibleTrades = useMemo(() => {
    if (activeTab === "OPEN") {
      return data.sections.open;
    }

    if (activeTab === "PENDING") {
      return data.sections.pending;
    }

    if (activeTab === "CLOSED") {
      return data.sections.closed;
    }

    if (activeTab === "CANCELLED") {
      return data.sections.cancelled;
    }

    return data.trades;
  }, [activeTab, data]);

  return (
    <div className="space-y-8">
      {error ? (
        <div className="rounded-2xl border border-[#FF5D7D]/20 bg-[#FF5D7D]/10 px-5 py-4 text-sm font-semibold text-[#FF5D7D]">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Open Positions"
          value={data.summary.openTrades.toString()}
          detail={`${data.summary.pendingTrades} pending orders`}
        />

        <SummaryCard
          label="Realized P/L"
          value={formatMoney(data.summary.realizedProfitLoss)}
          detail={`${data.summary.closedTrades} closed trades`}
          positive={data.summary.realizedProfitLoss >= 0}
        />

        <SummaryCard
          label="Win Rate"
          value={`${data.summary.winRate.toFixed(1)}%`}
          detail={`${data.summary.winningTrades} winning trades`}
        />

        <SummaryCard
          label="Average Trade"
          value={formatMoney(data.summary.averageTrade)}
          detail={`${data.summary.totalTrades} total trades`}
          positive={data.summary.averageTrade >= 0}
        />
      </section>

      <section className="rounded-[30px] border border-white/10 bg-black/25 p-6 lg:p-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#D8C37A]">
              Managed Trading
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-white">
              Trade Terminal
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#7F8DA3]">
              Review positions and orders managed by the PrimeLedger
              trading desk.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadTrades()}
            disabled={loading}
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-white transition hover:bg-white/[0.08] disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh Trades"}
          </button>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <TabButton
            label="Open"
            count={data.summary.openTrades}
            active={activeTab === "OPEN"}
            onClick={() => setActiveTab("OPEN")}
          />

          <TabButton
            label="Pending"
            count={data.summary.pendingTrades}
            active={activeTab === "PENDING"}
            onClick={() => setActiveTab("PENDING")}
          />

          <TabButton
            label="Closed"
            count={data.summary.closedTrades}
            active={activeTab === "CLOSED"}
            onClick={() => setActiveTab("CLOSED")}
          />

          <TabButton
            label="Cancelled"
            count={data.summary.cancelledTrades}
            active={activeTab === "CANCELLED"}
            onClick={() => setActiveTab("CANCELLED")}
          />

          <TabButton
            label="All"
            count={data.summary.totalTrades}
            active={activeTab === "ALL"}
            onClick={() => setActiveTab("ALL")}
          />
        </div>

        <div className="mt-8 space-y-4">
          {loading ? (
            <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-8 text-center text-[#7F8DA3]">
              Loading trades...
            </div>
          ) : visibleTrades.length === 0 ? (
            <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-8 text-center">
              <p className="text-lg font-bold text-white">
                No trades in this section
              </p>

              <p className="mt-2 text-sm text-[#7F8DA3]">
                Your managed trades will appear here when they are
                created by the trading desk.
              </p>
            </div>
          ) : (
            visibleTrades.map((trade) => (
              <TradeCard key={trade.id} trade={trade} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  positive,
}: {
  label: string;
  value: string;
  detail: string;
  positive?: boolean;
}) {
  return (
    <article className="rounded-[26px] border border-white/10 bg-black/25 p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7F8DA3]">
        {label}
      </p>

      <p
        className={`mt-4 text-3xl font-black tracking-[-0.04em] ${
          positive === undefined
            ? "text-white"
            : positive
              ? "text-[#2FFFA7]"
              : "text-[#FF5D7D]"
        }`}
      >
        {value}
      </p>

      <p className="mt-2 text-sm text-[#7F8DA3]">{detail}</p>
    </article>
  );
}

function TabButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${
        active
          ? "border-[#00D9FF]/40 bg-[#00D9FF]/10 text-[#00D9FF]"
          : "border-white/10 bg-white/[0.03] text-[#7F8DA3] hover:text-white"
      }`}
    >
      {label}

      <span className="ml-2 rounded-full bg-black/30 px-2 py-1 text-xs">
        {count}
      </span>
    </button>
  );
}

function TradeCard({ trade }: { trade: ClientTrade }) {
  const realizedProfitLoss = Number(trade.realizedProfitLoss || 0);

  return (
    <article className="rounded-[26px] border border-white/10 bg-white/[0.035] p-5 lg:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D8C37A]">
              {trade.assetClass}
            </p>

            <StatusBadge status={trade.status} />

            <SideBadge side={trade.side} />
          </div>

          <h3 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white">
            {trade.symbol}
          </h3>

          <p className="mt-2 text-sm text-[#7F8DA3]">
            {trade.account.accountId} · {trade.account.accountType}
          </p>
        </div>

        {trade.status === "CLOSED" ? (
          <div className="lg:text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-[#7F8DA3]">
              Realized P/L
            </p>

            <p
              className={`mt-2 text-2xl font-black ${
                realizedProfitLoss >= 0
                  ? "text-[#2FFFA7]"
                  : "text-[#FF5D7D]"
              }`}
            >
              {formatMoney(realizedProfitLoss)}
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Quantity" value={trade.quantity} />

        <Metric
          label="Entry Price"
          value={
            trade.entryPrice
              ? formatNumber(Number(trade.entryPrice))
              : "—"
          }
        />

        <Metric
          label="Exit Price"
          value={
            trade.exitPrice
              ? formatNumber(Number(trade.exitPrice))
              : "—"
          }
        />

        <Metric label="Order Type" value={trade.orderType} />

        <Metric
          label="Stop Loss"
          value={
            trade.stopLoss
              ? formatNumber(Number(trade.stopLoss))
              : "—"
          }
        />

        <Metric
          label="Take Profit"
          value={
            trade.takeProfit
              ? formatNumber(Number(trade.takeProfit))
              : "—"
          }
        />

        <Metric
          label="Fees"
          value={formatMoney(Number(trade.fees || 0))}
        />

        <Metric
          label="Created"
          value={formatDate(trade.createdAt)}
        />
      </div>

      {trade.note ? (
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[#7F8DA3]">
            Trade Note
          </p>

          <p className="mt-2 text-sm leading-6 text-white/80">
            {trade.note}
          </p>
        </div>
      ) : null}
    </article>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-[#7F8DA3]">
        {label}
      </p>

      <p className="mt-2 break-words font-bold text-white">{value}</p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: TradeStatus;
}) {
  const classes: Record<TradeStatus, string> = {
    OPEN: "border-[#2FFFA7]/30 bg-[#2FFFA7]/10 text-[#2FFFA7]",
    PENDING:
      "border-[#D8C37A]/30 bg-[#D8C37A]/10 text-[#D8C37A]",
    CLOSED:
      "border-[#00D9FF]/30 bg-[#00D9FF]/10 text-[#00D9FF]",
    CANCELLED:
      "border-[#FF5D7D]/30 bg-[#FF5D7D]/10 text-[#FF5D7D]",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-black ${classes[status]}`}
    >
      {status}
    </span>
  );
}

function SideBadge({
  side,
}: {
  side: "BUY" | "SELL";
}) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-black ${
        side === "BUY"
          ? "border-[#2FFFA7]/30 bg-[#2FFFA7]/10 text-[#2FFFA7]"
          : "border-[#FF5D7D]/30 bg-[#FF5D7D]/10 text-[#FF5D7D]"
      }`}
    >
      {side}
    </span>
  );
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 8,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}