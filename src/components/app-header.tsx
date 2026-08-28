"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { ConnectButton } from "@/components/connect-button";
import { SignInButton } from "@/components/sign-in-button";

/**
 * Flat, single-level tab set — modeled on how trading apps like
 * Hyperliquid organize navigation: every section is a peer tab in one
 * row, not nested under a separate "Dashboard" umbrella with its own
 * sub-nav. Deposit/Withdraw are pulled out as standalone buttons instead
 * of tabs, matching that same convention (Deposit as an always-visible
 * action, not a destination you navigate to and back from).
 */
const TABS = [
  { href: "/dashboard/trade", label: "Trade" },
  { href: "/dashboard", label: "Portfolio" },
  { href: "/dashboard/history", label: "History" },
  { href: "/discover", label: "Discover" },
  { href: "/dashboard/competitions", label: "Competitions" },
  { href: "/dashboard/watchlist", label: "Watchlist" },
  { href: "/dashboard/settings", label: "Settings" },
];

/**
 * The one header used on Discover, the dashboard, and public profile
 * pages — previously each built its own header from scratch (or the
 * dashboard split nav across a header row and a separate TabNav), so
 * navigation was inconsistent and, on some pages, missing outright.
 * The landing page intentionally does NOT use this — it gets its own
 * minimal header, since app-internal navigation ahead of a first
 * connection is exactly what made it feel unfinished.
 */
export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="mx-auto w-full max-w-6xl px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/">
          <Logo size={24} />
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/withdraw"
            className="hidden rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground-muted transition hover:text-foreground sm:inline-flex"
          >
            Withdraw
          </Link>
          <Link
            href="/dashboard/deposit"
            className="hidden rounded-full bg-cove-indigo px-4 py-2 text-sm font-semibold text-background transition hover:bg-cove-indigo-dim sm:inline-flex"
          >
            Deposit
          </Link>
          <SignInButton />
          <ConnectButton />
        </div>
      </div>

      <div className="relative mt-3 border-b border-border">
        <nav className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            const active =
              tab.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "border-cove-indigo text-foreground"
                    : "border-transparent text-foreground-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-background to-transparent sm:hidden"
        />
      </div>
    </header>
  );
}
