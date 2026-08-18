"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/ui/PageShell";
import GlassPanel from "@/components/ui/GlassPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import GlowButton from "@/components/ui/GlowButton";

type Client = {
  id: string;
  user?: {
    name?: string;
    email?: string;
  };
  name?: string;
  email?: string;
};

export default function AdminInvitesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [loadingClients, setLoadingClients] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadClients() {
    try {
      setLoadingClients(true);
      setError("");

      const response = await fetch("/api/clients/list", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to load clients.");
      }

      const loadedClients = data.clients || data || [];

      setClients(loadedClients);

      if (loadedClients.length > 0) {
        setClientId(loadedClients[0].id);
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load clients."
      );
    } finally {
      setLoadingClients(false);
    }
  }

  async function generateInvite() {
    setMessage("");
    setError("");
    setInviteUrl("");

    if (!clientId) {
      setError("Please select a client first.");
      return;
    }

    try {
      setGenerating(true);

      const response = await fetch("/api/invites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clientId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to generate invite.");
      }

      setInviteUrl(data.inviteUrl);
      setMessage("Invitation link generated successfully.");
    } catch (generateError) {
      setError(
        generateError instanceof Error
          ? generateError.message
          : "Failed to generate invite."
      );
    } finally {
      setGenerating(false);
    }
  }

  async function copyInvite() {
    if (!inviteUrl) return;

    await navigator.clipboard.writeText(inviteUrl);
    setMessage("Invitation link copied to clipboard.");
  }

  useEffect(() => {
    void loadClients();
  }, []);

  return (
    <PageShell>
      <div className="space-y-8 pb-12">
        <GlassPanel className="p-8 lg:p-10">
          <SectionHeader
            eyebrow="PrimeLedger Administration"
            title="Invitation Center"
            description="Generate secure invitation links for approved clients and onboard them into the PrimeLedger private capital environment."
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

        {message ? (
          <div className="rounded-2xl border border-[#2FFFA7]/20 bg-[#2FFFA7]/10 px-6 py-4 text-sm font-semibold text-[#2FFFA7]">
            {message}
          </div>
        ) : null}

        <section className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
          <GlassPanel className="p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#D8C37A]">
              Generate Access
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-white">
              Client Invite
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#7F8DA3]">
              Select a client and generate a secure invitation link. Send this
              link only through trusted communication channels.
            </p>

            <div className="mt-8">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7F8DA3]">
                  Client
                </span>

                <select
                  value={clientId}
                  onChange={(event) => setClientId(event.target.value)}
                  disabled={loadingClients || clients.length === 0}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#090C12] px-5 py-4 text-white outline-none transition focus:border-[#00D9FF]/50 disabled:opacity-50"
                >
                  {clients.length === 0 ? (
                    <option value="">No clients available</option>
                  ) : (
                    clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.user?.name || client.name || "Unnamed Client"} —{" "}
                        {client.user?.email || client.email || "No email"}
                      </option>
                    ))
                  )}
                </select>
              </label>

              <button
                type="button"
                onClick={generateInvite}
                disabled={generating || loadingClients || !clientId}
                className="group relative mt-6 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#00D9FF] via-[#6D5BFF] to-[#D8C37A] px-6 py-4 font-black text-black shadow-[0_0_40px_rgba(0,217,255,.18)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_70px_rgba(216,195,122,.24)] disabled:pointer-events-none disabled:opacity-50"
              >
                <span className="absolute inset-0 translate-x-[-120%] bg-white/40 blur-xl transition duration-700 group-hover:translate-x-[120%]" />

                <span className="relative z-10">
                  {generating ? "Generating Invite..." : "Generate Invite Link"}
                </span>
              </button>
            </div>
          </GlassPanel>

          <GlassPanel className="p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#D8C37A]">
              Secure Link
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-white">
              Invitation Output
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#7F8DA3]">
              Newly generated invite links will appear here. Existing links
              remain valid according to their expiry settings.
            </p>

            {inviteUrl ? (
              <div className="mt-8 rounded-[28px] border border-white/10 bg-black/30 p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-[#7F8DA3]">
                  Generated URL
                </p>

                <div className="mt-4 break-all rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm text-[#D8C37A]">
                  {inviteUrl}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={copyInvite}
                    className="rounded-2xl border border-[#00D9FF]/30 bg-[#00D9FF]/10 px-5 py-3 text-sm font-bold text-[#00D9FF] transition hover:bg-[#00D9FF]/20"
                  >
                    Copy Link
                  </button>

                  <a
                    href={inviteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-white transition hover:border-[#D8C37A]/30 hover:text-[#D8C37A]"
                  >
                    Open Invite
                  </a>
                </div>
              </div>
            ) : (
              <div className="mt-8 rounded-[28px] border border-dashed border-white/10 bg-black/20 p-10 text-center">
                <p className="text-2xl font-black text-white">
                  No Invite Generated
                </p>

                <p className="mt-3 text-sm leading-6 text-[#7F8DA3]">
                  Select a client and generate an invite link to begin the
                  onboarding flow.
                </p>
              </div>
            )}
          </GlassPanel>
        </section>

        <GlassPanel className="p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#D8C37A]">
            Invitation Protocol
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white">
            Secure Onboarding Notes
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <InfoCard
              title="Invite Only"
              description="Only approved clients should receive PrimeLedger access links."
            />

            <InfoCard
              title="Private Delivery"
              description="Send invite URLs through secure and verified communication channels."
            />

            <InfoCard
              title="Live Domain"
              description="Production links should use the Railway PrimeLedger domain, not localhost."
            />
          </div>
        </GlassPanel>
      </div>
    </PageShell>
  );
}

function InfoCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5">
      <p className="font-bold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#7F8DA3]">{description}</p>
    </div>
  );
}