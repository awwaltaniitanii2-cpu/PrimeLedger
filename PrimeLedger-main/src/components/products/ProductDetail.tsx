import GlassPanel from "@/components/ui/GlassPanel";
import GlowButton from "@/components/ui/GlowButton";

export type ProductDetailData = {
  id: string;
  name: string;
  description: string;
  type: "SAVINGS" | "STAKING";
  currency: string;
  minimumAmount: unknown;
  maximumAmount: unknown;
  interestRate: unknown;
  durationDays: number;
  totalCapacity: unknown;
  investedTotal: unknown;
  allowEarlyExit: boolean;
  status: string;
};

export default function ProductDetail({
  product,
  backHref,
  backLabel,
}: {
  product: ProductDetailData;
  backHref: string;
  backLabel: string;
}) {
  const capacity = Number(product.totalCapacity || 0);
  const invested = Number(product.investedTotal || 0);
  const progress =
    capacity > 0 ? Math.min((invested / capacity) * 100, 100) : 0;

  const rateLabel = product.type === "STAKING" ? "APR" : "APY";
  const actionLabel =
    product.type === "STAKING" ? "Subscribe to Staking" : "Subscribe to Savings";

  return (
    <div className="space-y-8 pb-12">
      <GlassPanel className="p-8 lg:p-10">
        <GlowButton href={backHref} className="mb-10">
          ← {backLabel}
        </GlowButton>

        <p className="text-xs font-semibold uppercase tracking-[0.45em] text-[#D8C37A]">
          PrimeLedger {product.type}
        </p>

        <h1 className="mt-5 max-w-5xl text-5xl font-black uppercase leading-none tracking-[-0.06em] text-white md:text-7xl">
          {product.name}
        </h1>

        <p className="mt-6 max-w-3xl text-base leading-8 text-[#7F8DA3]">
          {product.description}
        </p>
      </GlassPanel>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          label={rateLabel}
          value={`${Number(product.interestRate || 0)}%`}
          tone="gold"
        />

        <Metric
          label="Minimum"
          value={`${product.currency} ${Number(
            product.minimumAmount || 0
          ).toLocaleString()}`}
        />

        <Metric label="Duration" value={`${product.durationDays} Days`} />

        <Metric
          label="Early Exit"
          value={product.allowEarlyExit ? "Allowed" : "Locked"}
          tone={product.allowEarlyExit ? "success" : "default"}
        />
      </section>

      <GlassPanel className="p-7">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-[#D8C37A]">
              Product Capacity
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-[-0.05em]">
              Allocation Progress
            </h2>

            <p className="mt-4 max-w-2xl text-[#7F8DA3]">
              {capacity > 0
                ? `${product.currency} ${invested.toLocaleString()} subscribed of ${product.currency} ${capacity.toLocaleString()} total capacity.`
                : "This product has no fixed capacity limit."}
            </p>
          </div>

          {capacity > 0 ? (
            <p className="text-6xl font-black tracking-[-0.06em] text-[#D8C37A]">
              {progress.toFixed(0)}%
            </p>
          ) : (
            <p className="text-4xl font-black tracking-[-0.06em] text-[#D8C37A]">
              OPEN
            </p>
          )}
        </div>

        {capacity > 0 ? (
          <div className="mt-8 h-5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#00D9FF] via-[#6D5BFF] to-[#D8C37A]"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : null}
      </GlassPanel>

      <GlassPanel className="p-7">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-[#D8C37A]">
              Client Action
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-[-0.05em]">
              Subscribe
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#7F8DA3]">
              Continue to the secure subscription screen to enter an amount and
              review estimated maturity value before submitting.
            </p>
          </div>

          <GlowButton href={`/products/${product.id}/subscribe`}>
            {actionLabel}
          </GlowButton>
        </div>
      </GlassPanel>
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
  const color =
    tone === "gold"
      ? "text-[#D8C37A]"
      : tone === "success"
        ? "text-[#2FFFA7]"
        : "text-white";

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.28em] text-[#7F8DA3]">
        {label}
      </p>

      <p className={`mt-4 text-3xl font-black tracking-tight ${color}`}>
        {value}
      </p>
    </div>
  );
}