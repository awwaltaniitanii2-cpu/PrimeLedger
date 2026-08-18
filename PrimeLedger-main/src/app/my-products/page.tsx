import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

import PageShell from "@/components/ui/PageShell";
import GlassPanel from "@/components/ui/GlassPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import GlowButton from "@/components/ui/GlowButton";

export const dynamic = "force-dynamic";

type Subscription = {
  id: string;
  amount: unknown;
  expectedValue: unknown;
  startDate: Date;
  endDate: Date;
  status: string;
  product: {
    name: string;
    type: string;
    currency: string;
    interestRate: unknown;
    durationDays: number;
  };
};

export default async function MyProductsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as { id?: string };

  const client = await prisma.client.findUnique({
    where: { userId: user.id },
  });

  if (!client) {
    redirect("/dashboard");
  }

  const subscriptions = (await prisma.productSubscription.findMany({
    where: {
      clientId: client.id,
    },
    include: {
      product: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })) as Subscription[];

  return (
    <PageShell>
      <div className="space-y-8 pb-12">
        <GlassPanel className="p-8 lg:p-10">
          <SectionHeader
            eyebrow="PrimeLedger Products"
            title="My Savings & Staking"
            description="Track your active savings and staking subscriptions, expected values, maturity dates, and product status."
            action={<GlowButton href="/dashboard">Dashboard</GlowButton>}
          />
        </GlassPanel>

        {subscriptions.length === 0 ? (
          <GlassPanel className="p-10">
            <h2 className="text-4xl font-black tracking-[-0.04em] text-white">
              No Active Product Subscriptions
            </h2>

            <p className="mt-4 max-w-2xl text-[#7F8DA3]">
              Your savings and staking subscriptions will appear here after you
              subscribe to a PrimeLedger product.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <GlowButton href="/savings">Browse Savings</GlowButton>
              <GlowButton
                href="/staking"
                className="from-white/15 via-white/10 to-white/5 text-white"
              >
                Browse Staking
              </GlowButton>
            </div>
          </GlassPanel>
        ) : (
          <section className="grid gap-6 xl:grid-cols-3">
            {subscriptions.map((subscription) => {
              const amount = Number(subscription.amount || 0);
              const expectedValue = Number(subscription.expectedValue || 0);
              const profit = expectedValue - amount;

              return (
                <GlassPanel key={subscription.id} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.32em] text-[#D8C37A]">
                        {subscription.product.type}
                      </p>

                      <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-white">
                        {subscription.product.name}
                      </h2>

                      <p className="mt-3 text-sm text-[#7F8DA3]">
                        {subscription.product.currency} product ·{" "}
                        {subscription.product.durationDays} days
                      </p>
                    </div>

                    <span className="rounded-full border border-[#2FFFA7]/20 bg-[#2FFFA7]/10 px-3 py-1 text-xs font-bold text-[#2FFFA7]">
                      {subscription.status}
                    </span>
                  </div>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <Metric
                      label="Amount"
                      value={`${subscription.product.currency} ${amount.toLocaleString()}`}
                    />

                    <Metric
                      label="Expected"
                      value={`${subscription.product.currency} ${expectedValue.toLocaleString()}`}
                      tone="gold"
                    />

                    <Metric
                      label="Return"
                      value={`${subscription.product.currency} ${profit.toLocaleString()}`}
                      tone="success"
                    />

                    <Metric
                      label="Rate"
                      value={`${Number(
                        subscription.product.interestRate || 0
                      )}%`}
                      tone="gold"
                    />
                  </div>

                  <div className="mt-8 rounded-[26px] border border-white/10 bg-black/25 p-5">
                    <p className="text-xs uppercase tracking-[0.25em] text-[#7F8DA3]">
                      Timeline
                    </p>

                    <p className="mt-3 text-sm text-white">
                      Start:{" "}
                      {new Date(subscription.startDate).toLocaleDateString()}
                    </p>

                    <p className="mt-2 text-sm text-white">
                      Maturity:{" "}
                      {new Date(subscription.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </GlassPanel>
              );
            })}
          </section>
        )}
      </div>
    </PageShell>
  );
}

function Metric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "gold" | "success";
}) {
  const color =
    tone === "gold"
      ? "text-[#D8C37A]"
      : tone === "success"
      ? "text-[#2FFFA7]"
      : "text-white";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-[#7F8DA3]">
        {label}
      </p>

      <p className={`mt-2 text-xl font-black ${color}`}>{value}</p>
    </div>
  );
}