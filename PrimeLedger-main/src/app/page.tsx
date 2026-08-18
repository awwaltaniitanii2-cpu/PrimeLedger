import Link from "next/link";
import AuroraBackground from "@/components/ui/AuroraBackground";
import GlassPanel from "@/components/ui/GlassPanel";
import PrimeLogo from "@/components/ui/PrimeLogo";
import GlowButton from "@/components/ui/GlowButton";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#040509] text-white">
      <AuroraBackground />

      <section className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8">
        <header className="flex items-center justify-between">
          <PrimeLogo />

          <div className="flex gap-3">
            <Link
              href="/login"
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-white backdrop-blur-xl transition hover:border-[#00D9FF]/40 hover:text-[#00D9FF]"
            >
              Sign In
            </Link>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.55em] text-[#D8C37A]">
              Invite Only Private Platform
            </p>

            <h1 className="mt-6 text-6xl font-black uppercase leading-none tracking-[-0.08em] md:text-8xl">
              Private
              <br />
              Capital
              <br />
              <span className="bg-gradient-to-r from-white via-[#D8C37A] to-[#00D9FF] bg-clip-text text-transparent">
                Operating
                <br />
                System
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-[#7F8DA3]">
              PrimeLedger unifies client portfolios, early investments, live
              markets, capital accounts, invitations, and administrative control
              into one private wealth infrastructure.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <GlowButton href="/login">Client Access</GlowButton>

              <GlowButton
                href="/login"
                className="from-white/15 via-white/10 to-white/5 text-white"
              >
                Admin Portal
              </GlowButton>
            </div>
          </div>

          <GlassPanel className="p-7 lg:p-8">
            <div className="rounded-[32px] border border-white/10 bg-black/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[#D8C37A]">
                    PrimeLedger OS
                  </p>
                  <h2 className="mt-3 text-4xl font-black tracking-[-0.05em]">
                    Wealth Control
                  </h2>
                </div>

                <span className="rounded-full border border-[#2FFFA7]/20 bg-[#2FFFA7]/10 px-4 py-2 text-xs font-bold text-[#2FFFA7]">
                  ONLINE
                </span>
              </div>

              <div className="relative mt-8 h-[330px] overflow-hidden rounded-[30px] border border-white/10 bg-[#05070D]">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:44px_44px]" />

                <svg
                  viewBox="0 0 1000 300"
                  preserveAspectRatio="none"
                  className="relative z-10 h-full w-full p-8"
                >
                  <defs>
                    <linearGradient id="homeCurve" x1="0" x2="1">
                      <stop offset="0%" stopColor="#00D9FF" />
                      <stop offset="50%" stopColor="#6D5BFF" />
                      <stop offset="100%" stopColor="#D8C37A" />
                    </linearGradient>
                  </defs>

                  <path
                    d="M 0 230 C 110 190, 160 260, 270 165 S 460 70, 555 135 S 700 250, 805 105 S 910 45, 1000 70"
                    fill="none"
                    stroke="url(#homeCurve)"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <MiniCard title="Portfolio" value="Live" />
                <MiniCard title="Markets" value="24/7" />
                <MiniCard title="Access" value="Private" />
              </div>
            </div>
          </GlassPanel>
        </div>

        <footer className="border-t border-white/10 py-6 text-xs uppercase tracking-[0.3em] text-[#566174]">
          PrimeLedger · Private Capital Infrastructure
        </footer>
      </section>
    </main>
  );
}

function MiniCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-[#7F8DA3]">
        {title}
      </p>
      <p className="mt-2 text-2xl font-black text-[#D8C37A]">{value}</p>
    </div>
  );
}