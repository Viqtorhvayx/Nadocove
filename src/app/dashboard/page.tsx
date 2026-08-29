"use client";

import { useAccount } from "wagmi";
import { ProfileBadges } from "@/components/profile-badges";
import { PortfolioHeader } from "@/components/portfolio-header";
import { PortfolioPerformanceHero } from "@/components/portfolio-performance-hero";
import { PortfolioTabs } from "@/components/portfolio-tabs";
import { RecentActivityPanel } from "@/components/recent-activity-panel";
import { calcTotalPortfolioValue } from "@/lib/portfolio-value";
import { useActiveSubaccount } from "@/lib/subaccount-context";
import { useSubaccountFeeRates, useSubaccountSummary } from "@/lib/use-subaccount-data";

export default function PortfolioTab() {
  const { address } = useAccount();
  const { subaccountName, setSubaccountName } = useActiveSubaccount();
  const summary = useSubaccountSummary();
  const feeRates = useSubaccountFeeRates();

  const totalValue = calcTotalPortfolioValue(summary.data);
  const isHealthy = summary.data?.exists ? summary.data.health.maintenance.health.gte(0) : undefined;

  if (!address) return null;

  return (
    <div className="flex flex-col gap-6">
      <PortfolioHeader
        address={address}
        subaccountName={subaccountName}
        onSubaccountChange={setSubaccountName}
        totalValue={totalValue}
        isHealthy={isHealthy}
      />

      <ProfileBadges address={address} subaccountName={subaccountName} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <PortfolioPerformanceHero address={address} subaccountName={subaccountName} />
          <PortfolioTabs
            summaryQuery={summary}
            feeRatesQuery={feeRates}
            address={address}
            subaccountName={subaccountName}
          />
        </div>

        <div className="lg:col-span-1">
          <RecentActivityPanel owner={address} subaccountName={subaccountName} />
        </div>
      </div>
    </div>
  );
}
