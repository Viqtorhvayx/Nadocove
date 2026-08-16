"use client";

import { useAccount } from "wagmi";
import { Logo } from "@/components/logo";
import { ConnectButton } from "@/components/connect-button";
import { PortfolioOverviewCard } from "@/components/portfolio-overview-card";
import { BalancesTable } from "@/components/balances-table";
import { PositionsTable } from "@/components/positions-table";
import { FeeTierCard } from "@/components/fee-tier-card";
import { TradePanel } from "@/components/trade-panel";
import { PointsCard } from "@/components/points-card";
import { ClaimBuilderFeeCard } from "@/components/claim-builder-fee-card";
import { useSubaccountFeeRates, useSubaccountSummary } from "@/lib/use-subaccount-data";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const summary = useSubaccountSummary();
  const feeRates = useSubaccountFeeRates();

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

      {isConnected && address && (
        <main className="flex flex-1 flex-col gap-6 pb-16">
          <PortfolioOverviewCard query={summary} />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <BalancesTable query={summary} />
            <PositionsTable query={summary} />
          </div>

          <FeeTierCard query={feeRates} />

          <PointsCard address={address} />

          <TradePanel />

          <ClaimBuilderFeeCard />
        </main>
      )}
    </div>
  );
}
