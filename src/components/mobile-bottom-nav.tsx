"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  {
    href: "/dashboard",
    label: "Portfolio",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2.5" y="10" width="3.5" height="7.5" rx="1" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" />
        <rect x="8.25" y="5.5" width="3.5" height="12" rx="1" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" />
        <rect x="14" y="2.5" width="3.5" height="15" rx="1" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    href: "/dashboard/trade",
    label: "Trade",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="7.5" cy="10" r="5.5" fill={active ? "currentColor" : "none"} fillOpacity="0.25" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12.5" cy="10" r="5.5" fill={active ? "currentColor" : "none"} fillOpacity="0.25" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    href: "/discover",
    label: "Discover",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="6.5" r="3.25" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M3.5 17c0-3.59 2.91-6.5 6.5-6.5s6.5 2.91 6.5 6.5"
          fill={active ? "currentColor" : "none"}
          fillOpacity="0.25"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

/**
 * Mobile-only bottom tab bar, modeled directly on Hyperliquid's app —
 * on a phone screen it puts primary navigation (Markets/Trade/Account,
 * here Portfolio/Trade/Discover) within thumb reach at the bottom
 * instead of a top row you have to reach up for. Desktop keeps the top
 * tab row in AppHeader; this supplements it on small screens only.
 */
export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] sm:hidden">
      {ITEMS.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs transition ${
              active ? "text-cove-indigo" : "text-foreground-muted"
            }`}
          >
            {item.icon(active)}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
