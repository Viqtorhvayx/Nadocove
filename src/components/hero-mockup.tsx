"use client";

import { TokenIcon } from "@/components/token-icon";
import { formatUsd, formatPercent } from "@/lib/format";
import { useMarketTicker } from "@/lib/use-market-ticker";

const SPARKLINE_POINTS = "0,38 20,32 40,35 60,22 80,26 100,14 120,18 140,8 160,12 180,2";

const DEPTH_ROWS = [
  { side: "ask" as const, width: 62 },
  { side: "ask" as const, width: 88 },
  { side: "ask" as const, width: 40 },
  { side: "bid" as const, width: 70 },
  { side: "bid" as const, width: 95 },
  { side: "bid" as const, width: 48 },
];

/**
 * A stylized preview of the Trade page — not a screenshot, built from the
 * same visual language (card, order-book bars, tactile buttons) as the real
 * thing, so the hero reads as "here's the product" rather than stock art.
 * The headline price is real (a live AAPL-PERP quote) where it's cheap to
 * be; the depth rows are illustrative, same as any product mockup's chrome.
 */
export function HeroMockup() {
  const ticker = useMarketTicker();
  const aapl = ticker.data?.find((e) => e.symbol === "AAPL-PERP");
  const up = aapl ? aapl.changePct.gte(0) : true;

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

        <svg viewBox="0 0 180 44" className="mt-3 h-11 w-full" preserveAspectRatio="none">
          <polyline
            points={SPARKLINE_POINTS}
            fill="none"
            stroke="var(--color-positive)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

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
