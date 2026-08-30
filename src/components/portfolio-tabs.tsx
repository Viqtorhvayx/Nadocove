"use client";

import { useState } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import {
  ProductEngineType,
  calcSpotBalanceValue,
  calcPerpBalanceValue,
  calcPerpBalanceNotionalValue,
  type SpotBalanceWithProduct,
  type PerpBalanceWithProduct,
} from "@nadohq/shared";
import type { GetEngineSubaccountSummaryResponse, GetEngineSubaccountFeeRatesResponse } from "@nadohq/engine-client";
import { CashIncentivesCard } from "@/components/cash-incentives-card";
import { ClaimBuilderFeeCard } from "@/components/claim-builder-fee-card";
import { FeeTierCard } from "@/components/fee-tier-card";
import { PnlStatsCard } from "@/components/pnl-stats-card";
import { PointsCard } from "@/components/points-card";
import { PortfolioOverviewCard } from "@/components/portfolio-overview-card";
import { TokenIcon } from "@/components/token-icon";
import { XPointsCard } from "@/components/xpoints-card";
import { formatAmount, formatSignedUsd, formatUsd, pnlColorClass } from "@/lib/format";
import { useSymbolMap } from "@/lib/use-symbol-map";

type SummaryQuery = UseQueryResult<GetEngineSubaccountSummaryResponse>;

function EmptyRow({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-center text-sm text-foreground-muted">{children}</p>;
}

function TokensTab({ query }: { query: SummaryQuery }) {
  const symbolMap = useSymbolMap();
  if (query.isLoading) return <EmptyRow>Loading…</EmptyRow>;
  if (query.isError || !query.data?.exists) return <EmptyRow>No token balances yet.</EmptyRow>;

  const balances = query.data.balances.filter(
    (b): b is SpotBalanceWithProduct => b.type === ProductEngineType.SPOT && !b.amount.isZero(),
  );
  if (balances.length === 0) return <EmptyRow>No token balances yet.</EmptyRow>;

  return (
    <div className="flex flex-col divide-y divide-border">
      {balances.map((balance) => {
        const symbol = symbolMap[balance.productId];
        return (
          <div key={balance.productId} className="flex items-center justify-between py-3 text-sm">
            <span className="flex items-center gap-2.5">
              {symbol && <TokenIcon symbol={symbol} size={26} />}
              <span className="font-medium text-foreground">{symbol ?? `${balance.productId}`}</span>
            </span>
            <span className="text-right">
              <div className="text-foreground">{formatUsd(calcSpotBalanceValue(balance))}</div>
              <div className="text-xs text-foreground-muted">{formatAmount(balance.amount)}</div>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function PerpsTab({ query }: { query: SummaryQuery }) {
  const symbolMap = useSymbolMap();
  if (query.isLoading) return <EmptyRow>Loading…</EmptyRow>;
  if (query.isError || !query.data?.exists) return <EmptyRow>No open positions.</EmptyRow>;

  const positions = query.data.balances.filter(
    (b): b is PerpBalanceWithProduct => b.type === ProductEngineType.PERP && !b.amount.isZero(),
  );
  if (positions.length === 0) return <EmptyRow>No open positions.</EmptyRow>;

  return (
    <div className="flex flex-col divide-y divide-border">
      {positions.map((position) => {
        const side = position.amount.gt(0) ? "long" : "short";
        const pnl = calcPerpBalanceValue(position);
        const symbol = symbolMap[position.productId];
        return (
          <div key={position.productId} className="flex items-center justify-between py-3 text-sm">
            <span className="flex items-center gap-2.5">
              {symbol && <TokenIcon symbol={symbol} size={26} />}
              <span className="flex flex-col">
                <span className="flex items-center gap-1.5">
                  <span className="font-medium text-foreground">{symbol ?? `${position.productId}`}</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                      side === "long" ? "bg-positive/10 text-positive" : "bg-negative/10 text-negative"
                    }`}
                  >
                    {side}
                  </span>
                </span>
                <span className="text-xs text-foreground-muted">{formatAmount(position.amount.abs())}</span>
              </span>
            </span>
            <span className="text-right">
              <div className={pnlColorClass(pnl)}>{formatSignedUsd(pnl)}</div>
              <div className="text-xs text-foreground-muted">{formatUsd(calcPerpBalanceNotionalValue(position))} notional</div>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function StatsTab({
  summaryQuery,
  feeRatesQuery,
  address,
  subaccountName,
}: {
  summaryQuery: SummaryQuery;
  feeRatesQuery: UseQueryResult<GetEngineSubaccountFeeRatesResponse>;
  address: string | undefined;
  subaccountName: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <PortfolioOverviewCard query={summaryQuery} />
      <PnlStatsCard owner={address} subaccountName={subaccountName} />
      <FeeTierCard query={feeRatesQuery} />
      {address && <PointsCard address={address} />}
      {address && <XPointsCard address={address} />}
      <CashIncentivesCard address={address} />
      <ClaimBuilderFeeCard />
    </div>
  );
}

const TABS = ["Tokens", "Perps", "Stats"] as const;
type Tab = (typeof TABS)[number];

export function PortfolioTabs({
  summaryQuery,
  feeRatesQuery,
  address,
  subaccountName,
}: {
  summaryQuery: SummaryQuery;
  feeRatesQuery: UseQueryResult<GetEngineSubaccountFeeRatesResponse>;
  address: string | undefined;
  subaccountName: string;
}) {
  const [tab, setTab] = useState<Tab>("Tokens");

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),inset_0_-1px_0_0_rgba(0,0,0,0.2),0_16px_32px_-18px_rgba(0,0,0,0.7)]">
      <div className="flex gap-5 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`border-b-2 pb-2.5 text-sm font-semibold transition ${
              tab === t ? "border-cove-indigo text-foreground" : "border-transparent text-foreground-muted hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="pt-2">
        {tab === "Tokens" && <TokensTab query={summaryQuery} />}
        {tab === "Perps" && <PerpsTab query={summaryQuery} />}
        {tab === "Stats" && (
          <StatsTab summaryQuery={summaryQuery} feeRatesQuery={feeRatesQuery} address={address} subaccountName={subaccountName} />
        )}
      </div>
    </div>
  );
}
