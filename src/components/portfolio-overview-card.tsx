"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import {
  ProductEngineType,
  calcPerpBalanceValue,
  calcSpotBalanceValue,
} from "@nadohq/shared";
import type { GetEngineSubaccountSummaryResponse } from "@nadohq/engine-client";
import { Card } from "@/components/card";
import { formatUsd, formatSignedUsd, pnlColorClass } from "@/lib/format";

export function PortfolioOverviewCard({
  query,
}: {
  query: UseQueryResult<GetEngineSubaccountSummaryResponse>;
}) {
  if (query.isLoading) {
    return (
      <Card title="Portfolio">
        <p className="text-sm text-foreground-muted">Loading…</p>
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <div className="text-xs text-foreground-muted">Total value</div>
          <div className="text-2xl font-semibold text-foreground">
            {formatUsd(totalValue)}
          </div>
        </div>
        <div>
          <div className="text-xs text-foreground-muted">Maintenance health</div>
          <div className={`text-2xl font-semibold ${pnlColorClass(maintenance.health)}`}>
            {formatSignedUsd(maintenance.health)}
          </div>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <div className="text-xs text-foreground-muted">Assets / Liabilities</div>
          <div className="text-sm text-foreground">
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
