import Link from "next/link";
import { cn } from "@/lib/utils";

type GlowButtonProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
};

export default function GlowButton({
  children,
  href,
  onClick,
  className,
  type = "button",
  disabled = false,
}: GlowButtonProps) {
  const classes = cn(
    "group relative inline-flex items-center justify-center overflow-hidden rounded-2xl",
    "bg-gradient-to-r from-[#00D9FF] via-[#6D5BFF] to-[#D8C37A]",
    "px-6 py-4 font-black text-black",
    "shadow-[0_0_40px_rgba(0,217,255,.18)]",
    "transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_70px_rgba(216,195,122,.24)]",
    "disabled:pointer-events-none disabled:opacity-50",
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        <span className="absolute inset-0 translate-x-[-120%] bg-white/40 blur-xl transition duration-700 group-hover:translate-x-[120%]" />
        <span className="relative z-10">{children}</span>
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      <span className="absolute inset-0 translate-x-[-120%] bg-white/40 blur-xl transition duration-700 group-hover:translate-x-[120%]" />
      <span className="relative z-10">{children}</span>
    </button>
  );
}