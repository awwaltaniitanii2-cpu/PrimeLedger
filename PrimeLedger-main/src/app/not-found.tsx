import Link from "next/link";
import AuroraBackground from "@/components/ui/AuroraBackground";
import GlassPanel from "@/components/ui/GlassPanel";
import PrimeLogo from "@/components/ui/PrimeLogo";
import GlowButton from "@/components/ui/GlowButton";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#040509] px-6 text-white">
      <AuroraBackground />

      <GlassPanel className="relative z-10 w-full max-w-2xl p-8 text-center lg:p-12">
        <div className="flex justify-center">
          <Link href="/">
            <PrimeLogo />
          </Link>
        </div>

        <p className="mt-12 text-xs font-semibold uppercase tracking-[0.55em] text-[#D8C37A]">
          Route Not Found
        </p>

        <h1 className="mt-6 text-7xl font-black uppercase leading-none tracking-[-0.08em] md:text-9xl">
          404
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-[#7F8DA3]">
          The requested PrimeLedger route does not exist or is no longer
          available inside the private capital operating system.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <GlowButton href="/">
            Return Home
          </GlowButton>

          <GlowButton
            href="/login"
            className="from-white/15 via-white/10 to-white/5 text-white"
          >
            Secure Login
          </GlowButton>
        </div>
      </GlassPanel>
    </main>
  );
}