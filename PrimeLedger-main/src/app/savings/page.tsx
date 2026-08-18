import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

import PageShell from "@/components/ui/PageShell";
import GlassPanel from "@/components/ui/GlassPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import GlowButton from "@/components/ui/GlowButton";

export const dynamic = "force-dynamic";

type Product = {
  id: string;
  name: string;
  description: string;
  currency: string;
  minimumAmount: unknown;
  maximumAmount: unknown;
  interestRate: unknown;
  durationDays: number;
  totalCapacity: unknown;
  investedTotal: unknown;
  allowEarlyExit: boolean;
  status: string;
};

export default async function SavingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const products = (await prisma.product.findMany({
    where: {
      type: "SAVINGS",
      status: "ACTIVE",
    },
    orderBy: {
      createdAt: "desc",
    },
  })) as Product[];

  return (
    <PageShell>
      <div className="space-y-8 pb-12">
        <GlassPanel className="p-8 lg:p-10">
          <SectionHeader
            eyebrow="PrimeLedger Savings"
            title="Structured Savings Products"
            description="Browse active savings products created by PrimeLedger administrators. Choose fixed-duration savings plans with defined APY, capacity, and maturity timelines."
            action={<GlowButton href="/dashboard">Dashboard</GlowButton>}
          />
        </GlassPanel>

        {products.length === 0 ? (
          <GlassPanel className="p-10">
            <h2 className="text-4xl font-black tracking-[-0.04em] text-white">
              No Active Savings Products
            </h2>
            <p className="mt-4 max-w-2xl text-[#7F8DA3]">
              Active savings products will appear here once they are created by
              PrimeLedger administrators.
            </p>
          </GlassPanel>
        ) : (
          <section className="grid gap-6 xl:grid-cols-3">
            {products.map((product) => {
              const capacity = Number(product.totalCapacity || 0);
              const invested = Number(product.investedTotal || 0);
              const progress =
                capacity > 0 ? Math.min((invested / capacity) * 100, 100) : 0;

              return (
                <GlassPanel key={product.id} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.32em] text-[#D8C37A]">
                        Savings Product
                      </p>

                      <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-white">
                        {product.name}
                      </h2>

                      <p className="mt-4 text-sm leading-7 text-[#7F8DA3]">
                        {product.description}
                      </p>
                    </div>

                    <span className="rounded-full border border-[#2FFFA7]/20 bg-[#2FFFA7]/10 px-3 py-1 text-xs font-bold text-[#2FFFA7]">
                      ACTIVE
                    </span>
                  </div>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <Metric
                      label="APY"
                      value={`${Number(product.interestRate || 0)}%`}
                      tone="gold"
                    />
                    <Metric
                      label="Minimum"
                      value={`${product.currency} ${Number(
                        product.minimumAmount || 0
                      ).toLocaleString()}`}
                    />
                    <Metric
                      label="Duration"
                      value={`${product.durationDays} days`}
                    />
                    <Metric
                      label="Early Exit"
                      value={product.allowEarlyExit ? "Allowed" : "Locked"}
                    />
                  </div>

                  {product.totalCapacity ? (
                    <div className="mt-8 rounded-[26px] border border-white/10 bg-black/25 p-5">
                      <div className="mb-3 flex justify-between text-sm">
                        <span className="text-[#7F8DA3]">Capacity</span>
                        <span className="font-bold text-[#D8C37A]">
                          {progress.toFixed(0)}%
                        </span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#00D9FF] via-[#6D5BFF] to-[#D8C37A]"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <p className="mt-3 text-sm text-[#7F8DA3]">
                        {product.currency} {invested.toLocaleString()} of{" "}
                        {product.currency} {capacity.toLocaleString()}
                      </p>
                    </div>
                  ) : null}

                  <GlowButton href={`/savings/${product.id}`} className="mt-7 w-full">
                    View Savings Plan
                  </GlowButton>
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
  tone?: "default" | "gold";
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
        {label}
      </p>
      <p
        className={`mt-2 text-xl font-black ${
          tone === "gold" ? "text-[#D8C37A]" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}