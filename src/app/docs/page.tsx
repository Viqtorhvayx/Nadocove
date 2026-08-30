import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { WalletCta } from "@/components/wallet-cta";

export const metadata: Metadata = {
  title: "Docs — NadoCove",
  description:
    "What NadoCove is, how it stays non-custodial, and what each section of the app does.",
};

const TOC = [
  { href: "#overview", label: "Overview" },
  { href: "#non-custodial", label: "Non-custodial by design" },
  { href: "#sections", label: "What each section does" },
  { href: "#faq", label: "FAQ" },
];

const SECTIONS = [
  {
    name: "Trade",
    body: "Order entry, order book, and chart for a single market — market and limit orders, a liquidation-price estimate, and quick-size buttons.",
  },
  {
    name: "Portfolio",
    body: "The default view of your own account: total value, margin health, balances, positions, fee tier, PnL, XPoints, and cash incentives, all in one place.",
  },
  {
    name: "History",
    body: "Past fills, plus a separate funding & interest history — both exportable to CSV.",
  },
  {
    name: "Watchlist",
    body: "A local, device-side list of addresses you want to keep an eye on.",
  },
  {
    name: "Discover",
    body: "The Top Traders/Builders leaderboard for live trading competitions, plus stats on Nado's own liquidity pool (NLP) — TVL, cumulative PnL.",
  },
  {
    name: "Competitions",
    body: "Full standings for trading competitions — ROI, volume, and other tracks — in more detail than the Discover snippet.",
  },
  {
    name: "Settings",
    body: "Subaccount management, discoverability opt-in for your public profile, and username claiming.",
  },
];

const FAQ = [
  {
    q: "Is NadoCove custodial?",
    a: "No. NadoCove never holds, routes, or has access to your funds at any point — see “Non-custodial by design” below.",
  },
  {
    q: "Do I need to sign up?",
    a: "No email, no password. Connecting your wallet is enough to use the dashboard. Signing in with Ethereum — one extra wallet signature — unlocks optional social features like usernames and following other traders.",
  },
  {
    q: "What network does this run on?",
    a: "Nado on Ink mainnet. Real funds, no testnet, no faucet, no reset.",
  },
  {
    q: "Is NadoCove affiliated with Nado?",
    a: "No. NadoCove is an independent, community-built companion app. It is not operated, endorsed, or affiliated with the Nado team.",
  },
  {
    q: "Where do I find protocol-level docs — fees, margin rules, contracts?",
    a: "That lives with Nado itself, not here — see Nado Docs, linked in the footer.",
  },
];

