import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

import PageShell from "@/components/ui/PageShell";
import GlassPanel from "@/components/ui/GlassPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import PremiumMetric from "@/components/ui/PremiumMetric";
import GlowButton from "@/components/ui/GlowButton";

export const dynamic = "force-dynamic";

type AdminClient = {
  id: string;
  status: string;
  user: {
    name: string;
  };
  accounts: {
    accountId: string;
    balance: unknown;
  }[];
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as {
    id?: string;
    role?: string;
    name?: string;
  };

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const clients = (await prisma.client.findMany({
    include: {
      user: true,
      accounts: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })) as AdminClient[];

  const totalClients = clients.length;

  const activeClients = clients.filter(
    (client: AdminClient) => client.status === "ACTIVE"
  ).length;

  const reviewClients = clients.filter(
    (client: AdminClient) => client.status === "REVIEW"
  ).length;

  const totalCapital = clients.reduce(
    (sum: number, client: AdminClient) => {
      const clientCapital = client.accounts.reduce(
        (accountSum: number, account) =>
          accountSum + Number(account.balance || 0),
        0
      );

      return sum + clientCapital;
    },
    0
  );

  const totalAccounts = clients.reduce(
    (sum: number, client: AdminClient) => sum + client.accounts.length,
    0
  );

  const topClients = [...clients]
    .sort((a: AdminClient, b: AdminClient) => {
      const aCapital = a.accounts.reduce(
        (sum, account) => sum + Number(account.balance || 0),
        0
      );

      const bCapital = b.accounts.reduce(
        (sum, account) => sum + Number(account.balance || 0),
        0
      );

      return bCapital - aCapital;
    })
    .slice(0, 5);

  return (
    <PageShell>
      <div className="space-y-8 pb-12">
        <GlassPanel className="p-8 lg:p-10">
          <div className="grid gap-10 xl:grid-cols-[1.25fr_0.75fr] xl:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.45em] text-[#D8C37A]">
                PrimeLedger Command Center
              </p>

              <h1 className="mt-5 max-w-5xl text-5xl font-black uppercase leading-none tracking-[-0.06em] text-white md:text-7xl">
                Capital
                <br />
                <span className="bg-gradient-to-r from-white via-[#D8C37A] to-[#00D9FF] bg-clip-text text-transparent">
                  Intelligence
                </span>
              </h1>

              <p className="mt-6 max-w-3xl text-base leading-8 text-[#7F8DA3]">
                Monitor managed capital, client activity, trading accounts, and
                operational priorities from the PrimeLedger private
                administration environment.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <GlowButton href="/admin/clients">
                  Create Client
                </GlowButton>

                <GlowButton
                  href="/admin/invites"
                  className="from-white/15 via-white/10 to-white/5 text-white"
                >
                  Manage Invites
                </GlowButton>
              </div>
            </div>

            <div className="rounded-[34px] border border-white/10 bg-black/30 p-7">
              <p className="text-xs uppercase tracking-[0.32em] text-[#D8C37A]">
                Assets Under Management
              </p>

              <p className="mt-4 text-5xl font-black tracking-[-0.06em] text-white lg:text-6xl">
                ${totalCapital.toLocaleString()}
              </p>

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                <span className="text-sm text-[#7F8DA3]">
                  Operational Status
                </span>

                <span className="rounded-full border border-[#2FFFA7]/20 bg-[#2FFFA7]/10 px-3 py-1 text-xs font-bold text-[#2FFFA7]">
                  ONLINE
                </span>
              </div>
            </div>
          </div>
        </GlassPanel>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <PremiumMetric
            label="Managed Capital"
            value={`$${totalCapital.toLocaleString()}`}
            change="Across all client accounts"
            tone="gold"
          />

          <PremiumMetric
            label="Active Clients"
            value={String(activeClients)}
            change="Currently active profiles"
            tone="success"
          />

          <PremiumMetric
            label="Trading Accounts"
            value={String(totalAccounts)}
            change="Connected capital accounts"
          />

          <PremiumMetric
            label="Pending Reviews"
            value={String(reviewClients)}
            change="Requires administrator attention"
            tone={reviewClients > 0 ? "danger" : "default"}
          />
        </section>

        <section className="grid gap-8 xl:grid-cols-[1.35fr_0.65fr]">
          <GlassPanel className="p-7">
            <SectionHeader
              eyebrow="Capital Intelligence"
              title="Managed Portfolio"
              description="A visual operating overview of capital managed across the PrimeLedger client network."
            />

            <div className="relative mt-8 h-[360px] overflow-hidden rounded-[32px] border border-white/10 bg-black/30 p-6">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px]" />

              <div className="relative z-10 flex h-full items-end gap-3">
                {[32, 41, 38, 54, 50, 68, 63, 79, 74, 91].map(
                  (height: number, index: number) => (
                    <div
                      key={index}
                      className="group relative flex-1"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute inset-0 rounded-t-2xl bg-gradient-to-t from-[#00D9FF]/45 via-[#6D5BFF]/60 to-[#D8C37A]/80 transition duration-300 group-hover:brightness-125" />

                      <div className="absolute inset-x-0 top-0 h-px bg-white/50 shadow-[0_0_18px_rgba(216,195,122,0.65)]" />
                    </div>
                  )
                )}
              </div>
            </div>
          </GlassPanel>

          <GlassPanel className="p-7">
            <SectionHeader
              eyebrow="Operations"
              title="Command Panel"
              description="Direct access to PrimeLedger administration tools."
            />

            <div className="mt-8 space-y-3">
              <AdminAction
                href="/admin/clients"
                title="Create Client"
                description="Register a new investor profile."
              />

              <AdminAction
                href="/admin/clients/list"
                title="Client Directory"
                description="Review registered PrimeLedger clients."
              />

              <AdminAction
                href="/admin/accounts"
                title="Trading Accounts"
                description="Manage balances and client accounts."
              />

              <AdminAction
                href="/admin/invites"
                title="Invitation Center"
                description="Generate and manage client access links."
              />

              <AdminAction
                href="/admin/investments"
                title="Early Invest Manager"
                description="Create and manage investment opportunities."
              />
            </div>
          </GlassPanel>
        </section>

        <GlassPanel className="p-7">
          <SectionHeader
            eyebrow="Priority Intelligence"
            title="Leading Client Positions"
            description="Highest client capital positions currently recorded in PrimeLedger."
            action={
              <GlowButton
                href="/admin/clients/list"
                className="from-white/15 via-white/10 to-white/5 text-white"
              >
                View All Clients
              </GlowButton>
            }
          />

          <div className="mt-8 overflow-x-auto rounded-[30px] border border-white/10 bg-black/25">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[1.3fr_1fr_1fr_0.8fr] border-b border-white/10 px-6 py-4 text-xs uppercase tracking-[0.25em] text-[#7F8DA3]">
                <span>Client</span>
                <span>Primary Account</span>
                <span>Total Capital</span>
                <span>Status</span>
              </div>

              {topClients.length === 0 ? (
                <p className="px-6 py-8 text-[#7F8DA3]">
                  No clients available yet.
                </p>
              ) : (
                topClients.map((client: AdminClient) => {
                  const clientCapital = client.accounts.reduce(
                    (sum, account) => sum + Number(account.balance || 0),
                    0
                  );

                  return (
                    <div
                      key={client.id}
                      className="grid min-w-[760px] grid-cols-[1.3fr_1fr_1fr_0.8fr] items-center border-b border-white/10 px-6 py-5 text-sm last:border-b-0 hover:bg-white/[0.025]"
                    >
                      <span className="font-semibold text-white">
                        {client.user.name}
                      </span>

                      <span className="text-[#7F8DA3]">
                        {client.accounts[0]?.accountId || "No account"}
                      </span>

                      <span className="font-black text-[#D8C37A]">
                        ${clientCapital.toLocaleString()}
                      </span>

                      <span>
                        <StatusBadge status={client.status} />
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </GlassPanel>
      </div>
    </PageShell>
  );
}

function AdminAction({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <a
      href={href}
      className="group block rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-4 transition duration-300 hover:-translate-y-0.5 hover:border-[#00D9FF]/30 hover:bg-[#00D9FF]/[0.07]"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-bold text-white transition group-hover:text-[#00D9FF]">
            {title}
          </p>

          <p className="mt-1 text-xs leading-5 text-[#7F8DA3]">
            {description}
          </p>
        </div>

        <span className="text-xl text-[#D8C37A] transition group-hover:translate-x-1">
          →
        </span>
      </div>
    </a>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "ACTIVE"
      ? "border-[#2FFFA7]/20 bg-[#2FFFA7]/10 text-[#2FFFA7]"
      : status === "REVIEW"
      ? "border-[#FF5D7D]/20 bg-[#FF5D7D]/10 text-[#FF5D7D]"
      : "border-white/10 bg-white/[0.05] text-[#7F8DA3]";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${styles}`}
    >
      {status}
    </span>
  );
}