import Link from "next/link";
import { Logo, LogoMark } from "@/components/logo";
import { AddressLookup } from "@/components/address-lookup";
import { HomeConnectFab } from "@/components/home-connect-fab";
import { WalletCta } from "@/components/wallet-cta";
import { StatBadges } from "@/components/stat-badges";
import { HeroMockup } from "@/components/hero-mockup";
import { MarketTicker } from "@/components/market-ticker";
import { Reveal } from "@/components/reveal";

const FEATURES = [
  {
    title: "Unified portfolio",
    body: "Balances, positions, PnL, margin health, and fee tier across every subaccount — spot, perps, and money markets — in one dashboard.",
    icon: "M3 16.5v-6h3.5v6H3Zm6.75 0V3h3.5v13.5h-3.5ZM16.5 16.5V9h3.5v7.5h-3.5Z",
  },
  {
    title: "Social, opt-in",
    body: "Look up any address's public performance, or make your own track record shareable. Follow traders, compare stats, no custody required.",
    icon: "M6.5 8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm7 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM2.5 17c0-2.8 1.8-5 4-5s4 2.2 4 5M11.5 12c2.2 0 4 2.2 4 5",
  },
  {
    title: "Trade natively",
    body: "Place orders straight from NadoCove. Everything still settles on Nado's own orderbook — you just get a better home screen.",
    icon: "M3 14.5 8 9l3.5 3.5L17 6M17 6h-4.5M17 6v4.5",
  },
];

export default function Home() {
  return (
    <div className="relative flex min-h-full flex-col overflow-hidden">
      {/* Ambient backdrop: storm dissolving into calm water, now with slow
          drift so the landing page reads as alive even before anything
          loads — the aurora blobs are the same brand gradient as
          text-gradient-brand, just diffused. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="aurora-blob absolute -left-32 -top-40 h-[32rem] w-[32rem] rounded-full bg-cove-indigo/20 blur-[120px]"
        />
        <div
          className="aurora-blob absolute -right-24 top-10 h-[26rem] w-[26rem] rounded-full bg-cove-amber/14 blur-[110px]"
          style={{ animationDelay: "-9s", animationDuration: "22s" }}
        />
        <div
          className="aurora-blob absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-cove-coral/10 blur-[110px]"
          style={{ animationDelay: "-4s", animationDuration: "26s" }}
        />
      </div>

      <header className="mx-auto flex w-full max-w-6xl items-center px-6 py-6">
        <Link href="/">
          <Logo size={26} />
        </Link>
      </header>

      <HomeConnectFab />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6">
        <section className="grid grid-cols-1 items-center gap-14 py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          <div className="cove-fade-in flex flex-col items-start gap-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground-muted">
              <LogoMark size={14} />
              Independent · Non-custodial · Built on Nado
            </span>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
              Your <span className="text-gradient-brand">calm harbor</span> on
              Nado.
            </h1>
            <p className="max-w-xl text-lg text-foreground-muted">
              One account view for every position, every market. Connect the
              wallet you already use, see your whole Nado footprint in one
              place, and trade straight from it.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <WalletCta
                className="btn-tactile-primary rounded-full px-6 py-3 text-sm font-semibold text-background"
                idleLabel="Connect Wallet"
                connectedLabel="Go to Dashboard →"
              />
              <Link
                href="/discover"
                className="btn-tactile-secondary rounded-full px-6 py-3 text-sm font-semibold text-foreground"
              >
                Browse Discover
              </Link>
            </div>

            <StatBadges />

            <div className="mt-2 flex flex-col items-start gap-2">
              <AddressLookup />
              <span className="text-xs text-foreground-muted">
                No wallet needed — look up any address&apos;s public record.
              </span>
            </div>
          </div>

          <div className="cove-scale-in" style={{ animationDelay: "120ms" }}>
            <HeroMockup />
          </div>
        </section>

        <MarketTicker />

        <section
          id="features"
          className="grid grid-cols-1 gap-6 pb-24 pt-16 sm:grid-cols-3"
        >
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.title} delayMs={i * 100}>
              <div className="group h-full rounded-2xl border border-border bg-surface p-6 transition duration-300 hover:-translate-y-1 hover:border-cove-indigo/40 hover:shadow-[0_20px_40px_-24px_rgba(76,110,245,0.4)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cove-indigo/10 text-cove-indigo transition group-hover:bg-cove-indigo/20">
                  <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                    <path
                      d={feature.icon}
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h2 className="mt-4 text-base font-semibold text-foreground">
                  {feature.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
                  {feature.body}
                </p>
              </div>
            </Reveal>
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
          . It is not affiliated with or endorsed by the Nado team. ·{" "}
          <a
            href="https://docs.nado.xyz"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-border underline-offset-2 hover:text-foreground"
          >
            Nado Docs
          </a>
        </p>
      </footer>
    </div>
  );
}
