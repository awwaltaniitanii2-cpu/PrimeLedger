import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import PageShell from "@/components/ui/PageShell";
import SectionHeader from "@/components/ui/SectionHeader";
import GlassPanel from "@/components/ui/GlassPanel";
import PremiumMetric from "@/components/ui/PremiumMetric";
import GlowButton from "@/components/ui/GlowButton";

export const dynamic = "force-dynamic";

type Account = {
  id: string;
  accountId: string;
  accountType: string;
  balance: unknown;
  profitLoss: unknown;
  status: string;
};

type Activity = {
  id: string;
  type: string;
  amount: unknown;
  status: string;
  createdAt: Date;
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as {
    id?: string;
    role?: string;
    name?: string;
  };

  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  const client = await prisma.client.findUnique({
    where: {
      userId: user.id,
    },
    include: {
      user: true,
      accounts: true,
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 6,
      },
      deposits: {
        orderBy: { createdAt: "desc" },
        take: 3,
      },
      withdrawals: {
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
  });

  if (!client) {
    return (
      <PageShell>
        <div className="flex min-h-screen items-center justify-center">
          <GlassPanel className="max-w-xl p-10 text-center">
            <h1 className="text-4xl font-black">Client Profile Not Found</h1>
            <p className="mt-4 text-slate-400">
              Please contact PrimeLedger support.
            </p>
            <GlowButton href="/login" className="mt-8">
              Return to Login
            </GlowButton>
          </GlassPanel>
        </div>
      </PageShell>
    );
  }

  const accounts = client.accounts as Account[];

  const totalBalance = accounts.reduce(
    (sum: number, account: Account) => sum + Number(account.balance || 0),
    0
  );

  const totalProfit = accounts.reduce(
    (sum: number, account: Account) => sum + Number(account.profitLoss || 0),
    0
  );

  const availableEquity = totalBalance + totalProfit;

  const activities: Activity[] = [
    ...client.transactions.map((item) => ({
      id: item.id,
      type: item.type,
      amount: item.amount,
      status: item.status,
      createdAt: item.createdAt,
    })),
    ...client.deposits.map((item) => ({
      id: item.id,
      type: "DEPOSIT",
      amount: item.amount,
      status: item.status,
      createdAt: item.createdAt,
    })),
    ...client.withdrawals.map((item) => ({
      id: item.id,
      type: "WITHDRAWAL",
      amount: item.amount,
      status: item.status,
      createdAt: item.createdAt,
    })),
  ]
    .sort((a: Activity, b: Activity) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 8);

  return (
    <PageShell>
      <div className="space-y-8 pb-12">
        <GlassPanel className="p-8 lg:p-10">
          <div className="grid gap-10 xl:grid-cols-[1.2fr_0.8fr] xl:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.45em] text-[#D8C37A]">
                Private Capital Interface
              </p>

              <h1 className="mt-5 text-5xl font-black uppercase leading-none tracking-[-0.06em] text-white md:text-7xl">
                Welcome,
                <br />
                <span className="bg-gradient-to-r from-white via-[#D8C37A] to-[#00D9FF] bg-clip-text text-transparent">
                  {client.user.name}
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-[#7F8DA3]">
                Monitor your capital, portfolio performance, trading accounts,
                investment opportunities, and financial activity from one
                private operating system.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <GlowButton href="/investments">Early Invest</GlowButton>
                <GlowButton href="/markets" className="from-white/15 via-white/10 to-white/5 text-white">
                  Live Markets
                </GlowButton>
              </div>
            </div>

            <div className="rounded-[34px] border border-white/10 bg-black/30 p-7">
              <p className="text-sm text-[#7F8DA3]">Portfolio Value</p>
              <p className="mt-3 text-6xl font-black tracking-[-0.06em] text-white">
                ${availableEquity.toLocaleString()}
              </p>
              <p className="mt-4 text-sm font-bold text-[#2FFFA7]">
                Profit / Loss: ${totalProfit.toLocaleString()}
              </p>
            </div>
          </div>
        </GlassPanel>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <PremiumMetric
            label="Total Balance"
            value={`$${totalBalance.toLocaleString()}`}
            change="Live account capital"
          />
          <PremiumMetric
            label="Available Equity"
            value={`$${availableEquity.toLocaleString()}`}
            change="Balance plus performance"
            tone="gold"
          />
          <PremiumMetric
            label="Profit / Loss"
            value={`$${totalProfit.toLocaleString()}`}
            change="Current performance"
            tone={totalProfit >= 0 ? "success" : "danger"}
          />
          <PremiumMetric
            label="Accounts"
            value={String(accounts.length)}
            change="Active trading accounts"
          />
        </section>

        <section className="grid gap-8 xl:grid-cols-[1.4fr_0.8fr]">
          <GlassPanel className="p-7">
            <SectionHeader
              eyebrow="Portfolio Intelligence"
              title="Performance Curve"
              description="A private capital overview designed for long-term wealth monitoring."
            />

            <div className="relative mt-8 h-[360px] overflow-hidden rounded-[32px] border border-white/10 bg-black/30 p-6">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px]" />

              <svg
                viewBox="0 0 1000 300"
                preserveAspectRatio="none"
                className="relative z-10 h-full w-full"
              >
                <defs>
                  <linearGradient id="primeCurve" x1="0" x2="1">
                    <stop offset="0%" stopColor="#00D9FF" />
                    <stop offset="50%" stopColor="#6D5BFF" />
                    <stop offset="100%" stopColor="#D8C37A" />
                  </linearGradient>
                </defs>

                <path
                  d="M 0 240 C 90 200, 150 265, 250 180 S 430 75, 540 140 S 690 248, 790 110 S 900 40, 1000 70"
                  fill="none"
                  stroke="url(#primeCurve)"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </GlassPanel>

          <GlassPanel className="p-7">
            <SectionHeader
              eyebrow="Command"
              title="Actions"
              description="Access your most important PrimeLedger tools."
            />

            <div className="mt-8 space-y-3">
              <Action href="/investments" label="Early Invest Opportunities" />
              <Action href="/markets" label="Open Live Markets" />
              <Action href="/dashboard#accounts" label="Portfolio Accounts" />
              <Action href="/dashboard#activity" label="Recent Activity" />
              <Action href="/api/auth/signout" label="Logout" danger />
            </div>
          </GlassPanel>
        </section>

        <section id="accounts">
          <GlassPanel className="p-7">
            <SectionHeader
              eyebrow="Capital Accounts"
              title="Your Portfolio"
              description="Trading accounts connected to your private PrimeLedger profile."
            />

            <div className="mt-8 grid gap-5 xl:grid-cols-3">
              {accounts.length === 0 ? (
                <p className="text-slate-400">No accounts available yet.</p>
              ) : (
                accounts.map((account: Account) => (
                  <div
                    key={account.id}
                    className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:border-[#00D9FF]/30 hover:shadow-[0_0_70px_rgba(0,217,255,0.1)]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-2xl font-black text-white">
                        {account.accountId}
                      </h3>
                      <span className="rounded-full border border-[#2FFFA7]/20 bg-[#2FFFA7]/10 px-3 py-1 text-xs font-bold text-[#2FFFA7]">
                        {account.status}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-[#7F8DA3]">
                      {account.accountType}
                    </p>

                    <div className="mt-8">
                      <p className="text-sm text-[#7F8DA3]">Balance</p>
                      <p className="mt-2 text-4xl font-black text-white">
                        ${Number(account.balance || 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="mt-6">
                      <p className="text-sm text-[#7F8DA3]">Profit / Loss</p>
                      <p className="mt-2 text-2xl font-black text-[#D8C37A]">
                        ${Number(account.profitLoss || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassPanel>
        </section>

        <section id="activity">
          <GlassPanel className="p-7">
            <SectionHeader
              eyebrow="Activity Stream"
              title="Recent Movement"
              description="Latest deposits, withdrawals, transactions, and adjustments."
            />

            <div className="mt-8 overflow-hidden rounded-[32px] border border-white/10 bg-black/25">
              {activities.length === 0 ? (
                <p className="p-6 text-[#7F8DA3]">No recent activity yet.</p>
              ) : (
                activities.map((activity: Activity) => (
                  <div
                    key={activity.id}
                    className="grid gap-4 border-b border-white/10 px-6 py-5 text-sm last:border-b-0 md:grid-cols-4"
                  >
                    <span className="font-semibold text-white">
                      {activity.type}
                    </span>

                    <span className="font-bold text-[#D8C37A]">
                      ${Number(activity.amount || 0).toLocaleString()}
                    </span>

                    <span className="font-bold text-[#2FFFA7]">
                      {activity.status}
                    </span>

                    <span className="text-[#7F8DA3]">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </GlassPanel>
        </section>
      </div>
    </PageShell>
  );
}

function Action({
  href,
  label,
  danger = false,
}: {
  href: string;
  label: string;
  danger?: boolean;
}) {
  return (
    <a
      href={href}
      className={`block rounded-2xl border px-5 py-4 font-semibold transition ${
        danger
          ? "border-[#FF5D7D]/20 bg-[#FF5D7D]/5 text-[#FF5D7D] hover:bg-[#FF5D7D]/10"
          : "border-white/10 bg-white/[0.04] text-slate-200 hover:border-[#00D9FF]/30 hover:bg-[#00D9FF]/10 hover:text-[#00D9FF]"
      }`}
    >
      {label}
    </a>
  );
}