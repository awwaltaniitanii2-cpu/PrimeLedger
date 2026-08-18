import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import PageShell from "@/components/ui/PageShell";
import GlassPanel from "@/components/ui/GlassPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import GlowButton from "@/components/ui/GlowButton";

export const dynamic = "force-dynamic";

type InvestmentCard = {
  id: string;
  title: string;
  description: string;
  minimumAmount: unknown;
  expectedROI: unknown;
  durationDays: number;
  totalCapacity: unknown;
  investedTotal: unknown;
  status: string;
};

export default async function InvestmentsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const investments = (await prisma.investment.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
  })) as InvestmentCard[];

  return (
    <PageShell>
      <div className="space-y-8 pb-12">
        <GlassPanel className="p-8 lg:p-10">
          <SectionHeader
            eyebrow="PrimeLedger Early Invest"
            title="Private Investment Opportunities"
            description="Exclusive capital opportunities curated for invited PrimeLedger clients. Review funding progress, ROI targets, duration, and remaining allocation."
            action={<GlowButton href="/dashboard">Dashboard</GlowButton>}
          />
        </GlassPanel>

        {investments.length === 0 ? (
          <GlassPanel className="p-10">
            <h2 className="text-4xl font-black tracking-[-0.04em]">
              No Open Investments
            </h2>
            <p className="mt-4 max-w-2xl text-[#7F8DA3]">
              New private investment opportunities will appear here once opened
              by PrimeLedger.
            </p>
          </GlassPanel>
        ) : (
          <section className="grid gap-6 xl:grid-cols-3">
            {investments.map((investment: InvestmentCard) => {
              const totalCapacity = Number(investment.totalCapacity || 0);
              const investedTotal = Number(investment.investedTotal || 0);
              const progress =
                totalCapacity > 0
                  ? Math.min((investedTotal / totalCapacity) * 100, 100)
                  : 0;

              return (
                <GlassPanel key={investment.id} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.32em] text-[#D8C37A]">
                        Private Allocation
                      </p>

                      <h2 className="mt-4 text-3xl font-black tracking-[-0.04em]">
                        {investment.title}
                      </h2>

                      <p className="mt-4 text-sm leading-7 text-[#7F8DA3]">
                        {investment.description}
                      </p>
                    </div>

                    <span className="rounded-full border border-[#2FFFA7]/20 bg-[#2FFFA7]/10 px-3 py-1 text-xs font-bold text-[#2FFFA7]">
                      {investment.status}
                    </span>
                  </div>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <Metric
                      label="Minimum"
                      value={`$${Number(
                        investment.minimumAmount || 0
                      ).toLocaleString()}`}
                    />

                    <Metric
                      label="Expected ROI"
                      value={`${Number(investment.expectedROI || 0)}%`}
                    />

                    <Metric
                      label="Duration"
                      value={`${investment.durationDays} days`}
                    />

                    <Metric
                      label="Capacity"
                      value={`$${totalCapacity.toLocaleString()}`}
                    />
                  </div>

                  <div className="mt-8 rounded-[26px] border border-white/10 bg-black/25 p-5">
                    <div className="mb-3 flex justify-between text-sm">
                      <span className="text-[#7F8DA3]">Funding Progress</span>
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
                      ${investedTotal.toLocaleString()} funded of $
                      {totalCapacity.toLocaleString()}
                    </p>
                  </div>

                  <GlowButton
                    href={`/investments/${investment.id}`}
                    className="mt-7 w-full"
                  >
                    View Opportunity
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-xl font-black text-[#D8C37A]">{value}</p>
    </div>
  );
}