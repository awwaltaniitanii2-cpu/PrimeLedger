import Link from "next/link";
import PrimeLogo from "./PrimeLogo";
import GlassPanel from "./GlassPanel";
import LogoutButton from "./LogoutButton";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/investments", label: "Investments" },
  { href: "/savings", label: "Savings" },
  { href: "/staking", label: "Staking" },
  { href: "/my-products", label: "My Products" },
  { href: "/markets", label: "Markets" },
  { href: "/dashboard#accounts", label: "Portfolio" },
  { href: "/dashboard#activity", label: "Activity" },
];

export default function FloatingDock() {
  return (
    <GlassPanel className="fixed left-6 top-6 z-50 hidden w-[280px] p-5 lg:block">
      <PrimeLogo />

      <nav className="mt-10 space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
          >
            {link.label}
          </Link>
        ))}

        <LogoutButton />
      </nav>
    </GlassPanel>
  );
}