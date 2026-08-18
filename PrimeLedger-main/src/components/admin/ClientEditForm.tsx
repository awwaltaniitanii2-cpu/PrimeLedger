"use client";

import { useState } from "react";

type ClientStatus = "ACTIVE" | "REVIEW" | "SUSPENDED" | "CLOSED";

type EditableClient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  status: ClientStatus;
};

export default function ClientEditForm({
  client,
}: {
  client: EditableClient;
}) {
  const [form, setForm] = useState(client);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function update<K extends keyof EditableClient>(
    key: K,
    value: EditableClient[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function saveClient() {
    setMessage("");
    setError("");

    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`/api/clients/${form.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          country: form.country,
          status: form.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to update client.");
      }

      setMessage("Client updated successfully.");
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Failed to update client."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#D8C37A]">
        Client Editor
      </p>

      <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-white">
        Account Information
      </h2>

      <p className="mt-4 max-w-2xl text-sm leading-7 text-[#7F8DA3]">
        Update client identity, contact information, and operational account
        status.
      </p>

      {error ? (
        <div className="mt-6 rounded-2xl border border-[#FF5D7D]/20 bg-[#FF5D7D]/10 px-5 py-4 text-sm font-semibold text-[#FF5D7D]">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="mt-6 rounded-2xl border border-[#2FFFA7]/20 bg-[#2FFFA7]/10 px-5 py-4 text-sm font-semibold text-[#2FFFA7]">
          {message}
        </div>
      ) : null}

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Field
          label="Full Name"
          value={form.name}
          onChange={(value) => update("name", value)}
        />

        <Field
          label="Email Address"
          value={form.email}
          type="email"
          onChange={(value) => update("email", value)}
        />

        <Field
          label="Phone Number"
          value={form.phone}
          onChange={(value) => update("phone", value)}
        />

        <Field
          label="Country"
          value={form.country}
          onChange={(value) => update("country", value)}
        />

        <SelectField
          label="Client Status"
          value={form.status}
          onChange={(value) => update("status", value as ClientStatus)}
          options={["ACTIVE", "REVIEW", "SUSPENDED", "CLOSED"]}
        />
      </div>

      <div className="mt-8 rounded-[26px] border border-white/10 bg-black/25 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D8C37A]">
          Status Effects
        </p>

        <div className="mt-4 grid gap-3 text-sm text-[#7F8DA3] md:grid-cols-2">
          <p>
            <span className="font-bold text-[#2FFFA7]">ACTIVE:</span> Client
            account is available normally.
          </p>

          <p>
            <span className="font-bold text-[#D8C37A]">REVIEW:</span> Account
            requires administrator attention.
          </p>

          <p>
            <span className="font-bold text-[#FF5D7D]">SUSPENDED:</span> Client
            access should be treated as restricted.
          </p>

          <p>
            <span className="font-bold text-slate-300">CLOSED:</span> Account is
            no longer operational.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={saveClient}
        disabled={loading}
        className="group relative mt-8 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#00D9FF] via-[#6D5BFF] to-[#D8C37A] px-6 py-4 font-black text-black shadow-[0_0_40px_rgba(0,217,255,.18)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_70px_rgba(216,195,122,.24)] disabled:pointer-events-none disabled:opacity-50"
      >
        <span className="absolute inset-0 translate-x-[-120%] bg-white/40 blur-xl transition duration-700 group-hover:translate-x-[120%]" />

        <span className="relative z-10">
          {loading ? "Saving Client..." : "Save Client Changes"}
        </span>
      </button>
    </div>
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
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7F8DA3]">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none transition focus:border-[#00D9FF]/50 focus:bg-black/40"
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
  options: string[];
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7F8DA3]">
        {label}
      </span>

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