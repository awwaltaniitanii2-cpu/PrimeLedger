import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AuroraBackground from "@/components/ui/AuroraBackground";
import GlassPanel from "@/components/ui/GlassPanel";
import PrimeLogo from "@/components/ui/PrimeLogo";
import GlowButton from "@/components/ui/GlowButton";

export const dynamic = "force-dynamic";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const invite = await prisma.inviteLink.findUnique({
    where: { token },
    include: {
      client: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!invite) {
    notFound();
  }

  const expired = invite.expiresAt ? invite.expiresAt < new Date() : false;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#040509] text-white">
      <AuroraBackground />

      <section className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <header>
          <Link href="/">
            <PrimeLogo />
          </Link>
        </header>

        <div className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.55em] text-[#D8C37A]">
              Private Invitation
            </p>

            <h1 className="mt-6 text-6xl font-black uppercase leading-none tracking-[-0.08em] md:text-8xl">
              Welcome
              <br />
              To
              <br />
              <span className="bg-gradient-to-r from-white via-[#D8C37A] to-[#00D9FF] bg-clip-text text-transparent">
                PrimeLedger
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-[#7F8DA3]">
              You have been invited to access PrimeLedger’s private capital
              operating system.
            </p>
          </div>

          <GlassPanel className="p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#D8C37A]">
              Invite Status
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-[-0.05em]">
              {expired ? "Invite Expired" : "Access Ready"}
            </h2>

            <div className="mt-8 rounded-[28px] border border-white/10 bg-black/30 p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-[#7F8DA3]">
                Client
              </p>

              <p className="mt-3 text-3xl font-black text-white">
                {invite.client.user.name}
              </p>

              <p className="mt-2 text-sm text-[#7F8DA3]">
                {invite.client.user.email}
              </p>
            </div>

            <div className="mt-6 rounded-[28px] border border-white/10 bg-black/30 p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-[#7F8DA3]">
                Invitation
              </p>

              <p
                className={`mt-3 text-2xl font-black ${
                  expired ? "text-[#FF5D7D]" : "text-[#2FFFA7]"
                }`}
              >
                {expired ? "Expired" : invite.used ? "Already Used" : "Active"}
              </p>
            </div>

            {!expired ? (
              <GlowButton href="/login" className="mt-8 w-full">
                Continue to Secure Login
              </GlowButton>
            ) : (
              <p className="mt-8 text-sm leading-6 text-[#7F8DA3]">
                This invitation is no longer valid. Please contact PrimeLedger
                support or your account administrator.
              </p>
            )}
          </GlassPanel>
        </div>
      </section>
    </main>
  );
}