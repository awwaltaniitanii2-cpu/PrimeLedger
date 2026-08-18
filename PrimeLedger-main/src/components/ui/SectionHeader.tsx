import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export default function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-5 md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className="max-w-3xl">
        {eyebrow ? (
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-gradient-to-r from-[#D8C37A] to-transparent" />

            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#D8C37A]">
              {eyebrow}
            </p>
          </div>
        ) : null}

        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#F6F7FB] sm:text-4xl lg:text-5xl">
          {title}
        </h2>

        {description ? (
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#7F8DA3] sm:text-base">
            {description}
          </p>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}