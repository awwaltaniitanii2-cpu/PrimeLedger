type GradientHeaderProps = {
  title: string;
  subtitle: string;
};

export default function GradientHeader({
  title,
  subtitle,
}: GradientHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[#080D18] p-8 shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(52,211,153,0.18),transparent_30%),radial-gradient(circle_at_90%_10%,rgba(234,179,8,0.16),transparent_28%),radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.14),transparent_35%)]" />

      <div className="relative z-10 grid gap-8 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <p className="text-xs font-bold uppercase tracking-[0.45em] text-emerald-400">
            {subtitle}
          </p>

          <h1 className="mt-5 max-w-4xl text-5xl font-black uppercase leading-none tracking-tight md:text-7xl">
            {title}
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400">
            Invite-only private capital infrastructure for trading accounts,
            portfolio monitoring, client operations, deposits, withdrawals,
            and performance supervision.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
              Private Access
            </span>
            <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm text-yellow-300">
              Capital Control
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-slate-300">
              Admin Managed
            </span>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Platform Snapshot
          </p>

          <div className="mt-6 space-y-5">
            <Metric label="Managed Capital" value="$12.84M" accent="emerald" />
            <Metric label="Monthly Growth" value="+18.4%" accent="gold" />
            <Metric label="Active Clients" value="248" accent="white" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "emerald" | "gold" | "white";
}) {
  const color =
    accent === "emerald"
      ? "text-emerald-400"
      : accent === "gold"
      ? "text-yellow-400"
      : "text-white";

  return (
    <div className="flex items-end justify-between border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className={`text-2xl font-black ${color}`}>{value}</span>
    </div>
  );
}