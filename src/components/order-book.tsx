"use client";

import { useMemo, useState } from "react";
import BigNumber from "bignumber.js";
import { removeDecimals } from "@nadohq/shared";
import type { EngineSymbol } from "@nadohq/engine-client";
import { Skeleton } from "@/components/skeleton";
import { formatAmount, formatUsd } from "@/lib/format";
import { useMarketLiquidity } from "@/lib/use-market-liquidity";

type Tick = { price: BigNumber; liquidity: BigNumber; cumulative: BigNumber };

const GROUPINGS = [1, 5, 25];

/**
 * Groups raw engine ticks into wider price buckets (N x the market's real
 * price increment) and sums their liquidity — same idea as Hyperliquid's
 * "1/5/25" tick-size selector, computed client-side from the same real
 * per-tick data rather than a second query.
 */
function groupTicks(ticks: { price: BigNumber; liquidity: BigNumber }[], bucketSize: BigNumber, roundUp: boolean) {
  const buckets = new Map<string, { price: BigNumber; liquidity: BigNumber }>();
  for (const t of ticks) {
    const n = t.price.div(bucketSize);
    const bucketIndex = roundUp ? n.integerValue(BigNumber.ROUND_CEIL) : n.integerValue(BigNumber.ROUND_FLOOR);
    const bucketPrice = bucketIndex.times(bucketSize);
    const key = bucketPrice.toString();
    const existing = buckets.get(key);
    if (existing) {
      existing.liquidity = existing.liquidity.plus(t.liquidity);
    } else {
      buckets.set(key, { price: bucketPrice, liquidity: t.liquidity });
    }
  }
  return [...buckets.values()];
}

function withCumulative(ticks: { price: BigNumber; liquidity: BigNumber }[]): Tick[] {
  let running = new BigNumber(0);
  return ticks.map((t) => {
    const liquidity = removeDecimals(t.liquidity, 18);
    running = running.plus(liquidity);
    return { price: t.price, liquidity, cumulative: running };
  });
}

const DEPTH = 40;
const ROWS_SHOWN = 12;

/**
 * Real per-price-tick order book depth from the engine (getMarketLiquidity)
 * — not a synthesized or mocked book. Depth bars show cumulative size
 * outward from the spread, the standard order book convention.
 */
export function OrderBook({ productId, symbol }: { productId: number | undefined; symbol: EngineSymbol | undefined }) {
  const liquidity = useMarketLiquidity(productId, DEPTH);
  const [grouping, setGrouping] = useState(0);

  const bucketSize = useMemo(() => {
    const increment = symbol?.priceIncrement ?? new BigNumber(0.01);
    return increment.times(GROUPINGS[grouping]);
  }, [symbol, grouping]);

  if (liquidity.isLoading) {
    return (
      <div className="flex flex-col gap-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-full" />
        ))}
      </div>
    );
  }

  if (liquidity.isError || !liquidity.data) {
    return (
      <p className="text-sm text-negative">
        {liquidity.error instanceof Error ? liquidity.error.message : "Failed to load order book."}
      </p>
    );
  }

  const askTicks = groupTicks(liquidity.data.asks, bucketSize, true);
  const bidTicks = groupTicks(liquidity.data.bids, bucketSize, false);

  const asksBestFirst = withCumulative(
    [...askTicks].sort((a, b) => a.price.minus(b.price).toNumber()).slice(0, ROWS_SHOWN),
  );
  const bidsBestFirst = withCumulative(
    [...bidTicks].sort((a, b) => b.price.minus(a.price).toNumber()).slice(0, ROWS_SHOWN),
  );
  const asksDisplay = [...asksBestFirst].reverse();

  const maxAskCumulative = asksBestFirst[asksBestFirst.length - 1]?.cumulative ?? new BigNumber(1);
  const maxBidCumulative = bidsBestFirst[bidsBestFirst.length - 1]?.cumulative ?? new BigNumber(1);

  const bestAsk = asksBestFirst[0]?.price;
  const bestBid = bidsBestFirst[0]?.price;
  const spread = bestAsk && bestBid ? bestAsk.minus(bestBid) : undefined;
  const spreadPct = bestAsk && bestBid && bestBid.gt(0) ? spread!.div(bestBid).times(100) : undefined;

  function Row({ tick, side, maxCumulative }: { tick: Tick; side: "bid" | "ask"; maxCumulative: BigNumber }) {
    const pct = maxCumulative.isZero() ? 0 : tick.cumulative.div(maxCumulative).times(100).toNumber();
    const color = side === "bid" ? "text-positive" : "text-negative";
    const glow = side === "bid" ? "rgba(52,211,153,0.55)" : "rgba(248,113,113,0.55)";
    return (
      <div className="relative flex items-center justify-between px-2 py-0.5 text-xs">
        <div
          className="absolute inset-y-0 right-0 rounded-[2px]"
          style={{
            width: `${Math.min(100, pct)}%`,
            backgroundImage:
              side === "bid"
                ? `linear-gradient(to left, ${glow}, transparent)`
                : `linear-gradient(to right, ${glow}, transparent)`,
            opacity: 0.18,
          }}
        />
        <span className={`relative tabular-nums ${color}`}>{formatUsd(tick.price)}</span>
        <span className="relative tabular-nums text-foreground-muted">{formatAmount(tick.liquidity, 4)}</span>
        <span className="relative tabular-nums text-foreground-muted">{formatAmount(tick.cumulative, 4)}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-2">
        <div className="flex gap-1">
          {GROUPINGS.map((g, i) => (
            <button
              key={g}
              type="button"
              onClick={() => setGrouping(i)}
              className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition ${
                grouping === i
                  ? "bg-surface-raised text-foreground"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              {g}x
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between px-2 text-[11px] text-foreground-muted">
        <span>Price</span>
        <span>Size</span>
        <span>Total</span>
      </div>
      <div className="flex flex-col-reverse">
        {asksDisplay.length === 0 && (
          <p className="px-2 text-xs text-foreground-muted">No ask liquidity.</p>
        )}
        {asksDisplay.map((tick) => (
          <Row key={tick.price.toString()} tick={tick} side="ask" maxCumulative={maxAskCumulative} />
        ))}
      </div>

      <div className="flex items-center justify-between border-y border-border px-2 py-1.5 text-xs">
        <span className="font-semibold tabular-nums text-foreground">
          {bestAsk && bestBid ? formatUsd(bestBid.plus(bestAsk).div(2)) : "—"}
        </span>
        <span className="text-foreground-muted">
          {spread ? `spread ${formatUsd(spread)}${spreadPct ? ` · ${spreadPct.toFixed(3)}%` : ""}` : ""}
        </span>
      </div>

      <div className="flex flex-col">
        {bidsBestFirst.length === 0 && (
          <p className="px-2 text-xs text-foreground-muted">No bid liquidity.</p>
        )}
        {bidsBestFirst.map((tick) => (
          <Row key={tick.price.toString()} tick={tick} side="bid" maxCumulative={maxBidCumulative} />
        ))}
      </div>
    </div>
  );
}
