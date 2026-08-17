"use client";

import { useMemo, useState, type PointerEvent } from "react";
import type { IndexerPortfolioPeriod } from "@nadohq/indexer-client";
import { Card } from "@/components/card";
import { Skeleton } from "@/components/skeleton";
import { formatUsd } from "@/lib/format";
import { PERFORMANCE_PERIODS, usePortfolioHistory } from "@/lib/use-portfolio-history";

const CHART_WIDTH = 600;
const CHART_HEIGHT = 160;
const PADDING_Y = 12;

export function PerformanceChart({
  address,
  subaccountName,
}: {
  address: string;
  subaccountName: string;
}) {
  const history = usePortfolioHistory(address, subaccountName);
  const [period, setPeriod] = useState<IndexerPortfolioPeriod>("month");
  const [hoverIndex, setHoverIndex] = useState<number | undefined>(undefined);

  const points = useMemo(
    () => history.data?.[period]?.accountValueHistory ?? [],
    [history.data, period],
  );

  const { path, areaPath, coords } = useMemo(() => {
    if (points.length === 0) {
      return { path: "", areaPath: "", coords: [] as { x: number; y: number }[] };
    }
    let min = points[0].value;
    let max = points[0].value;
    for (const p of points) {
      if (p.value.lt(min)) min = p.value;
      if (p.value.gt(max)) max = p.value;
    }
    const range = max.minus(min);
    const coords = points.map((p, i) => {
      const x = points.length === 1 ? CHART_WIDTH / 2 : (i / (points.length - 1)) * CHART_WIDTH;
      const y = range.isZero()
        ? CHART_HEIGHT / 2
        : CHART_HEIGHT -
          PADDING_Y -
          p.value.minus(min).div(range).toNumber() * (CHART_HEIGHT - PADDING_Y * 2);
      return { x, y };
    });
    const path = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
    const last = coords[coords.length - 1];
    const areaPath = `${path} L${last.x.toFixed(1)},${CHART_HEIGHT} L${coords[0].x.toFixed(1)},${CHART_HEIGHT} Z`;
    return { path, areaPath, coords };
  }, [points]);

  const first = points[0]?.value;
  const last = points[points.length - 1]?.value;
  const isUp = first !== undefined && last !== undefined && last.gte(first);
  const seriesColor = isUp ? "var(--color-positive)" : "var(--color-negative)";
  const delta = first !== undefined && last !== undefined ? last.minus(first) : undefined;
  const deltaPct = delta !== undefined && first && !first.isZero() ? delta.div(first).times(100) : undefined;

  const hoverCoord = hoverIndex !== undefined ? coords[hoverIndex] : undefined;
  const hoverPoint = hoverIndex !== undefined ? points[hoverIndex] : undefined;
  const endCoord = coords[coords.length - 1];

  function handlePointerMove(e: PointerEvent<SVGSVGElement>) {
    if (coords.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = ((e.clientX - rect.left) / rect.width) * CHART_WIDTH;
    let nearest = 0;
    let nearestDist = Infinity;
    coords.forEach((c, i) => {
      const dist = Math.abs(c.x - relativeX);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    });
    setHoverIndex(nearest);
  }

  return (
    <Card title="Performance">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-3">
          {last !== undefined && (
            <span className="text-2xl font-semibold text-foreground">{formatUsd(last)}</span>
          )}
          {delta !== undefined && (
            <span className={`text-sm font-medium ${isUp ? "text-positive" : "text-negative"}`}>
              {isUp ? "+" : ""}
              {formatUsd(delta)}
              {deltaPct !== undefined ? ` (${isUp ? "+" : ""}${deltaPct.toFixed(1)}%)` : ""}
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {PERFORMANCE_PERIODS.map((p) => (
            <button
              key={p.period}
              type="button"
              onClick={() => setPeriod(p.period)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                period === p.period
                  ? "border-cove-indigo text-cove-indigo"
                  : "border-border text-foreground-muted hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {history.isLoading && (
        <div className="mt-2 flex flex-col gap-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}
      {history.isError && (
        <p className="text-sm text-negative">
          {history.error instanceof Error ? history.error.message : "Failed to load."}
        </p>
      )}
      {history.data && points.length === 0 && (
        <p className="mt-2 text-sm text-foreground-muted">
          No portfolio history yet for this period.
        </p>
      )}

      {points.length > 0 && (
        <div className="relative mt-2">
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="h-40 w-full touch-none"
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setHoverIndex(undefined)}
          >
            <path d={areaPath} fill={seriesColor} fillOpacity={0.1} stroke="none" />
            <path
              d={path}
              fill="none"
              stroke={seriesColor}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx={(hoverCoord ?? endCoord).x}
              cy={(hoverCoord ?? endCoord).y}
              r={4}
              fill={seriesColor}
              stroke="var(--surface)"
              strokeWidth={2}
            />
            {hoverCoord && (
              <line
                x1={hoverCoord.x}
                x2={hoverCoord.x}
                y1={0}
                y2={CHART_HEIGHT}
                stroke="var(--border)"
                strokeWidth={1}
              />
            )}
          </svg>
          {hoverPoint && hoverCoord && (
            <div
              className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg border border-border bg-surface-raised px-2.5 py-1.5 text-xs shadow-lg"
              style={{
                left: `${Math.min(92, Math.max(8, (hoverCoord.x / CHART_WIDTH) * 100))}%`,
              }}
            >
              <div className="font-semibold text-foreground">{formatUsd(hoverPoint.value)}</div>
              <div className="text-foreground-muted">
                {new Date(hoverPoint.timestamp.toNumber() * 1000).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: points.length > 40 ? "numeric" : undefined,
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
