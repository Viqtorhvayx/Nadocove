"use client";

import { Card } from "@/components/card";
import { Skeleton } from "@/components/skeleton";
import { formatPercent, formatSignedUsd, pnlColorClass } from "@/lib/format";
import { usePnlStats } from "@/lib/use-pnl-stats";

function Stat({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-foreground-muted">{label}</span>
      <span className={`text-base font-semibold tabular-nums ${valueClassName ?? "text-foreground"}`}>{value}</span>
    </div>
  );
}

export function PnlStatsCard({ owner, subaccountName }: { owner: string | undefined; subaccountName: string }) {
  const stats = usePnlStats(owner, subaccountName);

  return (
    <Card title="Trading stats" note={stats.data ? `last ${stats.data.sampledFills} fills` : undefined}>
      {stats.isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>
      )}
      {stats.isError && (
        <p className="text-sm text-negative">
          {stats.error instanceof Error ? stats.error.message : "Failed to load."}
        </p>
      )}
      {stats.data && stats.data.closedTrades === 0 && (
        <p className="text-sm text-foreground-muted">
          No closed trades yet in your recent history — stats show up once you&apos;ve closed a position.
        </p>
      )}
      {stats.data && stats.data.closedTrades > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Stat
            label="Realized PnL"
            value={formatSignedUsd(stats.data.totalRealizedPnl)}
            valueClassName={pnlColorClass(stats.data.totalRealizedPnl)}
          />
          <Stat
            label="Win rate"
            value={stats.data.winRate ? formatPercent(stats.data.winRate, 0) : "—"}
          />
          <Stat label="Closed trades" value={String(stats.data.closedTrades)} />
          <Stat
            label="Avg win"
            value={stats.data.avgWin ? formatSignedUsd(stats.data.avgWin) : "—"}
            valueClassName="text-positive"
          />
          <Stat
            label="Avg loss"
            value={stats.data.avgLoss ? formatSignedUsd(stats.data.avgLoss) : "—"}
            valueClassName="text-negative"
          />
          <Stat label="Total fees" value={formatSignedUsd(stats.data.totalFees.negated())} valueClassName="text-foreground-muted" />
          <Stat
            label="Best trade"
            value={stats.data.bestTrade ? formatSignedUsd(stats.data.bestTrade) : "—"}
            valueClassName="text-positive"
          />
          <Stat
            label="Worst trade"
            value={stats.data.worstTrade ? formatSignedUsd(stats.data.worstTrade) : "—"}
            valueClassName="text-negative"
          />
        </div>
      )}
    </Card>
  );
}
