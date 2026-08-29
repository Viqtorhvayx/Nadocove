"use client";

import { useMemo } from "react";
import BigNumber from "bignumber.js";
import { TokenIcon } from "@/components/token-icon";
import { formatUsd, formatPercent } from "@/lib/format";
import { useMarketTicker } from "@/lib/use-market-ticker";
import { useSymbols } from "@/lib/use-subaccount-data";
import { useCandlesticks } from "@/lib/use-candlesticks";

const DEPTH_ROWS = [
  { side: "ask" as const, width: 62 },
  { side: "ask" as const, width: 88 },
  { side: "ask" as const, width: 40 },
  { side: "bid" as const, width: 70 },
  { side: "bid" as const, width: 95 },
  { side: "bid" as const, width: 48 },
];

const CHART_W = 300;
const CHART_H = 108;
const CHART_PAD = 10;

/**
 * A glowing trend line built from real hourly AAPL-PERP closes — segments
 * color by direction (up/down), with a blurred "halo" stroke under a crisp
 * one for the neon look, entry/live dots, a dotted mean line, and a couple
 * of restrained corner accents. No screenshot, no invented numbers: every
 * value on this chart is a real candle close from Nado's indexer.
 */
function NeonTrendChart({ productId }: { productId: number | undefined }) {
  const candles = useCandlesticks(productId, 3600, 18);

  const points = useMemo(() => {
    const data = [...(candles.data ?? [])].sort((a, b) => a.time.minus(b.time).toNumber());
    if (data.length < 2) return null;
    const closes = data.map((c) => c.close.toNumber());
    const lo = Math.min(...closes);
    const hi = Math.max(...closes);
    const range = hi - lo || 1;
    const stepX = (CHART_W - CHART_PAD * 2) / (closes.length - 1);
    const avg = closes.reduce((a, b) => a + b, 0) / closes.length;
    return {
      raw: closes,
      avgY: CHART_H - CHART_PAD - ((avg - lo) / range) * (CHART_H - CHART_PAD * 2),
      pts: closes.map((c, i) => ({
        x: CHART_PAD + i * stepX,
        y: CHART_H - CHART_PAD - ((c - lo) / range) * (CHART_H - CHART_PAD * 2),
        value: c,
      })),
    };
  }, [candles.data]);

  if (!points) {
    return <div className="mt-3 h-28 w-full animate-pulse rounded-lg bg-surface-raised" />;
  }

  const { pts, avgY, raw } = points;
  const first = pts[0];
  const last = pts[pts.length - 1];
  const overallUp = last.value >= first.value;
  const changePct = first.value > 0 ? ((last.value - first.value) / first.value) * 100 : 0;

  return (
    <div className="relative mt-3 h-28 w-full">
      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        className="h-full w-full"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="hero-chart-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="4.5" />
          </filter>
        </defs>

        {/* corner accents */}
        <g opacity="0.35">
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => (
              <circle key={`${r}-${c}`} cx={6 + c * 6} cy={6 + r * 6} r="1" fill="var(--foreground-muted)" />
            )),
          )}
        </g>
        <polyline
          points={`${CHART_W - 4},${CHART_H - 22} ${CHART_W - 4},${CHART_H - 4} ${CHART_W - 22},${CHART_H - 4}`}
          fill="none"
          stroke="var(--border)"
          strokeWidth="1"
          opacity="0.6"
        />

        {/* dotted mean line */}
        <line
          x1={CHART_PAD}
          y1={avgY}
          x2={CHART_W - CHART_PAD}
          y2={avgY}
          stroke="var(--foreground-muted)"
          strokeWidth="1"
          strokeDasharray="1.5 3.5"
          opacity="0.35"
        />

        {/* glow halo, then crisp line, per up/down segment */}
        {pts.slice(1).map((p, i) => {
          const prev = pts[i];
          const color = p.value >= prev.value ? "var(--color-positive)" : "var(--color-negative)";
          return (
            <line
              key={`halo-${i}`}
              x1={prev.x}
              y1={prev.y}
              x2={p.x}
              y2={p.y}
              stroke={color}
              strokeWidth="9"
              strokeLinecap="round"
              opacity="0.6"
              filter="url(#hero-chart-glow)"
            />
          );
        })}
        {pts.slice(1).map((p, i) => {
          const prev = pts[i];
          const color = p.value >= prev.value ? "var(--color-positive)" : "var(--color-negative)";
          return (
            <line key={`line-${i}`} x1={prev.x} y1={prev.y} x2={p.x} y2={p.y} stroke={color} strokeWidth="2" strokeLinecap="round" />
          );
        })}

        <circle cx={first.x} cy={first.y} r="5" fill="var(--color-positive)" opacity="0.65" filter="url(#hero-chart-glow)" />
        <circle cx={first.x} cy={first.y} r="2.5" fill="var(--color-positive)" />
        <circle
          cx={last.x}
          cy={last.y}
          r="6.5"
          fill="var(--color-cove-indigo)"
          opacity="0.7"
          filter="url(#hero-chart-glow)"
          className="animate-pulse"
        />
        <circle cx={last.x} cy={last.y} r="3" fill="var(--color-cove-indigo)" />
      </svg>

      <span
        className="absolute text-[9px] font-medium uppercase tracking-wide text-positive"
        style={{ left: `${(first.x / CHART_W) * 100}%`, top: `${(first.y / CHART_H) * 100}%`, transform: "translate(-2px, 8px)" }}
      >
        Entry {formatUsd(new BigNumber(raw[0]))}
      </span>
      <span
        className="absolute whitespace-nowrap text-[9px] font-medium uppercase tracking-wide text-cove-indigo"
        style={{ left: `${(last.x / CHART_W) * 100}%`, top: `${(last.y / CHART_H) * 100}%`, transform: "translate(-100%, -18px)" }}
      >
        Live {formatUsd(new BigNumber(raw[raw.length - 1]))} {overallUp ? "+" : ""}
        {changePct.toFixed(1)}%
      </span>
    </div>
  );
}

