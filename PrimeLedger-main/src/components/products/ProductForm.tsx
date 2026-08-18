"use client";

import { useState } from "react";

export type ProductFormValues = {
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

const emptyForm: ProductFormValues = {
  name: "",
  description: "",
  type: "SAVINGS",
  currency: "USD",
  minimumAmount: "",
  maximumAmount: "",
  interestRate: "",
  durationDays: "",
  totalCapacity: "",
  allowEarlyExit: false,
  status: "ACTIVE",
};

export default function ProductForm({
  onCreated,
}: {
  onCreated: () => void;
}) {
  const [form, setForm] = useState<ProductFormValues>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function update<K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function createProduct() {
    setMessage("");
    setError("");

    if (
      !form.name.trim() ||
      !form.description.trim() ||
      !form.minimumAmount ||
      !form.interestRate ||
      !form.durationDays
    ) {
      setError("Please complete all required fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to create product.");
      }

      setMessage("Product created successfully.");
      setForm(emptyForm);
      onCreated();
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Failed to create product."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#D8C37A]">
        Product Builder
      </p>

      <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-white">
        Create Product
      </h2>

      <p className="mt-4 text-sm leading-7 text-[#7F8DA3]">
        Create savings and staking products that clients can subscribe to from
        their PrimeLedger portal.
      </p>

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
          placeholder="Prime Savings 12M"
          value={form.name}
          onChange={(value) => update("name", value)}
        />

        <div>
          <Label>Description</Label>

          <textarea
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
            placeholder="Describe the savings or staking product..."
            className="mt-2 min-h-32 w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none transition placeholder:text-[#566174] focus:border-[#00D9FF]/50 focus:bg-black/40"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Type"
            value={form.type}
            onChange={(value) => update("type", value as "SAVINGS" | "STAKING")}
            options={["SAVINGS", "STAKING"]}
          />

          <Field
            label="Currency / Asset"
            placeholder="USD or ETH"
            value={form.currency}
            onChange={(value) => update("currency", value)}
          />

          <Field
            label="Minimum Amount"
            placeholder="1000"
            type="number"
            value={form.minimumAmount}
            onChange={(value) => update("minimumAmount", value)}
          />

          <Field
            label="Maximum Amount"
            placeholder="Optional"
            type="number"
            value={form.maximumAmount}
            onChange={(value) => update("maximumAmount", value)}
          />

          <Field
            label="APY / APR %"
            placeholder="8.5"
            type="number"
            value={form.interestRate}
            onChange={(value) => update("interestRate", value)}
          />

          <Field
            label="Duration Days"
            placeholder="365"
            type="number"
            value={form.durationDays}
            onChange={(value) => update("durationDays", value)}
          />

          <Field
            label="Total Capacity"
            placeholder="Optional"
            type="number"
            value={form.totalCapacity}
            onChange={(value) => update("totalCapacity", value)}
          />

          <Select
            label="Status"
            value={form.status}
            onChange={(value) =>
              update("status", value as "ACTIVE" | "DISABLED" | "CLOSED")
            }
            options={["ACTIVE", "DISABLED", "CLOSED"]}
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
          onClick={createProduct}
          disabled={loading}
          className="group relative mt-2 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#00D9FF] via-[#6D5BFF] to-[#D8C37A] px-6 py-4 font-black text-black shadow-[0_0_40px_rgba(0,217,255,.18)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_70px_rgba(216,195,122,.24)] disabled:pointer-events-none disabled:opacity-50"
        >
          <span className="absolute inset-0 translate-x-[-120%] bg-white/40 blur-xl transition duration-700 group-hover:translate-x-[120%]" />

          <span className="relative z-10">
            {loading ? "Creating Product..." : "Create Product"}
          </span>
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
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none transition placeholder:text-[#566174] focus:border-[#00D9FF]/50 focus:bg-black/40"
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