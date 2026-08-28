"use client";

import BigNumber from "bignumber.js";
import { removeDecimals } from "@nadohq/shared";
import { Skeleton } from "@/components/skeleton";
import { formatAmount, formatUsd } from "@/lib/format";
import { useMarketLiquidity } from "@/lib/use-market-liquidity";

type Tick = { price: BigNumber; liquidity: BigNumber; cumulative: BigNumber };

/**
 * price is already human-readable (the engine's convention for price
 * fields), but liquidity is a raw 18-decimal fixed-point amount — same
 * distinction as fill sizes from the indexer. Convert once here so
 * everything downstream (cumulative sums, bar widths, display) is correct.
 */
function withCumulative(ticks: { price: BigNumber; liquidity: BigNumber }[]): Tick[] {
  let running = new BigNumber(0);
  return ticks.map((t) => {
    const liquidity = removeDecimals(t.liquidity, 18);
    running = running.plus(liquidity);
    return { price: t.price, liquidity, cumulative: running };
  });
}

const DEPTH = 12;

/**
 * Real per-price-tick order book depth from the engine (getMarketLiquidity)
 * — not a synthesized or mocked book. Depth bars show cumulative size
 * outward from the spread, the standard order book convention.
 */
export function OrderBook({ productId }: { productId: number | undefined }) {
  const liquidity = useMarketLiquidity(productId, DEPTH);

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

  const asksBestFirst = withCumulative(
    [...liquidity.data.asks].sort((a, b) => a.price.minus(b.price).toNumber()).slice(0, DEPTH),
  );
  const bidsBestFirst = withCumulative(
    [...liquidity.data.bids].sort((a, b) => b.price.minus(a.price).toNumber()).slice(0, DEPTH),
  );
  const asksDisplay = [...asksBestFirst].reverse();

  const maxAskCumulative = asksBestFirst[asksBestFirst.length - 1]?.cumulative ?? new BigNumber(1);
  const maxBidCumulative = bidsBestFirst[bidsBestFirst.length - 1]?.cumulative ?? new BigNumber(1);

  const bestAsk = asksBestFirst[0]?.price;
  const bestBid = bidsBestFirst[0]?.price;
  const spread = bestAsk && bestBid ? bestAsk.minus(bestBid) : undefined;

  function Row({ tick, side, maxCumulative }: { tick: Tick; side: "bid" | "ask"; maxCumulative: BigNumber }) {
    const pct = maxCumulative.isZero() ? 0 : tick.cumulative.div(maxCumulative).times(100).toNumber();
    const color = side === "bid" ? "text-positive" : "text-negative";
    const barColor = side === "bid" ? "bg-positive/10" : "bg-negative/10";
    return (
      <div className="relative flex items-center justify-between px-2 py-0.5 text-xs">
        <div
          className={`absolute inset-y-0 right-0 ${barColor}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
        <span className={`relative ${color}`}>{formatUsd(tick.price)}</span>
        <span className="relative text-foreground-muted">{formatAmount(tick.liquidity, 4)}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between px-2 text-[11px] text-foreground-muted">
        <span>Price</span>
        <span>Size</span>
      </div>
      <div className="flex flex-col-reverse">
        {asksDisplay.length === 0 && (
          <p className="px-2 text-xs text-foreground-muted">No ask liquidity.</p>
        )}
        {asksDisplay.map((tick) => (
          <Row key={tick.price.toString()} tick={tick} side="ask" maxCumulative={maxAskCumulative} />
        ))}
      </div>

      <div className="lcd-readout flex items-center justify-between px-3 py-2 text-sm font-semibold">
        <span>{bestAsk && bestBid ? formatUsd(bestBid.plus(bestAsk).div(2)) : "—"}</span>
        <span className="text-xs font-normal opacity-70">
          {spread ? `spread ${formatUsd(spread)}` : ""}
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
