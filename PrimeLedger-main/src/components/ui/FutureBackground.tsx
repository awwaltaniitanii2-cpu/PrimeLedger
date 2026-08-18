export default function FutureBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden bg-[#050608]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(0,217,255,0.18),transparent_28%),radial-gradient(circle_at_85%_10%,rgba(122,92,255,0.18),transparent_30%),radial-gradient(circle_at_50%_90%,rgba(216,195,122,0.12),transparent_35%)]" />

      <div className="absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04] bg-white/[0.015] blur-sm" />

      <div className="absolute left-[10%] top-[20%] h-64 w-64 rounded-full bg-cyan-400/10 blur-[90px]" />
      <div className="absolute right-[10%] top-[10%] h-72 w-72 rounded-full bg-violet-500/10 blur-[100px]" />
      <div className="absolute bottom-[10%] left-[40%] h-80 w-80 rounded-full bg-[#D8C37A]/10 blur-[110px]" />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <div className="absolute inset-0 opacity-[0.18] [background-image:radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050608]/30 to-[#050608]" />
    </div>
  );
}