export default function DocsPage() {
  return (
    <div className="relative flex min-h-full flex-col overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="aurora-blob absolute -left-32 -top-40 h-[32rem] w-[32rem] rounded-full bg-cove-indigo/20 blur-[120px]" />
        <div
          className="aurora-blob absolute -right-24 top-10 h-[26rem] w-[26rem] rounded-full bg-cove-amber/14 blur-[110px]"
          style={{ animationDelay: "-9s", animationDuration: "22s" }}
        />
      </div>

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/">
          <Logo size={26} />
        </Link>
        <WalletCta
          className="btn-tactile-secondary hidden rounded-full px-5 py-2.5 text-sm font-semibold text-foreground sm:inline-flex"
          idleLabel="Connect Wallet"
          connectedLabel="Go to Dashboard →"
        />
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pb-24 pt-10 sm:pt-16">
        <span className="text-xs font-medium uppercase tracking-wide text-cove-indigo">
          Docs
        </span>
        <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
          What <span className="text-gradient-brand">NadoCove</span> does
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground-muted sm:text-lg">
          A short, honest explanation of the product — what it is, how it stays
          non-custodial, and what you&apos;ll find in each part of the app.
        </p>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
          <nav aria-label="On this page" className="hidden lg:block">
            <div className="sticky top-10 flex flex-col gap-1">
              <span className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground-muted">
                On this page
              </span>
              {TOC.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-1.5 text-sm text-foreground-muted transition hover:bg-surface-raised hover:text-foreground"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </nav>

          <div className="flex flex-col gap-8">
            <section
              id="overview"
              className="scroll-mt-10 rounded-2xl border border-border bg-surface p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),inset_0_-1px_0_0_rgba(0,0,0,0.2),0_16px_32px_-18px_rgba(0,0,0,0.7)] sm:p-8"
            >
              <h2 className="text-lg font-semibold text-foreground">Overview</h2>
              <p className="mt-3 leading-relaxed text-foreground-muted">
                NadoCove is a non-custodial portfolio dashboard and trading companion
                for Nado, the CLOB exchange on Ink. Connect the wallet you already
                use and see your entire Nado footprint — balances, positions, PnL,
                and margin health across spot, perps, and money markets — in one
                place, then place trades straight from it.
              </p>
              <p className="mt-3 leading-relaxed text-foreground-muted">
                It&apos;s the view and the controls layered on top of Nado, not a
                replacement for it. Everything you do through NadoCove still happens
                on Nado itself.
              </p>
            </section>

            <section
              id="non-custodial"
              className="scroll-mt-10 rounded-2xl border border-border bg-surface p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),inset_0_-1px_0_0_rgba(0,0,0,0.2),0_16px_32px_-18px_rgba(0,0,0,0.7)] sm:p-8"
            >
              <h2 className="text-lg font-semibold text-foreground">
                Non-custodial by design
              </h2>
              <p className="mt-3 leading-relaxed text-foreground-muted">
                NadoCove doesn&apos;t hold your funds, doesn&apos;t run its own order
                book, and doesn&apos;t sit between you and your money at any point.
              </p>
              <ul className="mt-4 flex flex-col gap-3">
                {[
                  {
                    h: "Deposits",
                    b: "An on-chain approve + deposit call goes straight to Nado's own contracts. NadoCove never receives or routes your funds.",
                  },
                  {
                    h: "Orders",
                    b: "Signed with your wallet and submitted directly to Nado's own engine and order book — matched and settled entirely on Nado's infrastructure.",
                  },
                  {
                    h: "Withdrawals",
                    b: "The same as deposits, in reverse: your wallet signs, and funds move directly between Nado's contracts and your wallet.",
                  },
                ].map((item) => (
                  <li key={item.h} className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cove-indigo" />
                    <span className="text-sm leading-relaxed text-foreground-muted">
                      <span className="font-medium text-foreground">{item.h}.</span>{" "}
                      {item.b}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 rounded-xl border border-cove-indigo/25 bg-cove-indigo/5 px-4 py-3 text-sm leading-relaxed text-foreground-muted">
                If NadoCove disappeared tomorrow, your funds and positions on Nado
                would be completely unaffected.
              </p>
            </section>

            <section
              id="sections"
              className="scroll-mt-10 rounded-2xl border border-border bg-surface p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),inset_0_-1px_0_0_rgba(0,0,0,0.2),0_16px_32px_-18px_rgba(0,0,0,0.7)] sm:p-8"
            >
              <h2 className="text-lg font-semibold text-foreground">
                What each section does
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {SECTIONS.map((s, i) => (
                  <div
                    key={s.name}
                    className="flex gap-3 rounded-xl border border-border bg-surface-raised p-4"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cove-indigo/15 text-xs font-semibold text-cove-indigo">
                      {i + 1}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{s.name}</div>
                      <p className="mt-1 text-xs leading-relaxed text-foreground-muted">
                        {s.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-foreground-muted">
                There&apos;s also a public profile page for any address —{" "}
                <span className="font-mono text-foreground">/u/[address]</span> —
                reachable from the address-lookup box on the homepage or Discover,
                no wallet connection required to view one.
              </p>
            </section>

            <section
              id="faq"
              className="scroll-mt-10 rounded-2xl border border-border bg-surface p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),inset_0_-1px_0_0_rgba(0,0,0,0.2),0_16px_32px_-18px_rgba(0,0,0,0.7)] sm:p-8"
            >
              <h2 className="text-lg font-semibold text-foreground">FAQ</h2>
              <div className="mt-4 flex flex-col divide-y divide-border">
                {FAQ.map((item) => (
                  <div key={item.q} className="py-4 first:pt-0 last:pb-0">
                    <div className="text-sm font-medium text-foreground">{item.q}</div>
                    <p className="mt-1.5 text-sm leading-relaxed text-foreground-muted">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-border p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Ready to see your own portfolio?
                </h2>
                <p className="mt-1 text-sm text-foreground-muted">
                  Connect your wallet — no sign-up, nothing to install.
                </p>
              </div>
              <WalletCta
                className="btn-tactile-primary shrink-0 rounded-full px-6 py-3 text-sm font-semibold text-background"
                idleLabel="Connect Wallet"
                connectedLabel="Go to Dashboard →"
              />
            </section>
          </div>
        </div>
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
