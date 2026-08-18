import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";

import PageShell from "@/components/ui/PageShell";
import GlassPanel from "@/components/ui/GlassPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import GlowButton from "@/components/ui/GlowButton";
import TradeDesk from "@/components/trades/TradeDesk";

export const dynamic = "force-dynamic";

export default async function AdminTradesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as {
    role?: string;
  };

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <PageShell>
      <div className="space-y-8 pb-12">
        <GlassPanel className="p-8 lg:p-10">
          <SectionHeader
            eyebrow="PrimeLedger Administration"
            title="Trading Desk"
            description="Open, manage, close, cancel, and remove trades across client trading accounts."
            action={
              <GlowButton
                href="/admin"
                className="from-white/15 via-white/10 to-white/5 text-white"
              >
                Admin Dashboard
              </GlowButton>
            }
          />
        </GlassPanel>

        <GlassPanel className="p-7">
          <TradeDesk />
        </GlassPanel>
      </div>
    </PageShell>
  );
}