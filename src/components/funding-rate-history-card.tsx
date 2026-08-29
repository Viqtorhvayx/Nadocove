"use client";

import { useMemo, useState, type PointerEvent } from "react";
import type { IndexerFundingRateHistoryEntry } from "@nadohq/indexer-client";
import { Card } from "@/components/card";
import { Skeleton } from "@/components/skeleton";
import { formatPercent } from "@/lib/format";
import { useFundingRateHistory } from "@/lib/use-funding-rate-history";

const CHART_WIDTH = 600;
const CHART_HEIGHT = 90;
// Stable reference so the dependent useMemo below doesn't see a "new"
// array on every render while data is loading.
const EMPTY_ENTRIES: IndexerFundingRateHistoryEntry[] = [];

/**
 * Real hourly funding-rate history (getFundingRateHistory) — the header's
 * "Funding" stat only shows the current rate, this shows its recent trend
 * so a trader can see whether it's been consistently one-sided.
 */
export function FundingRateHistoryCard({ productId }: { productId: number | undefined }) {
  const history = useFundingRateHistory(productId);
  const [hoverIndex, setHoverIndex] = useState<number | undefined>(undefined);

  const entries = history.data ?? EMPTY_ENTRIES;

  const { bars, maxAbs } = useMemo(() => {
    if (entries.length === 0) return { bars: [] as { x: number; width: number; rate: number }[], maxAbs: 0 };
    let max = 0;
    for (const e of entries) {
      const abs = e.fundingRateFrac.abs().toNumber();
      if (abs > max) max = abs;
    }
    const slot = CHART_WIDTH / entries.length;
    const barWidth = Math.max(1, slot * 0.7);
    return {
      maxAbs: max || 1,
      bars: entries.map((e, i) => ({ x: i * slot + slot / 2, width: barWidth, rate: e.fundingRateFrac.toNumber() })),
    };
  }, [entries]);

  const zeroY = CHART_HEIGHT / 2;
  const scale = (CHART_HEIGHT / 2 - 4) / maxAbs;

  const hovered = hoverIndex !== undefined ? entries[hoverIndex] : undefined;

  function handlePointerMove(e: PointerEvent<SVGSVGElement>) {
    if (bars.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = ((e.clientX - rect.left) / rect.width) * CHART_WIDTH;
    const slot = CHART_WIDTH / bars.length;
    const index = Math.min(bars.length - 1, Math.max(0, Math.floor(relativeX / slot)));
    setHoverIndex(index);
  }

  return (
    <Card
      title="Funding rate"
      note={
        hovered
          ? new Date(hovered.timestamp.toNumber() * 1000).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric" })
          : `hourly, last ${entries.length || 72}h`
      }
    >
      {history.isLoading && <Skeleton className="h-[90px] w-full" />}
      {history.isError && (
        <p className="text-sm text-negative">
          {history.error instanceof Error ? history.error.message : "Failed to load."}
        </p>
      )}
      {history.data && entries.length === 0 && (
        <p className="text-sm text-foreground-muted">No funding history yet for this market.</p>
      )}

      {bars.length > 0 && (
        <div className="relative">
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="h-[90px] w-full touch-none"
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setHoverIndex(undefined)}
          >
            <line x1={0} x2={CHART_WIDTH} y1={zeroY} y2={zeroY} stroke="var(--border)" strokeWidth={1} />
            {bars.map((b, i) => {
              const height = Math.max(1, Math.abs(b.rate) * scale);
              const y = b.rate >= 0 ? zeroY - height : zeroY;
              return (
                <rect
                  key={i}
                  x={b.x - b.width / 2}
                  y={y}
                  width={b.width}
                  height={height}
                  fill={b.rate >= 0 ? "var(--color-positive)" : "var(--color-negative)"}
                  opacity={hoverIndex === undefined || hoverIndex === i ? 0.85 : 0.35}
                />
              );
            })}
          </svg>
        </div>
      )}
      {bars.length > 0 && (
        <div className="mt-1 flex items-center justify-between text-[11px] text-foreground-muted">
          <span>Longs pay shorts above the line</span>
          <span className="font-medium tabular-nums text-foreground">
            {hovered ? formatPercent(hovered.fundingRateFrac, 4) : " "}
          </span>
        </div>
      )}
    </Card>
  );
}