/**
 * A stylized preview of the Trade page — not a screenshot, built from the
 * same visual language (card, order-book bars, tactile buttons) as the real
 * thing, so the hero reads as "here's the product" rather than stock art.
 * The headline price is real (a live AAPL-PERP quote) where it's cheap to
 * be; the depth rows are illustrative, same as any product mockup's chrome.
 */
export function HeroMockup() {
  const ticker = useMarketTicker();
  const symbolsQuery = useSymbols();
  const aapl = ticker.data?.find((e) => e.symbol === "AAPL-PERP");
  const up = aapl ? aapl.changePct.gte(0) : true;
  const aaplProductId = Object.values(symbolsQuery.data?.symbols ?? {}).find(
    (s) => s.symbol === "AAPL-PERP",
  )?.productId;

  return (
    <div className="relative mx-auto w-full max-w-sm" style={{ perspective: "1200px" }}>
      <div
        aria-hidden
        className="aurora-blob pointer-events-none absolute -left-10 -top-10 h-56 w-56 rounded-full bg-cove-indigo/25 blur-3xl"
      />
      <div
        aria-hidden
        className="aurora-blob pointer-events-none absolute -bottom-12 -right-6 h-52 w-52 rounded-full bg-cove-amber/20 blur-3xl"
        style={{ animationDelay: "-6s", animationDuration: "22s" }}
      />

      <div className="hero-mockup-card cove-scale-in relative rounded-2xl border border-border bg-surface p-5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TokenIcon symbol="AAPL-PERP" size={22} />
            <span className="text-sm font-semibold text-foreground">AAPL-PERP</span>
          </div>
          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-foreground-muted">
            Nado
          </span>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-semibold tabular-nums text-foreground">
            {aapl ? formatUsd(aapl.price) : "—"}
          </span>
          <span className={`text-xs font-medium ${up ? "text-positive" : "text-negative"}`}>
            {aapl ? `${up ? "+" : ""}${formatPercent(aapl.changePct)}` : ""}
          </span>
        </div>

        <NeonTrendChart productId={aaplProductId} />

        <div className="mt-4 flex flex-col gap-1">
          {DEPTH_ROWS.map((row, i) => (
            <div key={i} className="relative h-2.5 overflow-hidden rounded-sm bg-surface-raised">
              <div
                className={`absolute inset-y-0 ${row.side === "bid" ? "left-0 bg-positive/25" : "right-0 bg-negative/25"}`}
                style={{ width: `${row.width}%` }}
              />
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <span className="flex-1 rounded-lg border border-positive/40 bg-positive/10 py-2 text-center text-xs font-semibold text-positive">
            Buy
          </span>
          <span className="flex-1 rounded-lg border border-negative/40 bg-negative/10 py-2 text-center text-xs font-semibold text-negative">
            Sell
          </span>
        </div>
      </div>
    </div>
  );
}
