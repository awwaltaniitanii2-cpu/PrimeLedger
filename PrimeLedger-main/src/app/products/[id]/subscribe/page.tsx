import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

import PageShell from "@/components/ui/PageShell";
import GlassPanel from "@/components/ui/GlassPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import GlowButton from "@/components/ui/GlowButton";
import ProductSubscribeForm from "@/components/products/ProductSubscribeForm";

export const dynamic = "force-dynamic";

export default async function ProductSubscribePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product || product.status !== "ACTIVE") {
    notFound();
  }

  const minimumAmount = Number(product.minimumAmount || 0);
  const maximumAmount = product.maximumAmount
    ? Number(product.maximumAmount)
    : null;
  const interestRate = Number(product.interestRate || 0);

  return (
    <PageShell>
      <div className="space-y-8 pb-12">
        <GlassPanel className="p-8 lg:p-10">
          <SectionHeader
            eyebrow={`PrimeLedger ${product.type}`}
            title={`Subscribe to ${product.name}`}
            description="Enter an amount, review the projected return, and submit your subscription securely."
            action={
              <GlowButton
                href={
                  product.type === "SAVINGS"
                    ? `/savings/${product.id}`
                    : `/staking/${product.id}`
                }
                className="from-white/15 via-white/10 to-white/5 text-white"
              >
                Back
              </GlowButton>
            }
          />
        </GlassPanel>

        <GlassPanel className="p-7">
          <ProductSubscribeForm
            productId={product.id}
            currency={product.currency}
            minimumAmount={minimumAmount}
            maximumAmount={maximumAmount}
            interestRate={interestRate}
            durationDays={product.durationDays}
          />
        </GlassPanel>
      </div>
    </PageShell>
  );
}