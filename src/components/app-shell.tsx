"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
import { ConnectButton } from "@/components/connect-button";
import { SignInButton } from "@/components/sign-in-button";
import { NotificationBell } from "@/components/notification-bell";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

/**
 * Flat, single-level section list — every destination is a peer, not
 * nested under a separate "Dashboard" umbrella. Deposit/Withdraw are
 * standalone header buttons instead of tabs, since they're one-off
 * actions rather than places you browse and come back from.
 */
const TABS = [
  { href: "/dashboard/trade", label: "Trade" },
  { href: "/dashboard", label: "Portfolio" },
  { href: "/dashboard/history", label: "History" },
  { href: "/dashboard/watchlist", label: "Watchlist" },
  { href: "/discover", label: "Discover" },
  { href: "/dashboard/competitions", label: "Competitions" },
  { href: "/dashboard/settings", label: "Settings" },
];

function isActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
}

function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-44 shrink-0 sm:block">
      <nav className="sticky top-6 flex flex-col gap-1">
        {TABS.map((tab) => {
          const active = isActive(pathname, tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "nav-item-active text-cove-indigo"
                  : "text-foreground-muted hover:bg-surface-raised hover:text-foreground"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function MobileTabRow() {
  const pathname = usePathname();
  return (
    <div className="relative mt-3 border-b border-border sm:hidden">
      <nav className="flex gap-1 overflow-x-auto">
        {TABS.map((tab) => {
          const active = isActive(pathname, tab.href);
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
        className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-background to-transparent"
      />
    </div>
  );
}

/**
 * The shell used on Discover, the dashboard, and public profile pages:
 * top bar (logo + wallet actions) plus section navigation. On desktop
 * that navigation is a left sidebar; on mobile it stays a horizontal
 * scrollable row under the header (a sidebar doesn't fit a phone width),
 * with the bottom tab bar supplementing it for the most-used sections.
 * The landing page intentionally does not use this — it gets its own
 * minimal header.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto w-full max-w-6xl px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/">
            <Logo size={24} />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/withdraw"
              className="btn-tactile-secondary hidden rounded-full px-3.5 py-1.5 text-xs font-medium text-foreground-muted transition-colors hover:text-foreground active:text-cove-indigo sm:inline-flex"
            >
              Withdraw
            </Link>
            <Link
              href="/dashboard/deposit"
              className="btn-tactile-secondary hidden rounded-full px-3.5 py-1.5 text-xs font-semibold text-foreground-muted transition-colors hover:text-foreground active:text-cove-indigo sm:inline-flex"
            >
              Deposit
            </Link>
            <SignInButton />
            <NotificationBell />
            <ConnectButton />
          </div>
        </div>
        <MobileTabRow />
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-6">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col gap-6 py-6 pb-24 sm:pb-16">
          {children}
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}
