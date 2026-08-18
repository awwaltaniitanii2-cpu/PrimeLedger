type AdminLayoutProps = {
  children: React.ReactNode;
  title: string;
  subtitle: string;
};

const navItems = [
  ["Overview", "/admin"],
  ["Clients", "/admin/clients/list"],
  ["Accounts", "/admin/accounts"],
  ["Deposits", "#"],
  ["Withdrawals", "#"],
  ["Performance", "#"],
  ["Support", "#"],
  ["Audit Logs", "#"],
  ["Settings", "#"],
];

export default function AdminLayout({
  children,
  title,
  subtitle,
}: AdminLayoutProps) {
  return (
    <main className="min-h-screen bg-[#04070F] text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute left-[-200px] top-[-200px] h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute right-[-250px] top-[150px] h-[500px] w-[500px] rounded-full bg-yellow-500/10 blur-[140px]" />
        <div className="absolute bottom-[-250px] left-[30%] h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[180px]" />
      </div>

      <div className="relative flex min-h-screen">
        {/* Floating Sidebar */}
        <aside className="hidden lg:block">
          <div className="fixed left-6 top-6 bottom-6 w-72 rounded-[32px] border border-white/10 bg-black/30 backdrop-blur-2xl">
            <div className="p-8">
              <h1 className="text-3xl font-black tracking-tight">
                Prime<span className="text-emerald-400">Ledger</span>
              </h1>

              <p className="mt-2 text-xs uppercase tracking-[0.3em] text-yellow-500">
                Private Capital
              </p>

              <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Managed Capital
                </p>

                <h3 className="mt-2 text-3xl font-black">
                  $12.84M
                </h3>

                <p className="mt-1 text-sm text-emerald-400">
                  +18.4% YTD
                </p>
              </div>

              <nav className="mt-8 space-y-2">
                {navItems.map(([item, href]) => (
                  <a
                    key={item}
                    href={href}
                    className="group flex items-center rounded-2xl px-4 py-3 text-sm text-slate-300 transition-all duration-300 hover:bg-white/10 hover:text-white"
                  >
                    <span className="h-2 w-2 rounded-full bg-yellow-500 opacity-0 transition group-hover:opacity-100" />
                    <span className="ml-3">{item}</span>
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <section className="flex-1 lg:ml-[320px]">
          <div className="p-6 lg:p-8">
            {/* Top Bar */}
            <header className="mb-8 flex flex-col gap-4 rounded-[32px] border border-white/10 bg-black/20 p-6 backdrop-blur-2xl md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">
                  {subtitle}
                </p>

                <h1 className="mt-2 text-4xl font-black tracking-tight">
                  {title}
                </h1>
              </div>

              <div className="flex items-center gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Session
                  </p>

                  <p className="font-semibold">
                    Administrator
                  </p>
                </div>

                <a
                  href="/admin/clients"
                  className="rounded-2xl bg-gradient-to-r from-emerald-400 to-yellow-500 px-6 py-3 font-bold text-black transition hover:scale-[1.02]"
                >
                  + Create Client
                </a>
              </div>
            </header>

            {children}
          </div>
        </section>
      </div>
    </main>
  );
}