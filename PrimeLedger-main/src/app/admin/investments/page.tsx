"use client";

import { useCallback, useEffect, useState } from "react";
import PageShell from "@/components/ui/PageShell";
import GlassPanel from "@/components/ui/GlassPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import GlowButton from "@/components/ui/GlowButton";

type Investment = {
  id: string;
  title: string;
  description: string;
  minimumAmount: string;
  expectedROI: string;
  durationDays: number;
  totalCapacity: string;
  investedTotal: string;
  status: string;
};

type InvestmentForm = {
  title: string;
  description: string;
  minimumAmount: string;
  expectedROI: string;
  durationDays: string;
  totalCapacity: string;
  status: string;
};

const emptyForm: InvestmentForm = {
  title: "",
  description: "",
  minimumAmount: "",
  expectedROI: "",
  durationDays: "",
  totalCapacity: "",
  status: "OPEN",
};

export default function AdminInvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingInvestments, setLoadingInvestments] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState<InvestmentForm>(emptyForm);

  const loadInvestments = useCallback(async () => {
    setLoadingInvestments(true);
    setError("");

    try {
      const res = await fetch("/api/investments", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to load investments.");
      }

      setInvestments(data.investments || []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load investments."
      );
    } finally {
      setLoadingInvestments(false);
    }
  }, []);

  async function createInvestment() {
    setMessage("");
    setError("");

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.minimumAmount ||
      !form.expectedROI ||
      !form.durationDays ||
      !form.totalCapacity
    ) {
      setError("Complete all investment fields before creating an opportunity.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/investments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to create investment.");
      }

      setForm(emptyForm);
      setMessage("Investment opportunity created successfully.");

      await loadInvestments();
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Failed to create investment."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadInvestments();
  }, [loadInvestments]);

  const totalCapacity = investments.reduce(
    (sum, investment) => sum + Number(investment.totalCapacity || 0),
    0
  );

  const investedCapital = investments.reduce(
    (sum, investment) => sum + Number(investment.investedTotal || 0),
    0
  );

  const openInvestments = investments.filter(
    (investment) => investment.status === "OPEN"
  ).length;

  return (
    <PageShell>
      <div className="space-y-8 pb-12">
        <GlassPanel className="p-8 lg:p-10">
          <SectionHeader
            eyebrow="PrimeLedger Administration"
            title="Early Invest Manager"
            description="Create, monitor, and manage private capital opportunities available to PrimeLedger clients."
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

        <section className="grid gap-5 md:grid-cols-3">
          <SummaryMetric
            label="Opportunities"
            value={String(investments.length)}
            description="Total opportunities"
          />

          <SummaryMetric
            label="Open"
            value={String(openInvestments)}
            description="Available to clients"
            tone="success"
          />

          <SummaryMetric
            label="Total Capacity"
            value={`$${totalCapacity.toLocaleString()}`}
            description={`$${investedCapital.toLocaleString()} currently funded`}
            tone="gold"
          />
        </section>

        <section className="grid gap-8 xl:grid-cols-[420px_1fr]">
          <GlassPanel className="h-fit p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#D8C37A]">
              New Allocation
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-white">
              Create Opportunity
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#7F8DA3]">
              Publish a new private investment opportunity to the PrimeLedger
              client marketplace.
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
                label="Investment Title"
                placeholder="AI Infrastructure Fund"
                value={form.title}
                onChange={(value) => setForm({ ...form, title: value })}
              />

              <div>
                <FieldLabel>Description</FieldLabel>

                <textarea
                  placeholder="Describe the investment opportunity..."
                  value={form.description}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description: event.target.value,
                    })
                  }
                  className="mt-2 min-h-36 w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none transition placeholder:text-[#566174] focus:border-[#00D9FF]/50 focus:bg-black/40"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Minimum Amount"
                  placeholder="10000"
                  type="number"
                  value={form.minimumAmount}
                  onChange={(value) =>
                    setForm({ ...form, minimumAmount: value })
                  }
                />

                <Field
                  label="Expected ROI %"
                  placeholder="18"
                  type="number"
                  value={form.expectedROI}
                  onChange={(value) =>
                    setForm({ ...form, expectedROI: value })
                  }
                />

                <Field
                  label="Duration Days"
                  placeholder="365"
                  type="number"
                  value={form.durationDays}
                  onChange={(value) =>
                    setForm({ ...form, durationDays: value })
                  }
                />

                <Field
                  label="Total Capacity"
                  placeholder="1000000"
                  type="number"
                  value={form.totalCapacity}
                  onChange={(value) =>
                    setForm({ ...form, totalCapacity: value })
                  }
                />
              </div>

              <div>
                <FieldLabel>Status</FieldLabel>

                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.value })
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#090C12] px-5 py-4 text-white outline-none transition focus:border-[#00D9FF]/50"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="PAUSED">PAUSED</option>
                </select>
              </div>

              <button
                type="button"
                onClick={createInvestment}
                disabled={loading}
                className="group relative mt-2 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#00D9FF] via-[#6D5BFF] to-[#D8C37A] px-6 py-4 font-black text-black shadow-[0_0_40px_rgba(0,217,255,.18)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_70px_rgba(216,195,122,.24)] disabled:pointer-events-none disabled:opacity-50"
              >
                <span className="absolute inset-0 translate-x-[-120%] bg-white/40 blur-xl transition duration-700 group-hover:translate-x-[120%]" />

                <span className="relative z-10">
                  {loading ? "Creating Opportunity..." : "Create Investment"}
                </span>
              </button>
            </div>
          </GlassPanel>

          <GlassPanel className="p-7">
            <SectionHeader
              eyebrow="Live Database"
              title="Investment Opportunities"
              description="Current private capital opportunities recorded in PrimeLedger."
              action={
                <button
                  type="button"
                  onClick={() => void loadInvestments()}
                  disabled={loadingInvestments}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-white transition hover:border-[#00D9FF]/30 hover:bg-[#00D9FF]/10 hover:text-[#00D9FF] disabled:opacity-50"
                >
                  {loadingInvestments ? "Refreshing..." : "Refresh"}
                </button>
              }
            />

            <div className="mt-8 space-y-5">
              {loadingInvestments ? (
                <LoadingState />
              ) : investments.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-white/10 bg-black/20 p-10 text-center">
                  <p className="text-2xl font-black text-white">
                    No Investments Yet
                  </p>

                  <p className="mt-3 text-sm text-[#7F8DA3]">
                    Create the first opportunity using the investment manager.
                  </p>
                </div>
              ) : (
                investments.map((investment) => {
                  const capacity = Number(investment.totalCapacity || 0);
                  const funded = Number(investment.investedTotal || 0);

                  const progress =
                    capacity > 0
                      ? Math.min((funded / capacity) * 100, 100)
                      : 0;

                  return (
                    <article
                      key={investment.id}
                      className="rounded-[30px] border border-white/10 bg-black/25 p-6 transition duration-300 hover:border-[#00D9FF]/20 hover:bg-white/[0.035]"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-2xl">
                          <p className="text-xs uppercase tracking-[0.3em] text-[#D8C37A]">
                            Private Opportunity
                          </p>

                          <h3 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white">
                            {investment.title}
                          </h3>

                          <p className="mt-3 text-sm leading-7 text-[#7F8DA3]">
                            {investment.description}
                          </p>
                        </div>

                        <StatusBadge status={investment.status} />
                      </div>

                      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <Metric
                          label="Minimum"
                          value={`$${Number(
                            investment.minimumAmount || 0
                          ).toLocaleString()}`}
                        />

                        <Metric
                          label="Expected ROI"
                          value={`${Number(investment.expectedROI || 0)}%`}
                        />

                        <Metric
                          label="Duration"
                          value={`${investment.durationDays} days`}
                        />

                        <Metric
                          label="Capacity"
                          value={`$${capacity.toLocaleString()}`}
                        />
                      </div>

                      <div className="mt-7 rounded-[24px] border border-white/10 bg-black/25 p-5">
                        <div className="flex items-center justify-between gap-4 text-sm">
                          <span className="text-[#7F8DA3]">
                            Funding Progress
                          </span>

                          <span className="font-black text-[#D8C37A]">
                            {progress.toFixed(0)}%
                          </span>
                        </div>

                        <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#00D9FF] via-[#6D5BFF] to-[#D8C37A]"
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        <p className="mt-3 text-xs text-[#7F8DA3]">
                          ${funded.toLocaleString()} funded of $
                          {capacity.toLocaleString()}
                        </p>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </GlassPanel>
        </section>
      </div>
    </PageShell>
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
    <div>
      <FieldLabel>{label}</FieldLabel>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none transition placeholder:text-[#566174] focus:border-[#00D9FF]/50 focus:bg-black/40"
      />
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7F8DA3]">
      {children}
    </p>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-[#7F8DA3]">
        {label}
      </p>

      <p className="mt-2 text-xl font-black text-[#D8C37A]">{value}</p>
    </div>
  );
}

function SummaryMetric({
  label,
  value,
  description,
  tone = "default",
}: {
  label: string;
  value: string;
  description: string;
  tone?: "default" | "gold" | "success";
}) {
  const valueClass =
    tone === "gold"
      ? "text-[#D8C37A]"
      : tone === "success"
        ? "text-[#2FFFA7]"
        : "text-white";

  return (
    <GlassPanel className="p-6">
      <p className="text-xs uppercase tracking-[0.28em] text-[#7F8DA3]">
        {label}
      </p>

      <p className={`mt-4 text-4xl font-black tracking-tight ${valueClass}`}>
        {value}
      </p>

      <p className="mt-3 text-sm text-[#7F8DA3]">{description}</p>
    </GlassPanel>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "OPEN"
      ? "border-[#2FFFA7]/20 bg-[#2FFFA7]/10 text-[#2FFFA7]"
      : status === "PAUSED"
        ? "border-[#D8C37A]/20 bg-[#D8C37A]/10 text-[#D8C37A]"
        : "border-white/10 bg-white/[0.05] text-[#7F8DA3]";

  return (
    <span
      className={`inline-flex h-fit rounded-full border px-4 py-2 text-xs font-bold ${styles}`}
    >
      {status}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="space-y-5">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-52 animate-pulse rounded-[30px] border border-white/10 bg-white/[0.035]"
        />
      ))}
    </div>
  );
}