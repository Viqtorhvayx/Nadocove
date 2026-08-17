"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import {
  ProductEngineType,
  calcPerpBalanceValue,
  calcSpotBalanceValue,
} from "@nadohq/shared";
import type { GetEngineSubaccountSummaryResponse } from "@nadohq/engine-client";
import Link from "next/link";
import { Card } from "@/components/card";
import { Skeleton } from "@/components/skeleton";
import { formatUsd, formatSignedUsd, pnlColorClass } from "@/lib/format";

export function PortfolioOverviewCard({
  query,
}: {
  query: UseQueryResult<GetEngineSubaccountSummaryResponse>;
}) {
  if (query.isLoading) {
    return (
      <Card title="Portfolio">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-32" />
            </div>
          ))}
        </div>
        <Skeleton className="mt-4 h-1.5 w-full rounded-full" />
      </Card>
    );
  }

  if (query.isError) {
    return (
      <Card title="Portfolio">
        <p className="text-sm text-negative">
          {query.error instanceof Error ? query.error.message : "Failed to load."}
        </p>
      </Card>
    );
  }

  const summary = query.data;
  if (!summary) return null;

  if (!summary.exists) {
    return (
      <Card title="Portfolio">
        <p className="text-sm text-foreground-muted">
          No activity yet on this subaccount — nothing deposited or traded.
        </p>
        <Link
          href="/dashboard/deposit"
          className="mt-4 inline-block rounded-full bg-cove-indigo px-5 py-2.5 text-sm font-semibold text-background transition hover:bg-cove-indigo-dim"
        >
          Make your first deposit
        </Link>
      </Card>
    );
  }

  let totalValue = new BigNumber(0);
  for (const balance of summary.balances) {
    if (balance.amount.isZero()) continue;
    totalValue = totalValue.plus(
      balance.type === ProductEngineType.SPOT
        ? calcSpotBalanceValue(balance)
        : calcPerpBalanceValue(balance),
    );
  }

  const maintenance = summary.health.maintenance;
  const isHealthy = maintenance.health.gte(0);

  return (
    <Card
      title="Portfolio"
      note={isHealthy ? "healthy" : "at risk"}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="min-w-0">
          <div className="text-xs text-foreground-muted">Total value</div>
          <div className="break-words text-2xl font-semibold text-foreground">
            {formatUsd(totalValue)}
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-xs text-foreground-muted">Maintenance health</div>
          <div className={`break-words text-2xl font-semibold ${pnlColorClass(maintenance.health)}`}>
            {formatSignedUsd(maintenance.health)}
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-xs text-foreground-muted">Assets / Liabilities</div>
          <div className="break-words text-sm text-foreground">
            {formatUsd(maintenance.assets)} / {formatUsd(maintenance.liabilities)}
          </div>
        </div>
      </div>
      <div
        className={`mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-raised`}
      >
        <div
          className={`h-full ${isHealthy ? "bg-positive" : "bg-negative"}`}
          style={{
            width: `${Math.min(
              100,
              Math.max(
                4,
                maintenance.liabilities.isZero()
                  ? 100
                  : maintenance.assets
                      .div(maintenance.liabilities)
                      .times(50)
                      .toNumber(),
              ),
            )}%`,
          }}
        />
      </div>
    </Card>
  );
}
