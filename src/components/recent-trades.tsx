"use client";

import { removeDecimals } from "@nadohq/shared";
import { formatAmount, formatUsd } from "@/lib/format";
import { useRecentTrades } from "@/lib/use-recent-trades";
import { Skeleton } from "@/components/skeleton";

/**
 * The market's real trade tape — getMatchEvents with no subaccount filter,
 * so this is every trader's fills on this product, not one account's
 * history. Each real trade produces a maker + taker match event pair;
 * keeping only isTaker rows gives one row per trade instead of two.
 */
export function RecentTrades({ productId }: { productId: number | undefined }) {
  const trades = useRecentTrades(productId);

  if (trades.isLoading) {
    return (
      <div className="flex flex-col gap-1 px-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-full" />
        ))}
      </div>
    );
  }

  if (trades.isError || !trades.data) {
    return (
      <p className="px-2 text-sm text-negative">
        {trades.error instanceof Error ? trades.error.message : "Failed to load trades."}
      </p>
    );
  }

  const rows = trades.data
    .filter((t) => t.isTaker && !t.baseFilled.isZero())
    .sort((a, b) => b.timestamp.minus(a.timestamp).toNumber());

  if (rows.length === 0) {
    return <p className="px-2 text-xs text-foreground-muted">No trades yet for this market.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between px-2 text-[11px] text-foreground-muted">
        <span>Price</span>
        <span>Size</span>
        <span>Time</span>
      </div>
      <div className="flex flex-col">
        {rows.map((t) => {
          const isBuy = t.baseFilled.gt(0);
          // price is a ratio of two equally-scaled raw fields, so it's
          // already correct; size needs removeDecimals like every other
          // raw indexer amount (see trade-history-table.tsx).
          const price = t.quoteFilled.abs().div(t.baseFilled.abs());
          const size = removeDecimals(t.baseFilled.abs(), 18);
          const time = new Date(t.timestamp.toNumber() * 1000);
          return (
            <div
              key={`${t.digest}-${t.submissionIndex}`}
              className="flex items-center justify-between px-2 py-0.5 text-xs"
            >
              <span className={isBuy ? "text-positive" : "text-negative"}>{formatUsd(price)}</span>
              <span className="text-foreground-muted">{formatAmount(size, 4)}</span>
              <span className="text-foreground-muted">
                {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
