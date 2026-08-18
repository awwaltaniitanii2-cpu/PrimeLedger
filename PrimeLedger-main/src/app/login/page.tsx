"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import AuroraBackground from "@/components/ui/AuroraBackground";
import GlassPanel from "@/components/ui/GlassPanel";
import PrimeLogo from "@/components/ui/PrimeLogo";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      alert("Invalid username or password");
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#040509] text-white">
      <AuroraBackground />

      <section className="relative z-10 grid min-h-screen items-center gap-10 px-6 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-20">
        <div>
          <Link href="/" className="inline-block">
            <PrimeLogo />
          </Link>

          <p className="mt-14 text-xs font-semibold uppercase tracking-[0.55em] text-[#D8C37A]">
            Secure Private Access
          </p>

          <h1 className="mt-6 text-6xl font-black uppercase leading-none tracking-[-0.08em] md:text-8xl">
            Enter
            <br />
            The
            <br />
            <span className="bg-gradient-to-r from-white via-[#D8C37A] to-[#00D9FF] bg-clip-text text-transparent">
              Capital OS
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-[#7F8DA3]">
            Access PrimeLedger’s private investment infrastructure, portfolio
            intelligence, live markets, and capital command center.
          </p>
        </div>

        <GlassPanel className="mx-auto w-full max-w-md p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#D8C37A]">
            Authentication
          </p>

          <h2 className="mt-4 text-4xl font-black tracking-[-0.05em]">
            Sign In
          </h2>

          <p className="mt-3 text-sm leading-6 text-[#7F8DA3]">
            Authorized PrimeLedger clients and administrators only.
          </p>

          <div className="mt-8 space-y-5">
            <Input
              label="Username"
              placeholder="Enter username"
              value={username}
              onChange={setUsername}
            />

            <Input
              label="Password"
              placeholder="Enter password"
              type="password"
              value={password}
              onChange={setPassword}
            />

            <button
              onClick={handleLogin}
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#00D9FF] via-[#6D5BFF] to-[#D8C37A] px-6 py-4 font-black text-black shadow-[0_0_40px_rgba(0,217,255,.18)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_70px_rgba(216,195,122,.24)] disabled:pointer-events-none disabled:opacity-50"
            >
              <span className="absolute inset-0 translate-x-[-120%] bg-white/40 blur-xl transition duration-700 group-hover:translate-x-[120%]" />
              <span className="relative z-10">
                {loading ? "Authenticating..." : "Enter PrimeLedger"}
              </span>
            </button>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-black/25 p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-[#7F8DA3]">
              Security Notice
            </p>
            <p className="mt-3 text-sm leading-6 text-[#7F8DA3]">
              All access attempts are restricted to approved PrimeLedger users.
            </p>
          </div>
        </GlassPanel>
      </section>
    </main>
  );
}

function Input({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7F8DA3]">
        {label}
      </span>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none transition placeholder:text-[#566174] focus:border-[#00D9FF]/50 focus:bg-black/40"
      />
    </label>
  );
}