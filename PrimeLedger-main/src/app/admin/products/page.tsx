"use client";

import { useCallback, useEffect, useState } from "react";
import PageShell from "@/components/ui/PageShell";
import GlassPanel from "@/components/ui/GlassPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import GlowButton from "@/components/ui/GlowButton";
import ProductForm from "@/components/products/ProductForm";
import ProductTable, { type ProductRow } from "@/components/products/ProductTable";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/products", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to load products.");
      }

      setProducts(data.products || []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load products."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const savingsCount = products.filter((product) => product.type === "SAVINGS").length;
  const stakingCount = products.filter((product) => product.type === "STAKING").length;
  const activeCount = products.filter((product) => product.status === "ACTIVE").length;

  const totalCapacity = products.reduce(
    (sum, product) => sum + Number(product.totalCapacity || 0),
    0
  );

  const investedTotal = products.reduce(
    (sum, product) => sum + Number(product.investedTotal || 0),
    0
  );

  return (
    <PageShell>
      <div className="space-y-8 pb-12">
        <GlassPanel className="p-8 lg:p-10">
          <SectionHeader
            eyebrow="PrimeLedger Administration"
            title="Savings & Staking Products"
            description="Create and manage client-facing savings and staking products from one PrimeLedger product registry."
            action={
              <GlowButton
                href="/admin"
                className="from-white/15 via-white/10 to-white/5 text-white"
              >
                Admin Dashboard
              </GlowButton>
            }
          />
        </GlassPanel>

        {error ? (
          <div className="rounded-2xl border border-[#FF5D7D]/20 bg-[#FF5D7D]/10 px-6 py-4 text-sm font-semibold text-[#FF5D7D]">
            {error}
          </div>
        ) : null}

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Total Products"
            value={String(products.length)}
            description="Savings and staking products"
          />

          <SummaryCard
            label="Savings"
            value={String(savingsCount)}
            description="Savings products"
            tone="gold"
          />

          <SummaryCard
            label="Staking"
            value={String(stakingCount)}
            description="Staking products"
            tone="success"
          />

          <SummaryCard
            label="Active"
            value={String(activeCount)}
            description={`$${investedTotal.toLocaleString()} of $${totalCapacity.toLocaleString()} capacity used`}
          />
        </section>

        <section className="grid gap-8 xl:grid-cols-[420px_1fr]">
          <GlassPanel className="h-fit p-7">
            <ProductForm onCreated={loadProducts} />
          </GlassPanel>

          <GlassPanel className="p-7">
            <ProductTable
              products={products}
              loading={loading}
              onRefresh={loadProducts}
            />
          </GlassPanel>
        </section>
      </div>
    </PageShell>
  );
}

function SummaryCard({
  label,
  value,
  description,
  tone = "default",
}: {
  label: string;
  value: string;
  description: string;
  tone?: "default" | "gold" | "success";
}) {
  const valueClass =
    tone === "gold"
      ? "text-[#D8C37A]"
      : tone === "success"
      ? "text-[#2FFFA7]"
      : "text-white";

  return (
    <GlassPanel className="p-6">
      <p className="text-xs uppercase tracking-[0.28em] text-[#7F8DA3]">
        {label}
      </p>

      <p className={`mt-4 text-4xl font-black tracking-tight ${valueClass}`}>
        {value}
      </p>

      <p className="mt-3 text-sm text-[#7F8DA3]">{description}</p>
    </GlassPanel>
  );
}