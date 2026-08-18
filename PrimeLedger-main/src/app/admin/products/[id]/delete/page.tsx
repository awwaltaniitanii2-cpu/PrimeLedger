import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageShell from "@/components/ui/PageShell";
import GlassPanel from "@/components/ui/GlassPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import GlowButton from "@/components/ui/GlowButton";
import ProductDeleteButton from "@/components/products/ProductDeleteButton";

export const dynamic = "force-dynamic";

export default async function DeleteProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      subscriptions: true,
    },
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
            title={`Delete ${product.name}`}
            description="This action permanently removes the product. Use caution if clients are already subscribed."
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
          <div className="rounded-[30px] border border-[#FF5D7D]/20 bg-[#FF5D7D]/10 p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#FF5D7D]">
              Destructive Action
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-white">
              Confirm Product Deletion
            </h2>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#7F8DA3]">
              Product: <span className="font-bold text-white">{product.name}</span>
              <br />
              Type: <span className="font-bold text-white">{product.type}</span>
              <br />
              Current subscriptions:{" "}
              <span className="font-bold text-white">
                {product.subscriptions.length}
              </span>
            </p>

            <ProductDeleteButton productId={product.id} />
          </div>
        </GlassPanel>
      </div>
    </PageShell>
  );
}