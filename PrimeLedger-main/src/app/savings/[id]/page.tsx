import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
};

type ProductRecord = Record<string, unknown>;

export default async function ProductDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    notFound();
  }

  const data = product as ProductRecord;

  const name = getString(data, ["name", "title"], "Product");
  const type = formatLabel(getString(data, ["type", "productType"], "Product"));
  const description = getString(data, ["description", "summary"], "");
  const status = getString(data, ["status"], "ACTIVE");
  const riskLevel = formatLabel(getString(data, ["riskLevel", "risk"], "Moderate"));

  const minInvestment = getNumber(data, [
    "minimumInvestment",
    "minInvestment",
    "minimumAmount",
    "minAmount",
  ]);

  const targetReturn = getNumber(data, [
    "targetReturn",
    "expectedReturn",
    "apy",
    "interestRate",
    "rate",
  ]);

  const termMonths = getNumber(data, ["termMonths", "durationMonths", "lockupMonths"]);
  const currency = getString(data, ["currency"], "USD");

  const features = getStringArray(data, ["features", "highlights", "benefits"]);
  const strategy = getString(data, ["strategy", "investmentStrategy"], "");
  const liquidity = getString(data, ["liquidity", "withdrawalTerms"], "");
  const createdAt = getDate(data, ["createdAt"]);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <Link
            href="/products"
            className="text-sm font-medium text-slate-400 transition hover:text-white"
          >
            ← Back to products
          </Link>
        </div>

        <section className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300">
                {type}
              </span>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
                {formatLabel(status)}
              </span>
              <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-300">
                {riskLevel} Risk
              </span>
            </div>

            <h1 className="mb-4 text-4xl font-semibold tracking-tight text-white">
              {name}
            </h1>

            {description ? (
              <p className="max-w-3xl text-base leading-7 text-slate-300">
                {description}
              </p>
            ) : (
              <p className="max-w-3xl text-base leading-7 text-slate-400">
                Detailed product information is being prepared.
              </p>
            )}

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Minimum"
                value={minInvestment ? formatMoney(minInvestment, currency) : "Available on request"}
              />
              <MetricCard
                label="Target return"
                value={targetReturn ? `${targetReturn}%` : "Variable"}
              />
              <MetricCard
                label="Term"
                value={termMonths ? `${termMonths} months` : "Flexible"}
              />
              <MetricCard label="Risk" value={riskLevel} />
            </div>

            <div className="mt-10 space-y-8">
              <DetailSection title="Product overview">
                <p>
                  {description ||
                    "This private wealth product is available to eligible PrimeLedger clients subject to review and approval."}
                </p>
              </DetailSection>

              {strategy ? (
                <DetailSection title="Investment strategy">
                  <p>{strategy}</p>
                </DetailSection>
              ) : null}

              {liquidity ? (
                <DetailSection title="Liquidity">
                  <p>{liquidity}</p>
                </DetailSection>
              ) : null}

              <DetailSection title="Key features">
                {features.length > 0 ? (
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {features.map((feature) => (
                      <li
                        key={feature}
                        className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-sm text-slate-300"
                      >
                        {feature}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    PrimeLedger products are reviewed for eligibility, risk suitability,
                    and client allocation before approval.
                  </p>
                )}
              </DetailSection>

              <DetailSection title="Important information">
                <p>
                  Product availability is subject to eligibility, internal approval,
                  allocation limits, and market conditions. Returns are not guaranteed
                  unless explicitly stated in the final product documentation.
                </p>
              </DetailSection>
            </div>
          </div>

          <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-white">Subscribe to this product</h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Submit an allocation request for review. Your subscription will remain
              pending until approved by PrimeLedger administrators.
            </p>

            <div className="mt-6 space-y-4 rounded-2xl bg-slate-900/70 p-5">
              <SummaryRow label="Product" value={name} />
              <SummaryRow label="Type" value={type} />
              <SummaryRow
                label="Minimum"
                value={minInvestment ? formatMoney(minInvestment, currency) : "On request"}
              />
              <SummaryRow
                label="Target return"
                value={targetReturn ? `${targetReturn}%` : "Variable"}
              />
              <SummaryRow label="Risk level" value={riskLevel} />
            </div>

            <Link
              href={`/products/${id}/subscribe`}
              className="mt-6 flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              Request subscription
            </Link>

            <p className="mt-4 text-xs leading-5 text-slate-500">
              Subscription requests are non-binding until reviewed, accepted, and
              confirmed by PrimeLedger.
            </p>

            {createdAt ? (
              <p className="mt-6 border-t border-white/10 pt-4 text-xs text-slate-500">
                Listed {createdAt.toLocaleDateString()}
              </p>
            ) : null}
          </aside>
        </section>
      </div>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold text-white">{title}</h2>
      <div className="text-sm leading-7 text-slate-300">{children}</div>
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-200">{value}</span>
    </div>
  );
}

function getString(
  source: ProductRecord,
  keys: string[],
  fallback = "",
): string {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return fallback;
}

function getNumber(source: ProductRecord, keys: string[]): number | null {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
      return Number(value);
    }

    if (
      value &&
      typeof value === "object" &&
      "toNumber" in value &&
      typeof value.toNumber === "function"
    ) {
      return value.toNumber();
    }
  }

  return null;
}

function getDate(source: ProductRecord, keys: string[]): Date | null {
  for (const key of keys) {
    const value = source[key];

    if (value instanceof Date) {
      return value;
    }

    if (typeof value === "string") {
      const date = new Date(value);

      if (!Number.isNaN(date.getTime())) {
        return date;
      }
    }
  }

  return null;
}

function getStringArray(source: ProductRecord, keys: string[]): string[] {
  for (const key of keys) {
    const value = source[key];

    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === "string");
    }

    if (typeof value === "string" && value.trim()) {
      return value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function formatLabel(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}