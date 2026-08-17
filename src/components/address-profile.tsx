"use client";

import { useState } from "react";
import { isAddress } from "viem";
import { Logo } from "@/components/logo";
import { ConnectButton } from "@/components/connect-button";
import { Card } from "@/components/card";
import { PortfolioOverviewCard } from "@/components/portfolio-overview-card";
import { BalancesTable } from "@/components/balances-table";
import { PositionsTable } from "@/components/positions-table";
import { FeeTierCard } from "@/components/fee-tier-card";
import { PointsCard } from "@/components/points-card";
import { TradeHistoryTable } from "@/components/trade-history-table";
import { SubaccountSelector } from "@/components/subaccount-selector";
import { PerformanceChart } from "@/components/performance-chart";
import { ProfileBadges } from "@/components/profile-badges";
import { useAddressSummary, useAddressFeeRates } from "@/lib/use-address-summary";
import { DEFAULT_SUBACCOUNT_NAME } from "@/lib/subaccount-constants";
import { useWatchlist } from "@/lib/use-watchlist";
import { truncateAddress } from "@/lib/format";

export function AddressProfile({ address }: { address: string }) {
  const [subaccountName, setSubaccountName] = useState(DEFAULT_SUBACCOUNT_NAME);
  const summary = useAddressSummary(address, subaccountName);
  const feeRates = useAddressFeeRates(address, subaccountName);
  const watchlist = useWatchlist();
  const isWatched = watchlist.addresses.some(
    (a) => a.toLowerCase() === address.toLowerCase(),
  );

  if (!isAddress(address)) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6">
        <header className="flex items-center justify-between py-6">
          <Logo size={24} />
          <ConnectButton />
        </header>
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-24 text-center">
          <h1 className="text-2xl font-semibold text-foreground">
            Not a valid address
          </h1>
          <p className="text-sm text-foreground-muted">
            &quot;{address}&quot; doesn&apos;t look like an EVM address.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6">
      <header className="flex items-center justify-between py-6">
        <Logo size={24} />
        <ConnectButton />
      </header>

      <main className="flex flex-1 flex-col gap-6 pb-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
              Public profile · read-only
            </span>
            <h1 className="font-mono text-2xl font-semibold text-foreground">
              {truncateAddress(address)}
            </h1>
            <ProfileBadges address={address} subaccountName={subaccountName} />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                isWatched ? watchlist.remove(address) : watchlist.add(address)
              }
              className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground-muted transition hover:text-foreground"
            >
              {isWatched ? "★ On watchlist" : "☆ Add to watchlist"}
            </button>
            <SubaccountSelector
              ownerAddress={address}
              value={subaccountName}
              onChange={setSubaccountName}
            />
          </div>
        </div>

        <PerformanceChart address={address} subaccountName={subaccountName} />

        <PortfolioOverviewCard query={summary} />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <BalancesTable query={summary} />
          <PositionsTable query={summary} />
        </div>

        <FeeTierCard query={feeRates} />

        <TradeHistoryTable owner={address} subaccountName={subaccountName} />

        <PointsCard address={address} />

        <Card title="Want a dashboard like this for your own account?" className="border-dashed">
          <p className="text-sm text-foreground-muted">
            Connect your wallet to see your own portfolio, trade, and make
            your profile shareable too.
          </p>
          <ConnectButton className="mt-4 px-6 py-2.5" />
        </Card>
      </main>
    </div>
  );
}
