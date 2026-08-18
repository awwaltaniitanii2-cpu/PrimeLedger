import { cn } from "@/lib/utils";

export default function GlassPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[34px]",
        "border border-white/10",
        "bg-white/[0.045]",
        "backdrop-blur-3xl",
        "shadow-[0_10px_80px_rgba(0,0,0,.35)]",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent" />
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <div className="relative">{children}</div>
    </div>
  );
}