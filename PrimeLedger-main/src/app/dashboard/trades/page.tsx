import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";

import PageShell from "@/components/ui/PageShell";
import GlassPanel from "@/components/ui/GlassPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import GlowButton from "@/components/ui/GlowButton";
import ClientTradeTerminal from "@/components/trades/ClientTradeTerminal";

export const dynamic = "force-dynamic";

export default async function ClientTradesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as {
    role?: string;
  };

  if (user.role === "ADMIN") {
    redirect("/admin/trades");
  }

  return (
    <PageShell>
      <div className="space-y-8 pb-12">
        <GlassPanel className="p-8 lg:p-10">
          <SectionHeader
            eyebrow="PrimeLedger Portfolio"
            title="Managed Trades"
            description="Monitor open positions, pending orders, completed trades, and trading performance across your managed accounts."
            action={
              <GlowButton
                href="/dashboard"
                className="from-white/15 via-white/10 to-white/5 text-white"
              >
                Dashboard
              </GlowButton>
            }
          />
        </GlassPanel>

        <ClientTradeTerminal />
      </div>
    </PageShell>
  );
}