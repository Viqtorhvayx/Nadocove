"use client";

import { useMemo } from "react";
import BigNumber from "bignumber.js";
import { Card } from "@/components/card";
import { Skeleton } from "@/components/skeleton";
import { formatSignedUsd, formatUsd, pnlColorClass } from "@/lib/format";
import { useNlpPool } from "@/lib/use-nlp-pool";

const CHART_WIDTH = 400;
const CHART_HEIGHT = 60;

/**
 * Nado's own liquidity pool (NLP) — real platform-wide stats (TVL,
 * depositors, cumulative PnL, share price) from getNlpSnapshots. This is
 * information only: NLP mint/burn is a real, separate execute API
 * (mintNlp/burnNlp) with its own leverage and lock-up mechanics that
 * deserve their own dedicated flow rather than being bolted on here.
 */
export function NlpPoolCard() {
  const pool = useNlpPool();

  const latest = pool.data?.[pool.data.length - 1];
  const first = pool.data?.[0];

  const { path, min, max } = useMemo(() => {
    const points = pool.data ?? [];
    if (points.length < 2) return { path: "", min: 0, max: 0 };
    let lo = points[0].oraclePrice;
    let hi = points[0].oraclePrice;
    for (const p of points) {
      if (p.oraclePrice.lt(lo)) lo = p.oraclePrice;
      if (p.oraclePrice.gt(hi)) hi = p.oraclePrice;
    }
    const loNum = lo.toNumber();
    const range = hi.toNumber() - loNum || 1;
    const path = points
      .map((p, i) => {
        const x = (i / (points.length - 1)) * CHART_WIDTH;
        const y = CHART_HEIGHT - ((p.oraclePrice.toNumber() - loNum) / range) * CHART_HEIGHT;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
    return { path, min: loNum, max: hi.toNumber() };
  }, [pool.data]);

  const priceChange = latest && first ? latest.oraclePrice.minus(first.oraclePrice) : undefined;
  const up = priceChange !== undefined && priceChange.gte(0);

  return (
    <Card title="Nado Liquidity Pool" note="platform-wide, real-time">
      {pool.isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>
      )}
      {pool.isError && (
        <p className="text-sm text-negative">{pool.error instanceof Error ? pool.error.message : "Failed to load."}</p>
      )}

      {latest && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <div className="text-xs text-foreground-muted">TVL</div>
              <div className="text-lg font-semibold text-foreground">{formatUsd(latest.tvl, true)}</div>
            </div>
            <div>
              <div className="text-xs text-foreground-muted">Depositors</div>
              <div className="text-lg font-semibold text-foreground">{latest.depositors.toFormat(0)}</div>
            </div>
            <div>
              <div className="text-xs text-foreground-muted">Share price</div>
              <div className="text-lg font-semibold text-foreground">{formatUsd(latest.oraclePrice)}</div>
            </div>
            <div>
              <div className="text-xs text-foreground-muted">Cumulative PnL</div>
              <div className={`text-lg font-semibold ${pnlColorClass(latest.cumulativePnl)}`}>
                {formatSignedUsd(latest.cumulativePnl)}
              </div>
            </div>
          </div>

          {path && (
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-foreground-muted">
                <span>Share price, last {pool.data?.length ?? 0}d</span>
                {priceChange !== undefined && (
                  <span className={up ? "text-positive" : "text-negative"}>
                    {up ? "+" : ""}
                    {formatUsd(priceChange)}
                  </span>
                )}
              </div>
              <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="h-14 w-full">
                <path d={path} fill="none" stroke={up ? "var(--color-positive)" : "var(--color-negative)"} strokeWidth={2} />
              </svg>
              <div className="mt-0.5 flex justify-between text-[11px] text-foreground-muted">
                <span>{formatUsd(new BigNumber(min))}</span>
                <span>{formatUsd(new BigNumber(max))}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
