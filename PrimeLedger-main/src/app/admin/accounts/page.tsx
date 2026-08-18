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

type AccountWithClient = {
  id: string;
  accountId: string;
  accountType: string;
  balance: unknown;
  profitLoss: unknown;
  status: string;
  client: {
    user: {
      name: string;
    };
  };
};

export default async function AccountsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");

  const user = session.user as { role?: string };

  if (user.role !== "ADMIN") redirect("/dashboard");

  const accounts = (await prisma.tradingAccount.findMany({
    include: {
      client: {
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })) as AccountWithClient[];

  const totalCapital = accounts.reduce(
    (sum: number, account: AccountWithClient) =>
      sum + Number(account.balance || 0),
    0
  );

  const totalProfit = accounts.reduce(
    (sum: number, account: AccountWithClient) =>
      sum + Number(account.profitLoss || 0),
    0
  );

  const activeAccounts = accounts.filter(
    (account: AccountWithClient) => account.status === "ACTIVE"
  ).length;

  const inactiveAccounts = accounts.length - activeAccounts;

  return (
    <PageShell>
      <div className="space-y-8 pb-12">
        <GlassPanel className="p-8 lg:p-10">
          <SectionHeader
            eyebrow="PrimeLedger Administration"
            title="Capital Allocation Center"
            description="Monitor trading accounts, managed balances, performance, and client exposure across the PrimeLedger private capital network."
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

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <PremiumMetric
            label="Managed Capital"
            value={`$${totalCapital.toLocaleString()}`}
            change="Total connected account capital"
            tone="gold"
          />

          <PremiumMetric
            label="Profit / Loss"
            value={`$${totalProfit.toLocaleString()}`}
            change="Total recorded performance"
            tone={totalProfit >= 0 ? "success" : "danger"}
          />

          <PremiumMetric
            label="Trading Accounts"
            value={String(accounts.length)}
            change="Registered account records"
          />

          <PremiumMetric
            label="Active Accounts"
            value={String(activeAccounts)}
            change={`${inactiveAccounts} inactive or under review`}
            tone="success"
          />
        </section>

        <GlassPanel className="p-7">
          <SectionHeader
            eyebrow="Live Trading Infrastructure"
            title="Account Network"
            description="Every trading account connected to PrimeLedger, grouped by client, balance, performance, and operational status."
            action={
              <GlowButton href="/admin/clients">
                Create Client
              </GlowButton>
            }
          />

          <div className="mt-8 grid gap-5 xl:grid-cols-3">
            {accounts.length === 0 ? (
              <div className="rounded-[30px] border border-dashed border-white/10 bg-black/20 p-10 text-center xl:col-span-3">
                <p className="text-3xl font-black text-white">
                  No Trading Accounts
                </p>

                <p className="mt-3 text-sm text-[#7F8DA3]">
                  Create a client account to provision the first capital
                  allocation record.
                </p>
              </div>
            ) : (
              accounts.map((account: AccountWithClient) => {
                const balance = Number(account.balance || 0);
                const profitLoss = Number(account.profitLoss || 0);
                const equity = balance + profitLoss;
                const roi = balance > 0 ? (profitLoss / balance) * 100 : 0;

                return (
                  <article
                    key={account.id}
                    className="group rounded-[34px] border border-white/10 bg-white/[0.04] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#00D9FF]/30 hover:bg-white/[0.06] hover:shadow-[0_0_80px_rgba(0,217,255,0.1)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-[#D8C37A]">
                          Client Account
                        </p>

                        <h3 className="mt-3 text-2xl font-black tracking-[-0.04em] text-white">
                          {account.client.user.name}
                        </h3>

                        <p className="mt-2 text-sm text-[#7F8DA3]">
                          {account.accountId}
                        </p>
                      </div>

                      <StatusBadge status={account.status} />
                    </div>

                    <div className="mt-7 rounded-[26px] border border-white/10 bg-black/25 p-5">
                      <p className="text-xs uppercase tracking-[0.24em] text-[#7F8DA3]">
                        Account Equity
                      </p>

                      <p className="mt-3 text-4xl font-black tracking-[-0.05em] text-white">
                        ${equity.toLocaleString()}
                      </p>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <AccountMetric
                        label="Balance"
                        value={`$${balance.toLocaleString()}`}
                      />

                      <AccountMetric
                        label="P/L"
                        value={`$${profitLoss.toLocaleString()}`}
                        tone={profitLoss >= 0 ? "success" : "danger"}
                      />

                      <AccountMetric
                        label="ROI"
                        value={`${roi.toFixed(2)}%`}
                        tone={roi >= 0 ? "success" : "danger"}
                      />

                      <AccountMetric
                        label="Type"
                        value={account.accountType}
                        tone="gold"
                      />
                    </div>

                    <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#00D9FF] via-[#6D5BFF] to-[#D8C37A]"
                        style={{
                          width: `${Math.min(Math.max(Math.abs(roi), 8), 100)}%`,
                        }}
                      />
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </GlassPanel>

        <GlassPanel className="p-7">
          <SectionHeader
            eyebrow="Capital Ledger"
            title="Account Records"
            description="A structured view of every account currently stored in the PrimeLedger database."
          />

          <div className="mt-8 overflow-x-auto rounded-[30px] border border-white/10 bg-black/25">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1fr_0.8fr] border-b border-white/10 px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#7F8DA3]">
                <span>Client</span>
                <span>Account ID</span>
                <span>Type</span>
                <span>Balance</span>
                <span>P/L</span>
                <span>Status</span>
              </div>

              {accounts.length === 0 ? (
                <p className="px-6 py-10 text-[#7F8DA3]">
                  No account records available.
                </p>
              ) : (
                accounts.map((account: AccountWithClient) => (
                  <div
                    key={account.id}
                    className="grid min-w-[900px] grid-cols-[1.2fr_1fr_1fr_1fr_1fr_0.8fr] items-center border-b border-white/10 px-6 py-5 text-sm last:border-b-0 hover:bg-white/[0.03]"
                  >
                    <span className="font-bold text-white">
                      {account.client.user.name}
                    </span>

                    <span className="text-[#7F8DA3]">
                      {account.accountId}
                    </span>

                    <span className="text-[#7F8DA3]">
                      {account.accountType}
                    </span>

                    <span className="font-black text-[#D8C37A]">
                      ${Number(account.balance || 0).toLocaleString()}
                    </span>

                    <span
                      className={
                        Number(account.profitLoss || 0) >= 0
                          ? "font-black text-[#2FFFA7]"
                          : "font-black text-[#FF5D7D]"
                      }
                    >
                      ${Number(account.profitLoss || 0).toLocaleString()}
                    </span>

                    <StatusBadge status={account.status} />
                  </div>
                ))
              )}
            </div>
          </div>
        </GlassPanel>
      </div>
    </PageShell>
  );
}

function AccountMetric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "gold" | "success" | "danger";
}) {
  const valueClass =
    tone === "gold"
      ? "text-[#D8C37A]"
      : tone === "success"
        ? "text-[#2FFFA7]"
        : tone === "danger"
          ? "text-[#FF5D7D]"
          : "text-white";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-[#7F8DA3]">
        {label}
      </p>

      <p className={`mt-2 text-xl font-black ${valueClass}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "ACTIVE"
      ? "border-[#2FFFA7]/20 bg-[#2FFFA7]/10 text-[#2FFFA7]"
      : status === "REVIEW"
        ? "border-[#D8C37A]/20 bg-[#D8C37A]/10 text-[#D8C37A]"
        : status === "SUSPENDED"
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