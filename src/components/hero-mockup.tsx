"use client";

import { useEffect, useMemo, useState } from "react";
import type BigNumber from "bignumber.js";
import { TokenIcon } from "@/components/token-icon";
import { formatUsd, formatPercent } from "@/lib/format";
import { useMarketTicker, type TickerEntry } from "@/lib/use-market-ticker";

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

const ROTATE_MS = 4500;

type ChartPoint = { x: number; y: number; value: number };

/**
 * Catmull-Rom -> cubic Bezier control points for the segment p1->p2, so the
 * curve passes through every real point with a continuous tangent instead
 * of meeting at a sharp corner (each straight <line> segment used to kink
 * at every candle). Neighboring points shape the pull on each side; missing
 * neighbors at the ends just reuse the nearest point.
 */
function smoothSegments(pts: ChartPoint[]) {
  const segments: { p1: ChartPoint; p2: ChartPoint; cp1: ChartPoint; cp2: ChartPoint; up: boolean }[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    segments.push({
      p1,
      p2,
      cp1: { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6, value: 0 },
      cp2: { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6, value: 0 },
      up: p2.value >= p1.value,
    });
  }
  return segments;
}

/**
 * A glowing trend line built from real hourly closes — segments color by
 * direction (up/down), with a blurred "halo" stroke under a crisp one for
 * the neon look, entry/live dots, a dotted mean line, and a couple of
 * restrained corner accents. Takes the same closes array the ticker strip
 * already fetched for this symbol, so switching symbols doesn't refetch.
 */
function NeonTrendChart({ closes: closesBN }: { closes: BigNumber[] }) {
  const points = useMemo(() => {
    const closes = closesBN.map((c) => c.toNumber());
    if (closes.length < 2) return null;
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
  }, [closesBN]);

  if (!points) {
    return <div className="mt-3 h-28 w-full animate-pulse rounded-lg bg-surface-raised" />;
  }

  const { pts, avgY } = points;
  const first = pts[0];
  const last = pts[pts.length - 1];
  const overallUp = last.value >= first.value;
  const changePct = first.value > 0 ? ((last.value - first.value) / first.value) * 100 : 0;
  const segments = smoothSegments(pts);

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

        {/* glow halo, then crisp line, per up/down segment — cubic beziers
            through the real points so the curve stays smooth instead of
            kinking at every candle */}
        {segments.map((s, i) => {
          const color = s.up ? "var(--color-positive)" : "var(--color-negative)";
          const d = `M ${s.p1.x},${s.p1.y} C ${s.cp1.x},${s.cp1.y} ${s.cp2.x},${s.cp2.y} ${s.p2.x},${s.p2.y}`;
          return (
            <path
              key={`halo-${i}`}
              d={d}
              fill="none"
              stroke={color}
              strokeWidth="9"
              strokeLinecap="round"
              opacity="0.6"
              filter="url(#hero-chart-glow)"
            />
          );
        })}
        {segments.map((s, i) => {
          const color = s.up ? "var(--color-positive)" : "var(--color-negative)";
          const d = `M ${s.p1.x},${s.p1.y} C ${s.cp1.x},${s.cp1.y} ${s.cp2.x},${s.cp2.y} ${s.p2.x},${s.p2.y}`;
          return <path key={`line-${i}`} d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />;
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
        Entry {formatUsd(closesBN[0])}
      </span>
      <span
        className="absolute whitespace-nowrap text-[9px] font-medium uppercase tracking-wide text-cove-indigo"
        style={{ left: `${(last.x / CHART_W) * 100}%`, top: `${(last.y / CHART_H) * 100}%`, transform: "translate(-100%, -18px)" }}
      >
        Live {formatUsd(closesBN[closesBN.length - 1])} {overallUp ? "+" : ""}
        {changePct.toFixed(1)}%
      </span>
    </div>
  );
}

function MockupCard({ entry }: { entry: TickerEntry }) {
  const up = entry.changePct.gte(0);
  return (
    <div key={entry.symbol} className="cove-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TokenIcon symbol={entry.symbol} size={22} />
          <span className="text-sm font-semibold text-foreground">{entry.symbol}</span>
        </div>
        <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-foreground-muted">
          Nado
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums text-foreground">{formatUsd(entry.price)}</span>
        <span className={`text-xs font-medium ${up ? "text-positive" : "text-negative"}`}>
          {up ? "+" : ""}
          {formatPercent(entry.changePct)}
        </span>
      </div>

      <NeonTrendChart closes={entry.closes} />
    </div>
  );
}

/**
 * A stylized preview of the Trade page — not a screenshot, built from the
 * same visual language (card, order-book bars, tactile buttons) as the real
 * thing, so the hero reads as "here's the product" rather than stock art.
 * Rotates through a handful of real markets (crypto + tokenized stocks)
 * rather than parking on one symbol, so it doesn't read as "this is the
 * only thing NadoCove trades" — same list the ticker strip below shows.
 */
export function HeroMockup() {
  const ticker = useMarketTicker();
  const entries = ticker.data ?? [];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (entries.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % entries.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [entries.length]);

  const current = entries[index % Math.max(entries.length, 1)];

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
        {current ? (
          <MockupCard entry={current} />
        ) : (
          <div className="h-[194px] animate-pulse rounded-lg bg-surface-raised" />
        )}

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

        {entries.length > 1 && (
          <div className="mt-4 flex justify-center gap-1.5">
            {entries.map((e, i) => (
              <span
                key={e.symbol}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-4 bg-cove-indigo" : "w-1.5 bg-border"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
