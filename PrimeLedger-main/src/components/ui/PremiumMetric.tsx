import { cn } from "@/lib/utils";
import GlassPanel from "./GlassPanel";

export default function PremiumMetric({
  label,
  value,
  change,
  tone = "default",
}: {
  label: string;
  value: string;
  change?: string;
  tone?: "default" | "gold" | "success" | "danger";
}) {
  const color =
    tone === "gold"
      ? "text-[#D8C37A]"
      : tone === "success"
      ? "text-[#2FFFA7]"
      : tone === "danger"
      ? "text-[#FF5D7D]"
      : "text-white";

  return (
    <GlassPanel className="p-6">
      <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
        {label}
      </p>

      <p className={cn("mt-4 text-4xl font-black tracking-tight", color)}>
        {value}
      </p>

      {change ? (
        <p className="mt-3 text-sm font-semibold text-slate-400">{change}</p>
      ) : null}
    </GlassPanel>
  );
}