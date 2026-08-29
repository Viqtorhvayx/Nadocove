"use client";

import { useAccount } from "wagmi";
import { AppShell } from "@/components/app-shell";
import { ConnectButton } from "@/components/connect-button";
import { MarginHealthBanner } from "@/components/margin-health-banner";
import { SubaccountProvider } from "@/lib/subaccount-context";

export default function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const { isConnected } = useAccount();

  return (
    <AppShell>
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
          <div className="flex flex-1 flex-col gap-6">
            <MarginHealthBanner />
            {children}
          </div>
        </SubaccountProvider>
      )}
    </AppShell>
  );
}
