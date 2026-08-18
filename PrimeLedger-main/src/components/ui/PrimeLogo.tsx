export default function PrimeLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-10 w-10 rounded-2xl border border-white/15 bg-white/[0.06] shadow-[0_0_40px_rgba(216,195,122,0.18)] backdrop-blur-xl">
        <div className="absolute inset-2 rounded-xl bg-gradient-to-br from-[#D8C37A] via-white to-[#00D9FF]" />
      </div>

      <div>
        <p className="text-xl font-black tracking-tight text-white">
          Prime<span className="text-[#D8C37A]">Ledger</span>
        </p>
        <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">
          Private Capital OS
        </p>
      </div>
    </div>
  );
}