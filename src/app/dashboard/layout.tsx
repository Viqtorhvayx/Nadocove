"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { Logo } from "@/components/logo";
import { ConnectButton } from "@/components/connect-button";
import { SubaccountProvider } from "@/lib/subaccount-context";

const TABS = [
  { href: "/dashboard", label: "Portfolio" },
  { href: "/dashboard/trade", label: "Trade" },
  { href: "/dashboard/history", label: "History" },
  { href: "/dashboard/competitions", label: "Competitions" },
  { href: "/dashboard/watchlist", label: "Watchlist" },
  { href: "/dashboard/settings", label: "Settings" },
];

function TabNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border">
      {TABS.map((tab) => {
        const active =
          tab.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition ${
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
  );
}

export default function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const { isConnected } = useAccount();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6">
      <header className="flex items-center justify-between py-6">
        <Logo size={24} />
        <ConnectButton />
      </header>

      {!isConnected && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
          <h1 className="text-2xl font-semibold text-foreground">
            Connect your wallet to view your dashboard
          </h1>
          <p className="max-w-sm text-sm text-foreground-muted">
            NadoCove reads your Nado account directly from the chain and the
            engine — nothing is stored, and we never take custody of funds.
          </p>
          <ConnectButton className="mt-2 px-6 py-3 text-base" />
        </div>
      )}

      {isConnected && (
        <SubaccountProvider>
          <TabNav />
          <main className="flex flex-1 flex-col gap-6 py-6 pb-16">
            {children}
          </main>
        </SubaccountProvider>
      )}
    </div>
  );
}
