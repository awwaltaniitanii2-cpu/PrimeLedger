type ActionButtonProps = {
  label: string;
  href?: string;
};

export default function ActionButton({
  label,
  href = "#",
}: ActionButtonProps) {
  return (
    <a
      href={href}
      className="block rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm font-medium text-slate-300 transition-all duration-300 hover:border-emerald-400/40 hover:bg-white/10 hover:text-white"
    >
      {label}
    </a>
  );
}