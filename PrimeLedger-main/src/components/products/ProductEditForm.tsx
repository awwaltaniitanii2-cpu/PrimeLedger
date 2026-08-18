"use client";

import { useState } from "react";

type EditableProduct = {
  id: string;
  name: string;
  description: string;
  type: "SAVINGS" | "STAKING";
  currency: string;
  minimumAmount: string;
  maximumAmount: string;
  interestRate: string;
  durationDays: string;
  totalCapacity: string;
  allowEarlyExit: boolean;
  status: "ACTIVE" | "DISABLED" | "CLOSED";
};

export default function ProductEditForm({
  product,
}: {
  product: EditableProduct;
}) {
  const [form, setForm] = useState(product);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function update<K extends keyof EditableProduct>(
    key: K,
    value: EditableProduct[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function saveProduct() {
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`/api/products/${form.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to update product.");
      }

      setMessage("Product updated successfully.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to update product."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#D8C37A]">
        Product Editor
      </p>

      <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-white">
        Edit Product
      </h2>

      {error ? (
        <div className="mt-6 rounded-2xl border border-[#FF5D7D]/20 bg-[#FF5D7D]/10 px-5 py-4 text-sm text-[#FF5D7D]">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="mt-6 rounded-2xl border border-[#2FFFA7]/20 bg-[#2FFFA7]/10 px-5 py-4 text-sm text-[#2FFFA7]">
          {message}
        </div>
      ) : null}

      <div className="mt-7 space-y-4">
        <Field
          label="Product Name"
          value={form.name}
          onChange={(value) => update("name", value)}
        />

        <label className="block">
          <Label>Description</Label>
          <textarea
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
            className="mt-2 min-h-32 w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none transition focus:border-[#00D9FF]/50"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Type"
            value={form.type}
            options={["SAVINGS", "STAKING"]}
            onChange={(value) => update("type", value as "SAVINGS" | "STAKING")}
          />

          <Field
            label="Currency / Asset"
            value={form.currency}
            onChange={(value) => update("currency", value)}
          />

          <Field
            label="Minimum Amount"
            type="number"
            value={form.minimumAmount}
            onChange={(value) => update("minimumAmount", value)}
          />

          <Field
            label="Maximum Amount"
            type="number"
            value={form.maximumAmount}
            onChange={(value) => update("maximumAmount", value)}
          />

          <Field
            label="APY / APR %"
            type="number"
            value={form.interestRate}
            onChange={(value) => update("interestRate", value)}
          />

          <Field
            label="Duration Days"
            type="number"
            value={form.durationDays}
            onChange={(value) => update("durationDays", value)}
          />

          <Field
            label="Total Capacity"
            type="number"
            value={form.totalCapacity}
            onChange={(value) => update("totalCapacity", value)}
          />

          <Select
            label="Status"
            value={form.status}
            options={["ACTIVE", "DISABLED", "CLOSED"]}
            onChange={(value) =>
              update("status", value as "ACTIVE" | "DISABLED" | "CLOSED")
            }
          />
        </div>

        <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/25 px-5 py-4">
          <div>
            <p className="font-semibold text-white">Allow Early Exit</p>
            <p className="mt-1 text-xs leading-5 text-[#7F8DA3]">
              Clients may request to exit before maturity.
            </p>
          </div>

          <input
            type="checkbox"
            checked={form.allowEarlyExit}
            onChange={(event) => update("allowEarlyExit", event.target.checked)}
            className="h-5 w-5 accent-[#00D9FF]"
          />
        </label>

        <button
          type="button"
          onClick={saveProduct}
          disabled={loading}
          className="group relative mt-2 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#00D9FF] via-[#6D5BFF] to-[#D8C37A] px-6 py-4 font-black text-black transition hover:scale-[1.01] disabled:pointer-events-none disabled:opacity-50"
        >
          {loading ? "Saving Product..." : "Save Product"}
        </button>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7F8DA3]">
      {children}
    </p>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none transition focus:border-[#00D9FF]/50"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-[#090C12] px-5 py-4 text-white outline-none transition focus:border-[#00D9FF]/50"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}