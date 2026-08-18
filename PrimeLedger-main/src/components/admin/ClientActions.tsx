"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ClientStatus = "ACTIVE" | "REVIEW" | "SUSPENDED" | "CLOSED";

export default function ClientActions({
  clientId,
  clientName,
}: {
  clientId: string;
  clientName: string;
}) {
  const [status, setStatus] = useState<ClientStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadClient() {
      try {
        const response = await fetch(`/api/clients/${clientId}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Failed to load client.");
        }

        setStatus(data.client.status as ClientStatus);
      } catch (error) {
        console.error("LOAD_CLIENT_STATUS_ERROR:", error);
      } finally {
        setLoadingStatus(false);
      }
    }

    void loadClient();
  }, [clientId]);

  async function updateStatus(nextStatus: ClientStatus) {
    if (updating || nextStatus === status) {
      return;
    }

    const confirmed = window.confirm(
      `${nextStatus === "ACTIVE" ? "Activate" : "Suspend"} ${clientName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdating(true);

      const response = await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to update client status.");
      }

      setStatus(data.client.status as ClientStatus);
      window.location.reload();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Failed to update client status."
      );
    } finally {
      setUpdating(false);
    }
  }

  async function deleteClient() {
    const confirmed = window.confirm(
      `Delete ${clientName}?\n\nThis permanently removes the client, login, accounts, transactions, investments, subscriptions, deposits, withdrawals, and invitations.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      const response = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to delete client.");
      }

      window.location.reload();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Failed to delete client."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex min-w-[250px] flex-wrap gap-2">
      <Link
        href={`/admin/clients/${clientId}/edit`}
        className="rounded-xl border border-[#00D9FF]/30 bg-[#00D9FF]/10 px-3 py-2 text-xs font-bold text-[#00D9FF] transition hover:bg-[#00D9FF]/20"
      >
        Edit
      </Link>

      {loadingStatus ? (
        <span className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-[#7F8DA3]">
          Loading...
        </span>
      ) : status === "ACTIVE" ? (
        <button
          type="button"
          onClick={() => updateStatus("SUSPENDED")}
          disabled={updating}
          className="rounded-xl border border-[#D8C37A]/30 bg-[#D8C37A]/10 px-3 py-2 text-xs font-bold text-[#D8C37A] transition hover:bg-[#D8C37A]/20 disabled:pointer-events-none disabled:opacity-50"
        >
          {updating ? "Updating..." : "Suspend"}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => updateStatus("ACTIVE")}
          disabled={updating}
          className="rounded-xl border border-[#2FFFA7]/30 bg-[#2FFFA7]/10 px-3 py-2 text-xs font-bold text-[#2FFFA7] transition hover:bg-[#2FFFA7]/20 disabled:pointer-events-none disabled:opacity-50"
        >
          {updating ? "Updating..." : "Activate"}
        </button>
      )}

      <button
        type="button"
        onClick={deleteClient}
        disabled={deleting}
        className="rounded-xl border border-[#FF5D7D]/30 bg-[#FF5D7D]/10 px-3 py-2 text-xs font-bold text-[#FF5D7D] transition hover:bg-[#FF5D7D]/20 disabled:pointer-events-none disabled:opacity-50"
      >
        {deleting ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}