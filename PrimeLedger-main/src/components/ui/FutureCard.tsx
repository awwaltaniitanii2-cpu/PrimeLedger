import { ReactNode } from "react";

export default function FutureCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[36px] border border-white/10 bg-white/[0.055] shadow-[0_0_80px_rgba(0,217,255,0.08)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:shadow-[0_0_120px_rgba(0,217,255,0.14)] ${className}`}
    >
      {children}
    </div>
  );
}