import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import InvestmentRequestForm from "@/components/investments/InvestmentRequestForm";
import PageShell from "@/components/ui/PageShell";
import GlassPanel from "@/components/ui/GlassPanel";
import GlowButton from "@/components/ui/GlowButton";
import PremiumMetric from "@/components/ui/PremiumMetric";

export const dynamic = "force-dynamic";

export default async function InvestmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const investment = await prisma.investment.findUnique({
    where: { id },
  });

  if (!investment) {
    notFound();
  }

  const totalCapacity = Number(investment.totalCapacity || 0);
  const investedTotal = Number(investment.investedTotal || 0);
  const progress =
    totalCapacity > 0 ? Math.min((investedTotal / totalCapacity) * 100, 100) : 0;

  return (
    <PageShell>
      <div className="space-y-8 pb-12">
        <GlassPanel className="p-8 lg:p-10">
          <GlowButton href="/investments" className="mb-10">
            ← Opportunities
          </GlowButton>

          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-[#D8C37A]">
            PrimeLedger Early Invest
          </p>

          <h1 className="mt-5 max-w-5xl text-5xl font-black uppercase leading-none tracking-[-0.06em] text-white md:text-7xl">
            {investment.title}
          </h1>

          <p className="mt-6 max-w-3xl text-base leading-8 text-[#7F8DA3]">
            {investment.description}
          </p>
        </GlassPanel>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <PremiumMetric
            label="Minimum Investment"
            value={`$${Number(investment.minimumAmount).toLocaleString()}`}
          />
          <PremiumMetric
            label="Expected ROI"
            value={`${Number(investment.expectedROI)}%`}
            tone="gold"
          />
          <PremiumMetric
            label="Duration"
            value={`${investment.durationDays} Days`}
          />
          <PremiumMetric
            label="Status"
            value={investment.status}
            tone="success"
          />
        </section>

        <GlassPanel className="p-7">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-[#D8C37A]">
                Capital Allocation
              </p>
              <h2 className="mt-3 text-4xl font-black tracking-[-0.05em]">
                Funding Progress
              </h2>
              <p className="mt-4 max-w-2xl text-[#7F8DA3]">
                ${investedTotal.toLocaleString()} funded of $
                {totalCapacity.toLocaleString()} total capacity.
              </p>
            </div>

            <p className="text-6xl font-black tracking-[-0.06em] text-[#D8C37A]">
              {progress.toFixed(0)}%
            </p>
          </div>

          <div className="mt-8 h-5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#00D9FF] via-[#6D5BFF] to-[#D8C37A]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </GlassPanel>

        <GlassPanel className="p-7">
          <InvestmentRequestForm
            investmentId={investment.id}
            minimumAmount={Number(investment.minimumAmount)}
          />
        </GlassPanel>
      </div>
    </PageShell>
  );
}