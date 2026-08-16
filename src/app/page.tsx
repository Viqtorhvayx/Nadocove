import { Logo, LogoMark } from "@/components/logo";
import { ConnectButton } from "@/components/connect-button";

const FEATURES = [
  {
    title: "Unified portfolio",
    body: "Balances, positions, PnL, margin health, and fee tier across every subaccount — spot, perps, and money markets — in one dashboard.",
  },
  {
    title: "Social, opt-in",
    body: "Look up any address's public performance, or make your own track record shareable. Follow traders, compare stats, no custody required.",
  },
  {
    title: "Trade natively",
    body: "Place orders straight from NadoCove. Everything still settles on Nado's own orderbook — you just get a better home screen.",
  },
];

export default function Home() {
  return (
    <div className="relative flex min-h-full flex-col overflow-hidden">
      {/* Ambient backdrop: storm dissolving into calm water */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 80% 0%, rgba(45,212,191,0.14), transparent 70%), radial-gradient(40% 35% at 15% 15%, rgba(245,185,66,0.08), transparent 70%)",
        }}
      />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Logo size={26} />
        <nav className="flex items-center gap-6">
          <a
            href="/dashboard"
            className="hidden text-sm text-foreground-muted transition hover:text-foreground sm:inline"
          >
            Dashboard
          </a>
          <a
            href="https://docs.nado.xyz"
            target="_blank"
            rel="noreferrer"
            className="hidden text-sm text-foreground-muted transition hover:text-foreground sm:inline"
          >
            Nado Docs
          </a>
          <ConnectButton />
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6">
        <section className="flex flex-col items-start gap-6 py-20 sm:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground-muted">
            <LogoMark size={14} />
            Independent · Non-custodial · Built on Nado
          </span>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
            Your calm harbor on Nado.
          </h1>
          <p className="max-w-xl text-lg text-foreground-muted">
            One account view for every position, every market. Connect the
            wallet you already use, see your whole Nado footprint in one
            place, and trade straight from it.
          </p>
          <div className="flex items-center gap-4">
            <ConnectButton className="px-6 py-3 text-base" />
            <a
              href="#features"
              className="text-sm font-medium text-foreground-muted transition hover:text-foreground"
            >
              See what&apos;s inside →
            </a>
          </div>
        </section>

        <section
          id="features"
          className="grid grid-cols-1 gap-6 border-t border-border py-16 sm:grid-cols-3"
        >
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-border bg-surface p-6"
            >
              <h2 className="text-base font-semibold text-foreground">
                {feature.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
                {feature.body}
              </p>
            </div>
          ))}
        </section>
      </main>

      <footer className="mx-auto w-full max-w-6xl border-t border-border px-6 py-8">
        <p className="text-xs text-foreground-muted">
          NadoCove is an independent, non-custodial companion app built on{" "}
          <a
            href="https://www.nado.xyz"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-border underline-offset-2 hover:text-foreground"
          >
            Nado
          </a>
          . It is not affiliated with or endorsed by the Nado team.
        </p>
      </footer>
    </div>
  );
}
