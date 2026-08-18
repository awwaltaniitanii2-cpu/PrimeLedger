"use client";

import { useState } from "react";

type SubscriptionStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";

export default function SubscriptionStatusActions({
  subscriptionId,
  currentStatus,
}: {
  subscriptionId: string;
  currentStatus: SubscriptionStatus;
}) {
  const [status, setStatus] = useState<SubscriptionStatus>(currentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function updateStatus(nextStatus: SubscriptionStatus) {
    if (nextStatus === status) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/product-subscriptions/${subscriptionId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: nextStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to update subscription status."
        );
      }

      setStatus(nextStatus);
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Failed to update subscription status."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-w-[220px]">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => updateStatus("ACTIVE")}
          disabled={loading || status === "ACTIVE"}
          className="rounded-xl border border-[#2FFFA7]/30 bg-[#2FFFA7]/10 px-3 py-2 text-xs font-bold text-[#2FFFA7] transition hover:bg-[#2FFFA7]/20 disabled:pointer-events-none disabled:opacity-40"
        >
          Active
        </button>

        <button
          type="button"
          onClick={() => updateStatus("COMPLETED")}
          disabled={loading || status === "COMPLETED"}
          className="rounded-xl border border-[#D8C37A]/30 bg-[#D8C37A]/10 px-3 py-2 text-xs font-bold text-[#D8C37A] transition hover:bg-[#D8C37A]/20 disabled:pointer-events-none disabled:opacity-40"
        >
          Complete
        </button>

        <button
          type="button"
          onClick={() => updateStatus("CANCELLED")}
          disabled={loading || status === "CANCELLED"}
          className="rounded-xl border border-[#FF5D7D]/30 bg-[#FF5D7D]/10 px-3 py-2 text-xs font-bold text-[#FF5D7D] transition hover:bg-[#FF5D7D]/20 disabled:pointer-events-none disabled:opacity-40"
        >
          Cancel
        </button>
      </div>

      {loading ? (
        <p className="mt-2 text-xs text-[#7F8DA3]">Updating status...</p>
      ) : null}

      {error ? (
        <p className="mt-2 text-xs text-[#FF5D7D]">{error}</p>
      ) : null}
    </div>
  );
}