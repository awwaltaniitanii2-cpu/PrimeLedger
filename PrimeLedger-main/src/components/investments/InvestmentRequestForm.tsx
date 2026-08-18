"use client";

import { useState } from "react";

export default function InvestmentRequestForm({
  investmentId,
  minimumAmount,
}: {
  investmentId: string;
  minimumAmount: number;
}) {
  const [amount, setAmount] = useState(String(minimumAmount));
  const [loading, setLoading] = useState(false);

  async function submitRequest() {
    setLoading(true);

    const res = await fetch("/api/investments/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        investmentId,
        amount: Number(amount),
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to request investment");
      return;
    }

    alert("Investment request submitted successfully.");
    window.location.href = "/investments";
  }

  return (
    <div className="mt-8 rounded-[28px] border border-white/10 bg-black/30 p-6">
      <p className="text-sm text-emerald-400">Request Investment</p>

      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        type="number"
        min={minimumAmount}
        className="mt-4 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none focus:border-emerald-400"
      />

      <button
        onClick={submitRequest}
        disabled={loading}
        className="mt-4 w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-yellow-500 px-6 py-4 font-black text-black disabled:opacity-60"
      >
        {loading ? "Submitting..." : "Submit Investment Request"}
      </button>
    </div>
  );
}