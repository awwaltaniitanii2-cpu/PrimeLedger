"use client";

import { useState } from "react";
import PageShell from "@/components/ui/PageShell";
import GlassPanel from "@/components/ui/GlassPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import GlowButton from "@/components/ui/GlowButton";

type ClientForm = {
  name: string;
  email: string;
  phone: string;
  country: string;
  username: string;
  password: string;
  initialCapital: string;
  accountType: string;
  riskProfile: string;
};

const emptyForm: ClientForm = {
  name: "",
  email: "",
  phone: "",
  country: "",
  username: "",
  password: "",
  initialCapital: "",
  accountType: "Standard",
  riskProfile: "Moderate",
};

export default function CreateClientPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ClientForm>(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateForm(field: keyof ClientForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function createClient() {
    setMessage("");
    setError("");

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.username.trim() ||
      !form.password.trim()
    ) {
      setError("Name, email, username, and password are required.");
      return;
    }

    if (
      form.initialCapital &&
      (!Number.isFinite(Number(form.initialCapital)) ||
        Number(form.initialCapital) < 0)
    ) {
      setError("Initial capital must be a valid positive amount.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          initialCapital: Number(form.initialCapital || 0),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to create client.");
      }

      setMessage("Client account created successfully.");
      setForm(emptyForm);
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Failed to create client."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <div className="space-y-8 pb-12">
        <GlassPanel className="p-8 lg:p-10">
          <SectionHeader
            eyebrow="PrimeLedger Administration"
            title="Client Onboarding"
            description="Create a private client profile, configure platform access, assign initial capital, and provision the client's first trading account."
            action={
              <GlowButton
                href="/admin"
                className="from-white/15 via-white/10 to-white/5 text-white"
              >
                Admin Dashboard
              </GlowButton>
            }
          />
        </GlassPanel>

        {error ? (
          <div className="rounded-2xl border border-[#FF5D7D]/20 bg-[#FF5D7D]/10 px-6 py-4 text-sm font-semibold text-[#FF5D7D]">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="rounded-2xl border border-[#2FFFA7]/20 bg-[#2FFFA7]/10 px-6 py-4 text-sm font-semibold text-[#2FFFA7]">
            {message}
          </div>
        ) : null}

        <section className="grid gap-8 xl:grid-cols-[1.35fr_0.65fr]">
          <GlassPanel className="p-7">
            <PanelHeading
              eyebrow="Identity"
              title="Client Information"
              description="Primary identity and contact details for the new PrimeLedger client."
            />

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <Field
                label="Full Name"
                placeholder="John Smith"
                value={form.name}
                onChange={(value) => updateForm("name", value)}
              />

              <Field
                label="Email Address"
                placeholder="john@example.com"
                type="email"
                value={form.email}
                onChange={(value) => updateForm("email", value)}
              />

              <Field
                label="Phone Number"
                placeholder="+1 555 000 0000"
                type="tel"
                value={form.phone}
                onChange={(value) => updateForm("phone", value)}
              />

              <Field
                label="Country"
                placeholder="United States"
                value={form.country}
                onChange={(value) => updateForm("country", value)}
              />
            </div>
          </GlassPanel>

          <GlassPanel className="p-7">
            <PanelHeading
              eyebrow="Capital"
              title="Account Funding"
              description="Configure the client's initial trading account."
            />

            <div className="mt-7 space-y-5">
              <Field
                label="Initial Capital"
                placeholder="100000"
                type="number"
                value={form.initialCapital}
                onChange={(value) => updateForm("initialCapital", value)}
              />

              <SelectField
                label="Account Type"
                value={form.accountType}
                onChange={(value) => updateForm("accountType", value)}
                options={["Standard", "Premium", "Institutional"]}
              />

              <SelectField
                label="Risk Profile"
                value={form.riskProfile}
                onChange={(value) => updateForm("riskProfile", value)}
                options={["Conservative", "Moderate", "Aggressive"]}
              />
            </div>
          </GlassPanel>
        </section>

        <section className="grid gap-8 xl:grid-cols-2">
          <GlassPanel className="p-7">
            <PanelHeading
              eyebrow="Authentication"
              title="Access Credentials"
              description="Create the credentials the client will use to enter PrimeLedger."
            />

            <div className="mt-7 space-y-5">
              <Field
                label="Username"
                placeholder="client.username"
                autoComplete="off"
                value={form.username}
                onChange={(value) => updateForm("username", value)}
              />

              <Field
                label="Temporary Password"
                placeholder="Enter a secure password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(value) => updateForm("password", value)}
              />
            </div>

            <div className="mt-6 rounded-[24px] border border-[#D8C37A]/15 bg-[#D8C37A]/[0.05] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D8C37A]">
                Access Security
              </p>

              <p className="mt-3 text-sm leading-6 text-[#7F8DA3]">
                Use a unique temporary password and transmit credentials to the
                client through an approved secure channel.
              </p>
            </div>
          </GlassPanel>

          <GlassPanel className="p-7">
            <PanelHeading
              eyebrow="Entitlements"
              title="Platform Access"
              description="Core PrimeLedger client capabilities enabled after onboarding."
            />

            <div className="mt-7 space-y-3">
              <Permission
                title="Portfolio Dashboard"
                description="Capital balances and account performance."
              />

              <Permission
                title="Early Invest"
                description="Private investment opportunity access."
              />

              <Permission
                title="Live Markets"
                description="PrimeLedger market terminal access."
              />

              <Permission
                title="Activity Monitoring"
                description="Account transaction and capital history."
              />

              <Permission
                title="Trading Accounts"
                description="Connected portfolio account visibility."
              />
            </div>
          </GlassPanel>
        </section>

        <GlassPanel className="p-7">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#D8C37A]">
                Finalize Onboarding
              </p>

              <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-white">
                Provision Client Account
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#7F8DA3]">
                Creating the account will register the client, provision their
                PrimeLedger login, and create the initial capital account using
                the configuration above.
              </p>
            </div>

            <button
              type="button"
              onClick={createClient}
              disabled={loading}
              className="group relative min-w-[240px] overflow-hidden rounded-2xl bg-gradient-to-r from-[#00D9FF] via-[#6D5BFF] to-[#D8C37A] px-8 py-4 font-black text-black shadow-[0_0_40px_rgba(0,217,255,.18)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_70px_rgba(216,195,122,.24)] disabled:pointer-events-none disabled:opacity-50"
            >
              <span className="absolute inset-0 translate-x-[-120%] bg-white/40 blur-xl transition duration-700 group-hover:translate-x-[120%]" />

              <span className="relative z-10">
                {loading ? "Creating Client..." : "Create Client Account"}
              </span>
            </button>
          </div>
        </GlassPanel>
      </div>
    </PageShell>
  );
}

function PanelHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#D8C37A]">
        {eyebrow}
      </p>

      <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white">
        {title}
      </h2>

      <p className="mt-3 max-w-2xl text-sm leading-7 text-[#7F8DA3]">
        {description}
      </p>
    </div>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
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
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none transition placeholder:text-[#566174] focus:border-[#00D9FF]/50 focus:bg-black/40"
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

function Permission({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between gap-5 rounded-2xl border border-white/10 bg-black/20 px-5 py-4">
      <div>
        <p className="font-semibold text-white">{title}</p>
        <p className="mt-1 text-xs leading-5 text-[#7F8DA3]">{description}</p>
      </div>

      <span className="shrink-0 rounded-full border border-[#2FFFA7]/20 bg-[#2FFFA7]/10 px-3 py-1 text-xs font-bold text-[#2FFFA7]">
        ENABLED
      </span>
    </div>
  );
}