"use client";

export type ProductRow = {
  id: string;
  name: string;
  description: string;
  type: "SAVINGS" | "STAKING";
  currency: string;
  minimumAmount: string;
  maximumAmount?: string | null;
  interestRate: string;
  durationDays: number;
  totalCapacity?: string | null;
  investedTotal: string;
  allowEarlyExit: boolean;
  status: "ACTIVE" | "DISABLED" | "CLOSED";
};

export default function ProductTable({
  products,
  loading,
  onRefresh,
}: {
  products: ProductRow[];
  loading: boolean;
  onRefresh: () => void;
}) {
  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#D8C37A]">
            Product Registry
          </p>

          <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-white">
            Savings & Staking
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#7F8DA3]">
            Active products available to PrimeLedger clients.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-white transition hover:border-[#00D9FF]/30 hover:bg-[#00D9FF]/10 hover:text-[#00D9FF] disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="mt-8 space-y-5">
        {loading ? (
          <div className="space-y-5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-52 animate-pulse rounded-[30px] border border-white/10 bg-white/[0.035]"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-[30px] border border-dashed border-white/10 bg-black/20 p-10 text-center">
            <p className="text-3xl font-black text-white">No Products Yet</p>

            <p className="mt-3 text-sm text-[#7F8DA3]">
              Create your first savings or staking product using the product
              builder.
            </p>
          </div>
        ) : (
          products.map((product) => {
            const capacity = Number(product.totalCapacity || 0);
            const invested = Number(product.investedTotal || 0);
            const progress =
              capacity > 0 ? Math.min((invested / capacity) * 100, 100) : 0;

            return (
              <article
                key={product.id}
                className="rounded-[30px] border border-white/10 bg-black/25 p-6 transition duration-300 hover:border-[#00D9FF]/20 hover:bg-white/[0.035]"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-xs uppercase tracking-[0.3em] text-[#D8C37A]">
                      {product.type}
                    </p>

                    <h3 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white">
                      {product.name}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-[#7F8DA3]">
                      {product.description}
                    </p>
                  </div>

                  <StatusBadge status={product.status} />
                </div>

                <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <Metric
                    label="APY / APR"
                    value={`${Number(product.interestRate || 0)}%`}
                    tone="gold"
                  />

                  <Metric
                    label="Minimum"
                    value={`${product.currency} ${Number(
                      product.minimumAmount || 0
                    ).toLocaleString()}`}
                  />

                  <Metric
                    label="Duration"
                    value={`${product.durationDays} days`}
                  />

                  <Metric
                    label="Early Exit"
                    value={product.allowEarlyExit ? "Allowed" : "Locked"}
                    tone={product.allowEarlyExit ? "success" : "default"}
                  />
                </div>

                {product.totalCapacity ? (
                  <div className="mt-7 rounded-[24px] border border-white/10 bg-black/25 p-5">
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-[#7F8DA3]">Funding Capacity</span>

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
                      {product.currency} {invested.toLocaleString()} funded of{" "}
                      {product.currency} {capacity.toLocaleString()}
                    </p>
                  </div>
                ) : null}

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href={`/admin/products/${product.id}/edit`}
                    className="rounded-xl border border-[#00D9FF]/30 bg-[#00D9FF]/10 px-4 py-2 text-sm font-bold text-[#00D9FF] transition hover:bg-[#00D9FF]/20"
                  >
                    Edit
                  </a>

                  <a
                    href={`/admin/products/${product.id}/approvals`}
                    className="rounded-xl border border-[#D8C37A]/30 bg-[#D8C37A]/10 px-4 py-2 text-sm font-bold text-[#D8C37A] transition hover:bg-[#D8C37A]/20"
                  >
                    Subscribers
                  </a>

                  <a
                    href={`/admin/products/${product.id}/delete`}
                    className="rounded-xl border border-[#FF5D7D]/30 bg-[#FF5D7D]/10 px-4 py-2 text-sm font-bold text-[#FF5D7D] transition hover:bg-[#FF5D7D]/20"
                  >
                    Delete
                  </a>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "gold" | "success";
}) {
  const valueClass =
    tone === "gold"
      ? "text-[#D8C37A]"
      : tone === "success"
      ? "text-[#2FFFA7]"
      : "text-white";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-[#7F8DA3]">
        {label}
      </p>

      <p className={`mt-2 text-xl font-black ${valueClass}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "ACTIVE"
      ? "border-[#2FFFA7]/20 bg-[#2FFFA7]/10 text-[#2FFFA7]"
      : status === "DISABLED"
      ? "border-[#D8C37A]/20 bg-[#D8C37A]/10 text-[#D8C37A]"
      : "border-[#FF5D7D]/20 bg-[#FF5D7D]/10 text-[#FF5D7D]";

  return (
    <span
      className={`inline-flex h-fit rounded-full border px-4 py-2 text-xs font-bold ${styles}`}
    >
      {status}
    </span>
  );
}