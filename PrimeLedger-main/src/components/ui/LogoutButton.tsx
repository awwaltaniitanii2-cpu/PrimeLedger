"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mt-5 block w-full rounded-2xl border border-white/10 px-4 py-3 text-left text-sm font-semibold text-slate-400 transition hover:border-[#FF5D7D]/40 hover:bg-[#FF5D7D]/10 hover:text-[#FF5D7D]"
      >
        Logout
      </button>

      {open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 px-6 backdrop-blur-xl">
          <div className="w-full max-w-lg rounded-[34px] border border-white/10 bg-[#070A10]/95 p-8 text-center shadow-[0_0_120px_rgba(0,217,255,0.12)]">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#D8C37A]">
              Secure Session
            </p>

            <h2 className="mt-4 text-4xl font-black text-white">
              Sign out?
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#7F8DA3]">
              Your PrimeLedger session will be securely closed. You can sign in
              again anytime.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 font-bold text-white transition hover:bg-white/[0.08]"
              >
                Cancel
              </button>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-2xl bg-gradient-to-r from-[#00D9FF] via-[#6D5BFF] to-[#D8C37A] px-6 py-4 font-black text-black transition hover:scale-[1.02]"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}