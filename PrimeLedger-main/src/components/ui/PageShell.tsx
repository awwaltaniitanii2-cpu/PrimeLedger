import AuroraBackground from "./AuroraBackground";
import FloatingDock from "./FloatingDock";

export default function PageShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#040509] text-white">
      <AuroraBackground />
      <FloatingDock />

      <section className="relative z-10 min-h-screen px-5 py-6 lg:ml-[320px] lg:px-10">
        {children}
      </section>
    </main>
  );
}