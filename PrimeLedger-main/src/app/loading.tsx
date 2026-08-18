import AuroraBackground from "@/components/ui/AuroraBackground";
import GlassPanel from "@/components/ui/GlassPanel";
import PrimeLogo from "@/components/ui/PrimeLogo";

export default function Loading() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#040509] px-6 text-white">
      <AuroraBackground />

      <GlassPanel className="relative z-10 w-full max-w-md p-8 text-center">
        <div className="flex justify-center">
          <PrimeLogo />
        </div>

        <div className="mx-auto mt-10 h-16 w-16 animate-spin rounded-full border-4 border-white/10 border-t-[#00D9FF]" />

        <h1 className="mt-8 text-4xl font-black tracking-[-0.05em]">
          Loading PrimeLedger
        </h1>

        <p className="mt-4 text-sm leading-7 text-[#7F8DA3]">
          Connecting securely to the PrimeLedger private capital infrastructure.
          Please wait while your workspace is prepared.
        </p>

        <div className="mt-10 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-[#00D9FF] via-[#6D5BFF] to-[#D8C37A]" />
        </div>

        <p className="mt-6 text-xs uppercase tracking-[0.35em] text-[#566174]">
          Secure • Encrypted • Private
        </p>
      </GlassPanel>
    </main>
  );
}