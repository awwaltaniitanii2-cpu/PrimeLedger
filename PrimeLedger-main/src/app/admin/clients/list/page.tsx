import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

import PageShell from "@/components/ui/PageShell";
import GlassPanel from "@/components/ui/GlassPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import PremiumMetric from "@/components/ui/PremiumMetric";
import GlowButton from "@/components/ui/GlowButton";
import ClientActions from "@/components/admin/ClientActions";

export const dynamic = "force-dynamic";

type ClientWithData = {
  id: string;
  status: string;
  createdAt: Date;
  user: {
    name: string;
    email: string;
  };
  accounts: {
    accountId: string;
    accountType: string;
    balance: unknown;
    status: string;
  }[];
};

export default async function ClientListPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const currentUser = session.user as {
    role?: string;
  };

  if (currentUser.role !== "ADMIN") {
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
  })) as ClientWithData[];

  const activeClients = clients.filter(
    (client) => client.status === "ACTIVE"
  ).length;

  const reviewClients = clients.filter(
    (client) => client.status === "REVIEW"
  ).length;

  const totalAccounts = clients.reduce(
    (sum, client) => sum + client.accounts.length,
    0
  );

  const totalCapital = clients.reduce((clientSum, client) => {
    const clientCapital = client.accounts.reduce(
      (accountSum, account) => accountSum + Number(account.balance || 0),
      0
    );

    return clientSum + clientCapital;
  }, 0);

  return (
    <PageShell>
      <div className="space-y-8 pb-12">
        <GlassPanel className="p-8 lg:p-10">
          <SectionHeader
            eyebrow="PrimeLedger Administration"
            title="Client Directory"
            description="Monitor private client profiles, account assignments, capital positions, and onboarding status."
            action={
              <div className="flex flex-wrap gap-3">
                <GlowButton
                  href="/admin"
                  className="from-white/15 via-white/10 to-white/5 text-white"
                >
                  Admin Dashboard
                </GlowButton>

                <GlowButton href="/admin/clients">
                  Create Client
                </GlowButton>
              </div>
            }
          />
        </GlassPanel>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <PremiumMetric
            label="Total Clients"
            value={String(clients.length)}
            change="Registered client profiles"
          />

          <PremiumMetric
            label="Active Clients"
            value={String(activeClients)}
            change="Currently active profiles"
            tone="success"
          />

          <PremiumMetric
            label="Under Review"
            value={String(reviewClients)}
            change="Requires administrator attention"
            tone={reviewClients > 0 ? "danger" : "default"}
          />

          <PremiumMetric
            label="Client Capital"
            value={`$${totalCapital.toLocaleString()}`}
            change={`${totalAccounts} connected accounts`}
            tone="gold"
          />
        </section>

        <GlassPanel className="p-7">
          <SectionHeader
            eyebrow="Live Database"
            title="Private Capital Clients"
            description="Every registered PrimeLedger client and their current connected capital position."
          />

          <div className="mt-8 overflow-x-auto rounded-[30px] border border-white/10 bg-black/25">
            <div className="min-w-[1120px]">
              <div className="grid grid-cols-[1.1fr_1.4fr_1fr_0.9fr_1fr_0.8fr_0.7fr] border-b border-white/10 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#7F8DA3]">
                <span>Client</span>
                <span>Email</span>
                <span>Account ID</span>
                <span>Account Type</span>
                <span>Capital</span>
                <span>Status</span>
                <span>Actions</span>
              </div>

              {clients.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  <p className="text-2xl font-black text-white">
                    No Clients Available
                  </p>

                  <p className="mt-3 text-sm text-[#7F8DA3]">
                    Create the first PrimeLedger client to populate the
                    directory.
                  </p>
                </div>
              ) : (
                clients.map((client) => {
                  const clientCapital = client.accounts.reduce(
                    (sum, account) => sum + Number(account.balance || 0),
                    0
                  );

                  const primaryAccount = client.accounts[0];

                  return (
                    <div
                      key={client.id}
                      className="grid min-w-[1120px] grid-cols-[1.1fr_1.4fr_1fr_0.9fr_1fr_0.8fr_0.7fr] items-center border-b border-white/10 px-6 py-5 text-sm transition last:border-b-0 hover:bg-white/[0.03]"
                    >
                      <div>
                        <p className="font-bold text-white">
                          {client.user.name}
                        </p>

                        <p className="mt-1 text-xs text-[#566174]">
                          {client.accounts.length}{" "}
                          {client.accounts.length === 1
                            ? "account"
                            : "accounts"}
                        </p>
                      </div>

                      <span className="truncate pr-4 text-[#7F8DA3]">
                        {client.user.email}
                      </span>

                      <span className="font-semibold text-white">
                        {primaryAccount?.accountId || "No account"}
                      </span>

                      <span className="text-[#7F8DA3]">
                        {primaryAccount?.accountType || "—"}
                      </span>

                      <span className="font-black text-[#D8C37A]">
                        ${clientCapital.toLocaleString()}
                      </span>

                      <StatusBadge status={client.status} />

                      <ClientActions
                        clientId={client.id}
                        clientName={client.user.name}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </GlassPanel>

        <section className="grid gap-8 xl:grid-cols-[1fr_0.7fr]">
          <GlassPanel className="p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#D8C37A]">
              Capital Distribution
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white">
              Client Positions
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#7F8DA3]">
              Relative capital allocation across the largest client positions.
            </p>

            <div className="mt-8 space-y-5">
              {[...clients]
                .sort((a, b) => {
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
                .slice(0, 5)
                .map((client) => {
                  const clientCapital = client.accounts.reduce(
                    (sum, account) => sum + Number(account.balance || 0),
                    0
                  );

                  const percentage =
                    totalCapital > 0
                      ? Math.min((clientCapital / totalCapital) * 100, 100)
                      : 0;

                  return (
                    <div key={client.id}>
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-semibold text-white">
                          {client.user.name}
                        </span>

                        <span className="font-black text-[#D8C37A]">
                          ${clientCapital.toLocaleString()}
                        </span>
                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#00D9FF] via-[#6D5BFF] to-[#D8C37A]"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

              {clients.length === 0 ? (
                <p className="text-sm text-[#7F8DA3]">
                  No capital positions available.
                </p>
              ) : null}
            </div>
          </GlassPanel>

          <GlassPanel className="p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#D8C37A]">
              Operations
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white">
              Client Controls
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#7F8DA3]">
              Continue to account administration and client onboarding tools.
            </p>

            <div className="mt-8 space-y-3">
              <DirectoryAction
                href="/admin/clients"
                title="Create New Client"
                description="Provision a new PrimeLedger client."
              />

              <DirectoryAction
                href="/admin/accounts"
                title="Manage Accounts"
                description="Review connected trading accounts."
              />

              <DirectoryAction
                href="/admin/invites"
                title="Invitation Center"
                description="Generate and manage access invitations."
              />

              <DirectoryAction
                href="/admin/investments"
                title="Investment Manager"
                description="Manage private investment opportunities."
              />
            </div>
          </GlassPanel>
        </section>
      </div>
    </PageShell>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "ACTIVE"
      ? "border-[#2FFFA7]/20 bg-[#2FFFA7]/10 text-[#2FFFA7]"
      : status === "REVIEW"
        ? "border-[#FF5D7D]/20 bg-[#FF5D7D]/10 text-[#FF5D7D]"
        : status === "SUSPENDED"
          ? "border-[#D8C37A]/20 bg-[#D8C37A]/10 text-[#D8C37A]"
          : "border-white/10 bg-white/[0.05] text-[#7F8DA3]";

  return (
    <span
      className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-bold ${styles}`}
    >
      {status}
    </span>
  );
}

function DirectoryAction({
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