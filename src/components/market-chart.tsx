"use client";

import { useMemo, useState, type PointerEvent } from "react";
import BigNumber from "bignumber.js";
import { Card } from "@/components/card";
import { Skeleton } from "@/components/skeleton";
import { formatUsd } from "@/lib/format";
import { CANDLE_PERIODS, useCandlesticks } from "@/lib/use-candlesticks";

const CHART_WIDTH = 600;
const CHART_HEIGHT = 220;
const PADDING_Y = 10;

/**
 * Real OHLC candlesticks from the indexer (getCandlesticks) — hand-rolled
 * SVG rendering, same approach as PerformanceChart, rather than pulling in
 * a charting library for one page.
 */
export function MarketChart({ productId, symbol }: { productId: number | undefined; symbol: string | undefined }) {
  const [periodSeconds, setPeriodSeconds] = useState<number>(3600);
  const candles = useCandlesticks(productId, periodSeconds);
  const [hoverIndex, setHoverIndex] = useState<number | undefined>(undefined);

  const data = useMemo(() => [...(candles.data ?? [])].sort((a, b) => a.time.minus(b.time).toNumber()), [candles.data]);

  const { min, max, bars } = useMemo(() => {
    if (data.length === 0) return { min: 0, max: 0, bars: [] as ReturnType<typeof buildBars> };
    let lo = data[0].low;
    let hi = data[0].high;
    for (const c of data) {
      if (c.low.lt(lo)) lo = c.low;
      if (c.high.gt(hi)) hi = c.high;
    }
    return { min: lo.toNumber(), max: hi.toNumber(), bars: buildBars(data, lo.toNumber(), hi.toNumber()) };
  }, [data]);

  function buildBars(candlesData: typeof data, lo: number, hi: number) {
    const range = hi - lo || 1;
    const slot = CHART_WIDTH / candlesData.length;
    const bodyWidth = Math.max(2, slot * 0.6);
    const yFor = (v: number) =>
      CHART_HEIGHT - PADDING_Y - ((v - lo) / range) * (CHART_HEIGHT - PADDING_Y * 2);
    return candlesData.map((c, i) => {
      const x = i * slot + slot / 2;
      const open = c.open.toNumber();
      const close = c.close.toNumber();
      const up = close >= open;
      return {
        x,
        wickTop: yFor(Math.max(c.high.toNumber(), c.low.toNumber())),
        wickBottom: yFor(Math.min(c.high.toNumber(), c.low.toNumber())),
        bodyTop: yFor(Math.max(open, close)),
        bodyBottom: yFor(Math.min(open, close)),
        bodyWidth,
        up,
        candle: c,
      };
    });
  }

  const hovered = hoverIndex !== undefined ? data[hoverIndex] : undefined;

  function handlePointerMove(e: PointerEvent<SVGSVGElement>) {
    if (bars.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = ((e.clientX - rect.left) / rect.width) * CHART_WIDTH;
    const slot = CHART_WIDTH / bars.length;
    const index = Math.min(bars.length - 1, Math.max(0, Math.floor(relativeX / slot)));
    setHoverIndex(index);
  }

  return (
    <Card title={symbol ?? "Market"} note="real candlesticks — Nado indexer">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        {hovered ? (
          <div className="flex flex-wrap gap-3 text-xs text-foreground-muted">
            <span>O {formatUsd(hovered.open)}</span>
            <span>H {formatUsd(hovered.high)}</span>
            <span>L {formatUsd(hovered.low)}</span>
            <span>C {formatUsd(hovered.close)}</span>
          </div>
        ) : (
          <span className="text-xs text-foreground-muted">Hover the chart for OHLC</span>
        )}
        <div className="flex gap-1">
          {CANDLE_PERIODS.map((p) => (
            <button
              key={p.seconds}
              type="button"
              onClick={() => setPeriodSeconds(p.seconds)}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                periodSeconds === p.seconds
                  ? "border-cove-indigo text-cove-indigo"
                  : "border-border text-foreground-muted hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {candles.isLoading && <Skeleton className="h-56 w-full" />}
      {candles.isError && (
        <p className="text-sm text-negative">
          {candles.error instanceof Error ? candles.error.message : "Failed to load chart."}
        </p>
      )}
      {candles.data && data.length === 0 && (
        <p className="text-sm text-foreground-muted">No candles yet for this market/period.</p>
      )}

      {bars.length > 0 && (
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="h-56 w-full touch-none"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverIndex(undefined)}
        >
          {bars.map((b, i) => (
            <g key={i} opacity={hoverIndex === undefined || hoverIndex === i ? 1 : 0.55}>
              <line
                x1={b.x}
                x2={b.x}
                y1={b.wickTop}
                y2={b.wickBottom}
                stroke={b.up ? "var(--color-positive)" : "var(--color-negative)"}
                strokeWidth={1}
              />
              <rect
                x={b.x - b.bodyWidth / 2}
                y={b.bodyTop}
                width={b.bodyWidth}
                height={Math.max(1, b.bodyBottom - b.bodyTop)}
                fill={b.up ? "var(--color-positive)" : "var(--color-negative)"}
              />
            </g>
          ))}
          {hoverIndex !== undefined && bars[hoverIndex] && (
            <line
              x1={bars[hoverIndex].x}
              x2={bars[hoverIndex].x}
              y1={0}
              y2={CHART_HEIGHT}
              stroke="var(--border)"
              strokeWidth={1}
            />
          )}
        </svg>
      )}
      {bars.length > 0 && (
        <div className="mt-1 flex justify-between text-[11px] text-foreground-muted">
          <span>{formatUsd(new BigNumber(min))}</span>
          <span>{formatUsd(new BigNumber(max))}</span>
        </div>
      )}
    </Card>
  );
}
