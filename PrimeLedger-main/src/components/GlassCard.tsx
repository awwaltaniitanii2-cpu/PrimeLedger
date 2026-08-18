type GlassCardProps = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
};

export default function GlassCard({
  title,
  subtitle,
  children,
  className = "",
}: GlassCardProps) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.25)] ${className}`}
    >
      {(title || subtitle) && (
        <div className="mb-6">
          {subtitle && (
            <p className="mb-1 text-sm text-emerald-400">
              {subtitle}
            </p>
          )}

          {title && (
            <h3 className="text-xl font-bold tracking-tight">
              {title}
            </h3>
          )}
        </div>
      )}

      {children}
    </div>
  );
}