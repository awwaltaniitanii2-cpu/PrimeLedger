import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

import PageShell from "@/components/ui/PageShell";
import GlassPanel from "@/components/ui/GlassPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import GlowButton from "@/components/ui/GlowButton";
import ClientEditForm from "@/components/admin/ClientEditForm";

export const dynamic = "force-dynamic";

type ClientStatus = "ACTIVE" | "REVIEW" | "SUSPENDED" | "CLOSED";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const currentUser = session.user as {
    role?: string;
  };

  if (currentUser.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      user: true,
      accounts: true,
      investments: true,
      subscriptions: true,
    },
  });

  if (!client) {
    notFound();
  }

  const totalCapital = client.accounts.reduce(
    (sum, account) => sum + Number(account.balance || 0),
    0
  );

  return (
    <PageShell>
      <div className="space-y-8 pb-12">
        <GlassPanel className="p-8 lg:p-10">
          <SectionHeader
            eyebrow="PrimeLedger Administration"
            title={`Edit ${client.user.name}`}
            description="Manage client identity, contact information, and account status."
            action={
              <GlowButton
                href="/admin/clients/list"
                className="from-white/15 via-white/10 to-white/5 text-white"
              >
                Back to Clients
              </GlowButton>
            }
          />
        </GlassPanel>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Metric
            label="Client Status"
            value={client.status}
            tone={
              client.status === "ACTIVE"
                ? "success"
                : client.status === "SUSPENDED"
                  ? "danger"
                  : "gold"
            }
          />

          <Metric
            label="Trading Accounts"
            value={String(client.accounts.length)}
          />

          <Metric
            label="Managed Capital"
            value={`$${totalCapital.toLocaleString()}`}
            tone="gold"
          />

          <Metric
            label="Products"
            value={String(
              client.investments.length + client.subscriptions.length
            )}
          />
        </section>

        <GlassPanel className="p-7">
          <ClientEditForm
            client={{
              id: client.id,
              name: client.user.name,
              email: client.user.email,
              phone: client.phone || "",
              country: client.country || "",
              status: client.status as ClientStatus,
            }}
          />
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
  const valueClass =
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

      <p className={`mt-4 text-3xl font-black tracking-tight ${valueClass}`}>
        {value}
      </p>
    </GlassPanel>
  );
}