"use client";

import { useEffect } from "react";
import Link from "next/link";
import AuroraBackground from "@/components/ui/AuroraBackground";
import GlassPanel from "@/components/ui/GlassPanel";
import PrimeLogo from "@/components/ui/PrimeLogo";
import GlowButton from "@/components/ui/GlowButton";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

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
          System Error
        </p>

        <h1 className="mt-6 text-5xl font-black uppercase tracking-[-0.06em] md:text-7xl">
          Something
          <br />
          Went Wrong
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-[#7F8DA3]">
          PrimeLedger encountered an unexpected error while processing your
          request. Your data remains safe.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button
            onClick={reset}
            className="rounded-2xl bg-gradient-to-r from-[#00D9FF] via-[#6D5BFF] to-[#D8C37A] px-8 py-4 font-black text-black transition hover:scale-[1.02]"
          >
            Try Again
          </button>

          <GlowButton
            href="/dashboard"
            className="from-white/15 via-white/10 to-white/5 text-white"
          >
            Dashboard
          </GlowButton>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="mt-10 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-left">
            <p className="text-xs uppercase tracking-widest text-red-400">
              Development Error
            </p>

            <pre className="mt-3 overflow-auto whitespace-pre-wrap break-words text-xs text-red-300">
              {error.message}
            </pre>
          </div>
        )}
      </GlassPanel>
    </main>
  );
}