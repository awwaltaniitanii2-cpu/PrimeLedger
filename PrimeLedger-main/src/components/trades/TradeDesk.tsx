"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type ClientOption = {
  id: string;
  user: {
    name: string;
    email: string;
  };
  accounts: {
    id: string;
    accountId: string;
    accountType: string;
    status: string;
  }[];
};

type TradeRow = {
  id: string;
  symbol: string;
  assetClass: string;
  side: "BUY" | "SELL";
  orderType: string;
  status: "PENDING" | "OPEN" | "CLOSED" | "CANCELLED";
  quantity: string;
  entryPrice: string | null;
  exitPrice: string | null;
  stopLoss: string | null;
  takeProfit: string | null;
  fees: string;
  realizedProfitLoss: string;
  createdAt: string;
  deletedAt: string | null;
  client: {
    user: {
      name: string;
      email: string;
    };
  };
  account: {
    accountId: string;
  };
};

const initialForm = {
  clientId: "",
  accountId: "",
  symbol: "",
  assetClass: "CRYPTO",
  side: "BUY",
  orderType: "MARKET",
  status: "OPEN",
  quantity: "",
  entryPrice: "",
  stopLoss: "",
  takeProfit: "",
  fees: "0",
  note: "",
};

export default function TradeDesk() {
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [trades, setTrades] = useState<TradeRow[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [actionTradeId, setActionTradeId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === form.clientId),
    [clients, form.clientId]
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [clientsResponse, tradesResponse] = await Promise.all([
        fetch("/api/clients/list", { cache: "no-store" }),
        fetch("/api/trades", { cache: "no-store" }),
      ]);

      const clientsData = await clientsResponse.json();
      const tradesData = await tradesResponse.json();

      if (!clientsResponse.ok) {
        throw new Error(clientsData?.error || "Failed to load clients.");
      }

      if (!tradesResponse.ok) {
        throw new Error(tradesData?.error || "Failed to load trades.");
      }

      const loadedClients = clientsData.clients || clientsData || [];

      setClients(loadedClients);
      setTrades(tradesData.trades || []);

      if (loadedClients.length > 0 && !form.clientId) {
        const firstClient = loadedClients[0];

        setForm((current) => ({
          ...current,
          clientId: firstClient.id,
          accountId: firstClient.accounts?.[0]?.id || "",
        }));
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load trading desk."
      );
    } finally {
      setLoading(false);
    }
  }, [form.clientId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function updateForm(field: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function changeClient(clientId: string) {
    const client = clients.find((item) => item.id === clientId);

    setForm((current) => ({
      ...current,
      clientId,
      accountId: client?.accounts?.[0]?.id || "",
    }));
  }

  async function createTrade() {
    setMessage("");
    setError("");

    if (
      !form.clientId ||
      !form.accountId ||
      !form.symbol ||
      !form.quantity
    ) {
      setError("Client, account, symbol, and quantity are required.");
      return;
    }

    try {
      setCreating(true);

      const response = await fetch("/api/trades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to create trade.");
      }

      setMessage(data.message || "Trade created successfully.");
      setForm((current) => ({
        ...initialForm,
        clientId: current.clientId,
        accountId: current.accountId,
      }));

      await loadData();
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Failed to create trade."
      );
    } finally {
      setCreating(false);
    }
  }

  async function tradeAction(
    tradeId: string,
    action: "OPEN" | "CLOSE" | "CANCEL" | "RESTORE"
  ) {
    setMessage("");
    setError("");

    let payload: Record<string, string> = { action };

    if (action === "OPEN") {
      const entryPrice = window.prompt("Enter entry price:");

      if (!entryPrice) return;

      payload = { action, entryPrice };
    }

    if (action === "CLOSE") {
      const exitPrice = window.prompt("Enter exit price:");

      if (!exitPrice) return;

      payload = { action, exitPrice };
    }

    try {
      setActionTradeId(tradeId);

      const response = await fetch(`/api/trades/${tradeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Trade action failed.");
      }

      setMessage(data.message || "Trade updated successfully.");
      await loadData();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Trade action failed."
      );
    } finally {
      setActionTradeId("");
    }
  }

  async function deleteTrade(tradeId: string) {
    const confirmed = window.confirm(
      "Remove this trade from visible history? The audit record will remain."
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      setActionTradeId(tradeId);

      const response = await fetch(`/api/trades/${tradeId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to remove trade.");
      }

      setMessage(data.message || "Trade removed successfully.");
      await loadData();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to remove trade."
      );
    } finally {
      setActionTradeId("");
    }
  }

  return (
    <div className="space-y-8">
      {error ? (
        <div className="rounded-2xl border border-[#FF5D7D]/20 bg-[#FF5D7D]/10 px-5 py-4 text-sm font-semibold text-[#FF5D7D]">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-2xl border border-[#2FFFA7]/20 bg-[#2FFFA7]/10 px-5 py-4 text-sm font-semibold text-[#2FFFA7]">
          {message}
        </div>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[420px_1fr]">
        <div className="rounded-[30px] border border-white/10 bg-black/25 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#D8C37A]">
            Trade Execution
          </p>

          <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-white">
            Open Trade
          </h2>

          <div className="mt-7 space-y-4">
            <SelectField
              label="Client"
              value={form.clientId}
              onChange={changeClient}
              options={clients.map((client) => ({
                value: client.id,
                label: `${client.user.name} — ${client.user.email}`,
              }))}
            />

            <SelectField
              label="Trading Account"
              value={form.accountId}
              onChange={(value) => updateForm("accountId", value)}
              options={(selectedClient?.accounts || []).map((account) => ({
                value: account.id,
                label: `${account.accountId} — ${account.accountType}`,
              }))}
            />

            <Field
              label="Symbol"
              value={form.symbol}
              placeholder="BTCUSDT"
              onChange={(value) => updateForm("symbol", value)}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Asset Class"
                value={form.assetClass}
                onChange={(value) => updateForm("assetClass", value)}
                options={[
                  "CRYPTO",
                  "STOCK",
                  "FOREX",
                  "COMMODITY",
                  "INDEX",
                  "ETF",
                  "FUTURE",
                  "OTHER",
                ].map((value) => ({ value, label: value }))}
              />

              <SelectField
                label="Side"
                value={form.side}
                onChange={(value) => updateForm("side", value)}
                options={[
                  { value: "BUY", label: "BUY" },
                  { value: "SELL", label: "SELL" },
                ]}
              />

              <SelectField
                label="Order Type"
                value={form.orderType}
                onChange={(value) => updateForm("orderType", value)}
                options={[
                  { value: "MARKET", label: "MARKET" },
                  { value: "LIMIT", label: "LIMIT" },
                  { value: "STOP", label: "STOP" },
                ]}
              />

              <SelectField
                label="Initial Status"
                value={form.status}
                onChange={(value) => updateForm("status", value)}
                options={[
                  { value: "OPEN", label: "OPEN" },
                  { value: "PENDING", label: "PENDING" },
                ]}
              />

              <Field
                label="Quantity"
                type="number"
                value={form.quantity}
                placeholder="1"
                onChange={(value) => updateForm("quantity", value)}
              />

              <Field
                label="Entry Price"
                type="number"
                value={form.entryPrice}
                placeholder="Optional for pending"
                onChange={(value) => updateForm("entryPrice", value)}
              />

              <Field
                label="Stop Loss"
                type="number"
                value={form.stopLoss}
                placeholder="Optional"
                onChange={(value) => updateForm("stopLoss", value)}
              />

              <Field
                label="Take Profit"
                type="number"
                value={form.takeProfit}
                placeholder="Optional"
                onChange={(value) => updateForm("takeProfit", value)}
              />

              <Field
                label="Fees"
                type="number"
                value={form.fees}
                placeholder="0"
                onChange={(value) => updateForm("fees", value)}
              />
            </div>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7F8DA3]">
                Notes
              </span>

              <textarea
                value={form.note}
                onChange={(event) => updateForm("note", event.target.value)}
                className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none transition focus:border-[#00D9FF]/50"
              />
            </label>

            <button
              type="button"
              onClick={createTrade}
              disabled={creating || loading}
              className="w-full rounded-2xl bg-gradient-to-r from-[#00D9FF] via-[#6D5BFF] to-[#D8C37A] px-6 py-4 font-black text-black transition hover:scale-[1.01] disabled:pointer-events-none disabled:opacity-50"
            >
              {creating ? "Executing..." : "Create Trade"}
            </button>
          </div>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-black/25 p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#D8C37A]">
                Live Trade Registry
              </p>

              <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-white">
                Trades
              </h2>
            </div>

            <button
              type="button"
              onClick={() => void loadData()}
              disabled={loading}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-white"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div className="mt-8 space-y-4">
            {loading ? (
              <p className="text-[#7F8DA3]">Loading trades...</p>
            ) : trades.length === 0 ? (
              <p className="text-[#7F8DA3]">No trades available.</p>
            ) : (
              trades.map((trade) => (
                <article
                  key={trade.id}
                  className="rounded-[26px] border border-white/10 bg-white/[0.035] p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-[#D8C37A]">
                        {trade.assetClass}
                      </p>

                      <h3 className="mt-2 text-2xl font-black text-white">
                        {trade.symbol}
                      </h3>

                      <p className="mt-2 text-sm text-[#7F8DA3]">
                        {trade.client.user.name} · {trade.account.accountId}
                      </p>
                    </div>

                    <StatusBadge status={trade.status} />
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <Metric label="Side" value={trade.side} />
                    <Metric label="Quantity" value={trade.quantity} />
                    <Metric
                      label="Entry"
                      value={trade.entryPrice || "—"}
                    />
                    <Metric
                      label="P/L"
                      value={Number(
                        trade.realizedProfitLoss || 0
                      ).toLocaleString()}
                    />
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {trade.status === "PENDING" ? (
                      <>
                        <ActionButton
                          label="Open"
                          disabled={actionTradeId === trade.id}
                          onClick={() => tradeAction(trade.id, "OPEN")}
                        />
                        <ActionButton
                          label="Cancel"
                          danger
                          disabled={actionTradeId === trade.id}
                          onClick={() => tradeAction(trade.id, "CANCEL")}
                        />
                      </>
                    ) : null}

                    {trade.status === "OPEN" ? (
                      <ActionButton
                        label="Close"
                        disabled={actionTradeId === trade.id}
                        onClick={() => tradeAction(trade.id, "CLOSE")}
                      />
                    ) : null}

                    <ActionButton
                      label="Delete"
                      danger
                      disabled={actionTradeId === trade.id}
                      onClick={() => deleteTrade(trade.id)}
                    />
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7F8DA3]">
        {label}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none transition focus:border-[#00D9FF]/50"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7F8DA3]">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-[#090C12] px-5 py-4 text-white outline-none"
      >
        <option value="">Select...</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-[#7F8DA3]">
        {label}
      </p>
      <p className="mt-2 font-black text-white">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="rounded-full border border-[#D8C37A]/20 bg-[#D8C37A]/10 px-3 py-1 text-xs font-bold text-[#D8C37A]">
      {status}
    </span>
  );
}

function ActionButton({
  label,
  onClick,
  disabled,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl border px-3 py-2 text-xs font-bold transition disabled:opacity-50 ${
        danger
          ? "border-[#FF5D7D]/30 bg-[#FF5D7D]/10 text-[#FF5D7D]"
          : "border-[#00D9FF]/30 bg-[#00D9FF]/10 text-[#00D9FF]"
      }`}
    >
      {label}
    </button>
  );
}