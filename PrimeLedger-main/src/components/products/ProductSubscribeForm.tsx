"use client";

import { useMemo, useState } from "react";

export default function ProductSubscribeForm({
  productId,
  currency,
  minimumAmount,
  maximumAmount,
  interestRate,
  durationDays,
}: {
  productId: string;
  currency: string;
  minimumAmount: number;
  maximumAmount: number | null;
  interestRate: number;
  durationDays: number;
}) {
  const [amount, setAmount] = useState(String(minimumAmount));
  const [loading, setLoading] = useState(false);

  const numericAmount = Number(amount || 0);

  const expectedValue = useMemo(() => {
    if (!numericAmount || numericAmount <= 0) return 0;
    return numericAmount + numericAmount * (interestRate / 100);
  }, [numericAmount, interestRate]);

  const estimatedReturn = expectedValue - numericAmount;

  async function subscribe() {
    setLoading(true);

    const response = await fetch(`/api/products/${productId}/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: numericAmount }),
    });

    const data = await response.json();

    setLoading(false);

    if (!response.ok) {
      alert(data?.error || "Failed to subscribe.");
      return;
    }

    alert("Subscription created successfully.");
    window.location.href = "/my-products";
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#D8C37A]">
          Subscription Amount
        </p>

        <input
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          type="number"
          min={minimumAmount}
          max={maximumAmount || undefined}
          step="0.01"
          placeholder={`${currency} ${minimumAmount.toLocaleString()}`}
          className="mt-4 w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none transition placeholder:text-[#566174] focus:border-[#00D9FF]/50"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric
          label="Principal"
          value={`${currency} ${numericAmount.toLocaleString()}`}
        />

        <Metric
          label="Estimated Return"
          value={`${currency} ${estimatedReturn.toLocaleString()}`}
        />

        <Metric
          label="Expected Value"
          value={`${currency} ${expectedValue.toLocaleString()}`}
        />
      </div>

      <button
        type="button"
        onClick={subscribe}
        disabled={loading || numericAmount < minimumAmount}
        className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#00D9FF] via-[#6D5BFF] to-[#D8C37A] px-6 py-4 font-black text-black transition hover:scale-[1.01] disabled:pointer-events-none disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Subscription"}
      </button>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-[#7F8DA3]">
        {label}
      </p>

      <p className="mt-2 text-xl font-black text-[#D8C37A]">{value}</p>
    </div>
  );
}