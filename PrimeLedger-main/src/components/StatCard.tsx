type StatCardProps = {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
};

export default function StatCard({
  label,
  value,
  change,
  positive = true,
}: StatCardProps) {
  return (
    <div className="group rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl transition-all duration-300 hover:border-emerald-400/30 hover:bg-white/[0.07]">
      <p className="text-sm text-slate-400">{label}</p>

      <h3 className="mt-4 text-3xl font-black tracking-tight">
        {value}
      </h3>

      {change && (
        <p
          className={`mt-3 text-sm font-medium ${
            positive
              ? "text-emerald-400"
              : "text-red-400"
          }`}
        >
          {change}
        </p>
      )}
    </div>
  );
}