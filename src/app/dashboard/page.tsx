"use client";

import { PortfolioOverviewCard } from "@/components/portfolio-overview-card";
import { BalancesTable } from "@/components/balances-table";
import { PositionsTable } from "@/components/positions-table";
import { FeeTierCard } from "@/components/fee-tier-card";
import { PointsCard } from "@/components/points-card";
import { useSubaccountFeeRates, useSubaccountSummary } from "@/lib/use-subaccount-data";
import { useAccount } from "wagmi";

export default function PortfolioTab() {
  const { address } = useAccount();
  const summary = useSubaccountSummary();
  const feeRates = useSubaccountFeeRates();

  return (
    <>
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
