"use client";

import { useMemo, useState, type PointerEvent } from "react";
import BigNumber from "bignumber.js";
import { Card } from "@/components/card";
import { Skeleton } from "@/components/skeleton";
import { formatMarketPair, formatUsd } from "@/lib/format";
import { CANDLE_PERIODS, useCandlesticks } from "@/lib/use-candlesticks";
import { usePerpPrices } from "@/lib/use-perp-prices";

// AXIS_WIDTH is reserved screen space for the right-side price axis —
// candles/gridlines only ever draw within [0, PLOT_WIDTH], and price
// labels sit in the margin to its right, same layout most real trading
// charts use so the labels never overlap the candles themselves.
const CHART_WIDTH = 640;
const CHART_HEIGHT = 320;
const PADDING_Y = 14;
const AXIS_WIDTH = 58;
const PLOT_WIDTH = CHART_WIDTH - AXIS_WIDTH;
const PRICE_GRID_LINES = 4;
const CANDLE_LIMIT = 80;

function formatAxisTime(unixSeconds: number, periodSeconds: number): string {
  const date = new Date(unixSeconds * 1000);
  if (periodSeconds >= 86_400) {
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

/**
 * Real OHLC candlesticks from the indexer (getCandlesticks) — hand-rolled
 * SVG rendering, same approach as PerformanceChart, rather than pulling in
 * a charting library for one page. A real price axis (gridlines + labels)
 * and time axis, not just a min/max caption, so the chart carries as much
 * information at a glance as the exchanges people are used to.
 */
export function MarketChart({ productId, symbol }: { productId: number | undefined; symbol: string | undefined }) {
  const [periodSeconds, setPeriodSeconds] = useState<number>(3600);
  const candles = useCandlesticks(productId, periodSeconds, CANDLE_LIMIT);
  // Same 5s-refetching query MarketHeader uses for Mark/Oracle — react-query
  // dedupes by queryKey, so this doesn't add an extra network request. Drawn
  // as a live line on the chart so it's visibly moving, not just a static
  // snapshot of closed candles.
  const perpPrices = usePerpPrices(productId);
  const livePrice = perpPrices.data?.markPrice;
  const [hoverIndex, setHoverIndex] = useState<number | undefined>(undefined);

  const data = useMemo(() => [...(candles.data ?? [])].sort((a, b) => a.time.minus(b.time).toNumber()), [candles.data]);

  const { bars, liveY, gridLines } = useMemo(() => {
    if (data.length === 0) {
      return { bars: [] as ReturnType<typeof buildBars>, liveY: undefined, gridLines: [] as { y: number; price: number }[] };
    }
    let lo = data[0].low;
    let hi = data[0].high;
    for (const c of data) {
      if (c.low.lt(lo)) lo = c.low;
      if (c.high.gt(hi)) hi = c.high;
    }
    // Extend the range so the live price line always lands inside the chart
    // even if it's moved past the loaded candles' high/low.
    if (livePrice) {
      if (livePrice.lt(lo)) lo = livePrice;
      if (livePrice.gt(hi)) hi = livePrice;
    }
    const loNum = lo.toNumber();
    const hiNum = hi.toNumber();
    const range = hiNum - loNum || 1;
    const yFor = (v: number) => CHART_HEIGHT - PADDING_Y - ((v - loNum) / range) * (CHART_HEIGHT - PADDING_Y * 2);
    const lines = Array.from({ length: PRICE_GRID_LINES + 1 }, (_, i) => {
      const price = loNum + (range * i) / PRICE_GRID_LINES;
      return { y: yFor(price), price };
    });
    return {
      bars: buildBars(data, loNum, hiNum),
      liveY: livePrice ? yFor(livePrice.toNumber()) : undefined,
      gridLines: lines,
    };
  }, [data, livePrice]);

  function buildBars(candlesData: typeof data, lo: number, hi: number) {
    const range = hi - lo || 1;
    const slot = PLOT_WIDTH / candlesData.length;
    const bodyWidth = Math.max(3, slot * 0.72);
    const wickWidth = Math.max(1.2, bodyWidth * 0.16);
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
        wickWidth,
        up,
        candle: c,
      };
    });
  }

  const hovered = hoverIndex !== undefined ? data[hoverIndex] : undefined;
  const hoveredBar = hoverIndex !== undefined ? bars[hoverIndex] : undefined;

  function handlePointerMove(e: PointerEvent<SVGSVGElement>) {
    if (bars.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = ((e.clientX - rect.left) / rect.width) * CHART_WIDTH;
    const slot = PLOT_WIDTH / bars.length;
    const index = Math.min(bars.length - 1, Math.max(0, Math.floor(relativeX / slot)));
    setHoverIndex(index);
  }

  const timeLabels =
    data.length > 1
      ? [data[0], data[Math.floor((data.length - 1) / 2)], data[data.length - 1]]
      : [];

  return (
    <Card
      title={symbol ? formatMarketPair(symbol) : "Market"}
      note={
        <span className="inline-flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-positive opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-positive" />
          </span>
          Live — real candlesticks, Nado indexer
        </span>
      }
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        {hovered ? (
          <div className="flex flex-wrap gap-3 text-xs text-foreground-muted">
            <span>O {formatUsd(hovered.open)}</span>
            <span>H {formatUsd(hovered.high)}</span>
            <span>L {formatUsd(hovered.low)}</span>
            <span>C {formatUsd(hovered.close)}</span>
          </div>
        ) : livePrice ? (
          <span className="text-xs text-foreground-muted">
            Mark <span className="font-medium tabular-nums text-foreground">{formatUsd(livePrice)}</span>
          </span>
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

      {candles.isLoading && <Skeleton className="h-80 w-full" />}
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
          className="h-80 w-full touch-none"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverIndex(undefined)}
        >
          {gridLines.map((g, i) => (
            <g key={i}>
              <line x1={0} x2={PLOT_WIDTH} y1={g.y} y2={g.y} stroke="var(--border)" strokeWidth={1} opacity={0.6} />
              <text x={PLOT_WIDTH + 8} y={g.y} dy="0.32em" fontSize={10} fill="var(--foreground-muted)">
                {formatUsd(new BigNumber(g.price))}
              </text>
            </g>
          ))}

          {bars.map((b, i) => (
            <g key={i} opacity={hoverIndex === undefined || hoverIndex === i ? 1 : 0.55}>
              <line
                x1={b.x}
                x2={b.x}
                y1={b.wickTop}
                y2={b.wickBottom}
                stroke={b.up ? "var(--color-positive)" : "var(--color-negative)"}
                strokeWidth={b.wickWidth}
              />
              <rect
                x={b.x - b.bodyWidth / 2}
                y={b.bodyTop}
                width={b.bodyWidth}
                height={Math.max(1.5, b.bodyBottom - b.bodyTop)}
                rx={Math.min(1.5, b.bodyWidth * 0.2)}
                fill={b.up ? "var(--color-positive)" : "var(--color-negative)"}
              />
            </g>
          ))}

          {liveY !== undefined && (
            <>
              <line
                x1={0}
                x2={PLOT_WIDTH}
                y1={liveY}
                y2={liveY}
                stroke="var(--color-cove-indigo)"
                strokeWidth={1}
                strokeDasharray="4 3"
                opacity={0.6}
              />
              <rect x={PLOT_WIDTH} y={liveY - 8} width={AXIS_WIDTH} height={16} rx={3} fill="var(--color-cove-indigo)" />
              <text x={PLOT_WIDTH + AXIS_WIDTH / 2} y={liveY} dy="0.32em" fontSize={10} fontWeight={600} textAnchor="middle" fill="var(--background)">
                {livePrice ? formatUsd(livePrice) : ""}
              </text>
              <circle cx={PLOT_WIDTH - 4} cy={liveY} r={3} fill="var(--color-cove-indigo)">
                <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
              </circle>
            </>
          )}

          {hoveredBar && (
            <>
              <line x1={hoveredBar.x} x2={hoveredBar.x} y1={0} y2={CHART_HEIGHT} stroke="var(--border)" strokeWidth={1} />
              <line
                x1={0}
                x2={PLOT_WIDTH}
                y1={hoveredBar.bodyBottom}
                y2={hoveredBar.bodyBottom}
                stroke="var(--foreground-muted)"
                strokeWidth={1}
                strokeDasharray="2 2"
                opacity={0.5}
              />
            </>
          )}
        </svg>
      )}
      {timeLabels.length > 0 && (
        <div className="mt-1 flex justify-between text-[11px] text-foreground-muted">
          {timeLabels.map((c, i) => (
            <span key={i}>{formatAxisTime(c.time.toNumber(), periodSeconds)}</span>
          ))}
        </div>
      )}
    </Card>
  );
}
