import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageShell from "@/components/ui/PageShell";
import GlassPanel from "@/components/ui/GlassPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import GlowButton from "@/components/ui/GlowButton";
import ProductEditForm from "@/components/products/ProductEditForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    notFound();
  }

  return (
    <PageShell>
      <div className="space-y-8 pb-12">
        <GlassPanel className="p-8 lg:p-10">
          <SectionHeader
            eyebrow="PrimeLedger Administration"
            title={`Edit ${product.name}`}
            description="Update product details, rates, capacity, availability, and client-facing configuration."
            action={
              <GlowButton
                href="/admin/products"
                className="from-white/15 via-white/10 to-white/5 text-white"
              >
                Back to Products
              </GlowButton>
            }
          />
        </GlassPanel>

        <GlassPanel className="p-7">
          <ProductEditForm
            product={{
              id: product.id,
              name: product.name,
              description: product.description,
              type: product.type,
              currency: product.currency,
              minimumAmount: String(product.minimumAmount),
              maximumAmount: product.maximumAmount
                ? String(product.maximumAmount)
                : "",
              interestRate: String(product.interestRate),
              durationDays: String(product.durationDays),
              totalCapacity: product.totalCapacity
                ? String(product.totalCapacity)
                : "",
              allowEarlyExit: product.allowEarlyExit,
              status: product.status,
            }}
          />
        </GlassPanel>
      </div>
    </PageShell>
  );
}