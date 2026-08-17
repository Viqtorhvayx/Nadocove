"use client";

import { PortfolioOverviewCard } from "@/components/portfolio-overview-card";
import { BalancesTable } from "@/components/balances-table";
import { PositionsTable } from "@/components/positions-table";
import { FeeTierCard } from "@/components/fee-tier-card";
import { PointsCard } from "@/components/points-card";
import { PerformanceChart } from "@/components/performance-chart";
import { ProfileBadges } from "@/components/profile-badges";
import { useSubaccountFeeRates, useSubaccountSummary } from "@/lib/use-subaccount-data";
import { useActiveSubaccount } from "@/lib/subaccount-context";
import { useAccount } from "wagmi";

export default function PortfolioTab() {
  const { address } = useAccount();
  const { subaccountName } = useActiveSubaccount();
  const summary = useSubaccountSummary();
  const feeRates = useSubaccountFeeRates();

  return (
    <>
      {address && <ProfileBadges address={address} subaccountName={subaccountName} />}

      {address && <PerformanceChart address={address} subaccountName={subaccountName} />}

      <PortfolioOverviewCard query={summary} />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <BalancesTable query={summary} />
        <PositionsTable query={summary} />
      </div>

      <FeeTierCard query={feeRates} />

      {address && <PointsCard address={address} />}
    </>
  );
}
