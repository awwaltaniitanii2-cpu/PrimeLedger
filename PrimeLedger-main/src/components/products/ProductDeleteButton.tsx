"use client";

import { useState } from "react";

export default function ProductDeleteButton({
  productId,
}: {
  productId: string;
}) {
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  async function deleteProduct() {
    if (confirmText !== "DELETE") {
      alert("Type DELETE to confirm.");
      return;
    }

    setLoading(true);

    const response = await fetch(`/api/products/${productId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    setLoading(false);

    if (!response.ok) {
      alert(data?.error || "Failed to delete product.");
      return;
    }

    window.location.href = "/admin/products";
  }

  return (
    <div className="mt-8">
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7F8DA3]">
          Type DELETE to confirm
        </span>

        <input
          value={confirmText}
          onChange={(event) => setConfirmText(event.target.value)}
          placeholder="DELETE"
          className="mt-3 w-full max-w-md rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none transition placeholder:text-[#566174] focus:border-[#FF5D7D]/50"
        />
      </label>

      <button
        type="button"
        onClick={deleteProduct}
        disabled={loading || confirmText !== "DELETE"}
        className="mt-5 rounded-2xl border border-[#FF5D7D]/30 bg-[#FF5D7D]/10 px-6 py-4 font-black text-[#FF5D7D] transition hover:bg-[#FF5D7D]/20 disabled:pointer-events-none disabled:opacity-50"
      >
        {loading ? "Deleting..." : "Delete Product Permanently"}
      </button>
    </div>
  );
}