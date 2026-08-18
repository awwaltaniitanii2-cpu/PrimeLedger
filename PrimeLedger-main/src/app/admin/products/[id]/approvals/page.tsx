import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

import PageShell from "@/components/ui/PageShell";
import GlassPanel from "@/components/ui/GlassPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import GlowButton from "@/components/ui/GlowButton";
import SubscriptionStatusActions from "@/components/products/SubscriptionStatusActions";

export const dynamic = "force-dynamic";

type SubscriptionStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";

export default async function ProductApprovalsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      subscriptions: {
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
      },
    },
  });

  if (!product) {
    notFound();
  }

  const totalSubscribed = product.subscriptions.reduce(
    (sum, subscription) => sum + Number(subscription.amount || 0),
    0
  );

  const expectedValue = product.subscriptions.reduce(
    (sum, subscription) => sum + Number(subscription.expectedValue || 0),
    0
  );

  const activeSubscriptions = product.subscriptions.filter(
    (subscription) => subscription.status === "ACTIVE"
  ).length;

  const completedSubscriptions = product.subscriptions.filter(
    (subscription) => subscription.status === "COMPLETED"
  ).length;

  const cancelledSubscriptions = product.subscriptions.filter(
    (subscription) => subscription.status === "CANCELLED"
  ).length;

  return (
    <PageShell>
      <div className="space-y-8 pb-12">
        <GlassPanel className="p-8 lg:p-10">
          <SectionHeader
            eyebrow="PrimeLedger Administration"
            title={`${product.name} Subscribers`}
            description="Review client subscriptions and manage their lifecycle status."
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

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          <Metric
            label="Subscribers"
            value={String(product.subscriptions.length)}
          />

          <Metric
            label="Active"
            value={String(activeSubscriptions)}
            tone="success"
          />

          <Metric
            label="Completed"
            value={String(completedSubscriptions)}
            tone="gold"
          />

          <Metric
            label="Cancelled"
            value={String(cancelledSubscriptions)}
            tone="danger"
          />

          <Metric
            label="Subscribed Capital"
            value={`${product.currency} ${totalSubscribed.toLocaleString()}`}
            tone="gold"
          />
        </section>

        <GlassPanel className="p-7">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#D8C37A]">
              Subscription Registry
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-white">
              Client Subscriptions
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#7F8DA3]">
              Total expected value: {product.currency}{" "}
              {expectedValue.toLocaleString()}
            </p>
          </div>

          <div className="overflow-x-auto rounded-[30px] border border-white/10 bg-black/25">
            <div className="min-w-[1180px]">
              <div className="grid grid-cols-[1.1fr_1.35fr_0.9fr_0.9fr_0.9fr_0.75fr_1.3fr] border-b border-white/10 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#7F8DA3]">
                <span>Client</span>
                <span>Email</span>
                <span>Amount</span>
                <span>Expected</span>
                <span>Maturity</span>
                <span>Status</span>
                <span>Actions</span>
              </div>

              {product.subscriptions.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-2xl font-black text-white">
                    No Subscribers Yet
                  </p>

                  <p className="mt-3 text-sm text-[#7F8DA3]">
                    Client subscriptions will appear here.
                  </p>
                </div>
              ) : (
                product.subscriptions.map((subscription) => (
                  <div
                    key={subscription.id}
                    className="grid min-w-[1180px] grid-cols-[1.1fr_1.35fr_0.9fr_0.9fr_0.9fr_0.75fr_1.3fr] items-center border-b border-white/10 px-6 py-5 text-sm last:border-b-0 hover:bg-white/[0.03]"
                  >
                    <span className="font-bold text-white">
                      {subscription.client.user.name}
                    </span>

                    <span className="truncate pr-4 text-[#7F8DA3]">
                      {subscription.client.user.email}
                    </span>

                    <span className="font-black text-[#D8C37A]">
                      {product.currency}{" "}
                      {Number(subscription.amount || 0).toLocaleString()}
                    </span>

                    <span className="font-black text-[#2FFFA7]">
                      {product.currency}{" "}
                      {Number(
                        subscription.expectedValue || 0
                      ).toLocaleString()}
                    </span>

                    <span className="text-[#7F8DA3]">
                      {new Date(subscription.endDate).toLocaleDateString()}
                    </span>

                    <StatusBadge status={subscription.status} />

                    <SubscriptionStatusActions
                      subscriptionId={subscription.id}
                      currentStatus={
                        subscription.status as SubscriptionStatus
                      }
                    />
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

function Metric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "gold" | "success" | "danger";
}) {
  const color =
    tone === "gold"
      ? "text-[#D8C37A]"
      : tone === "success"
        ? "text-[#2FFFA7]"
        : tone === "danger"
          ? "text-[#FF5D7D]"
          : "text-white";

  return (
    <GlassPanel className="p-6">
      <p className="text-xs uppercase tracking-[0.28em] text-[#7F8DA3]">
        {label}
      </p>

      <p className={`mt-4 text-4xl font-black tracking-tight ${color}`}>
        {value}
      </p>
    </GlassPanel>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "ACTIVE"
      ? "border-[#2FFFA7]/20 bg-[#2FFFA7]/10 text-[#2FFFA7]"
      : status === "COMPLETED"
        ? "border-[#D8C37A]/20 bg-[#D8C37A]/10 text-[#D8C37A]"
        : "border-[#FF5D7D]/20 bg-[#FF5D7D]/10 text-[#FF5D7D]";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${styles}`}
    >
      {status}
    </span>
  );
}