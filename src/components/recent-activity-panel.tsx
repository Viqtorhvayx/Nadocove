"use client";

import Link from "next/link";
import { removeDecimals } from "@nadohq/shared";
import { Skeleton } from "@/components/skeleton";
import { TokenIcon } from "@/components/token-icon";
import { formatAmount, formatRelativeTime, formatUsd } from "@/lib/format";
import { useMatchHistory } from "@/lib/use-match-history";
import { useSymbolMap } from "@/lib/use-symbol-map";

/**
 * A compact recent-fills preview for the portfolio sidebar — same real
 * data as the dedicated History tab (useMatchHistory), just the last few
 * with a link to the full page rather than a second full table living
 * here too.
 */
export function RecentActivityPanel({
  owner,
  subaccountName,
}: {
  owner: string | undefined;
  subaccountName: string;
}) {
  const history = useMatchHistory(owner, subaccountName, 6);
  const symbolMap = useSymbolMap();

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),inset_0_-1px_0_0_rgba(0,0,0,0.2),0_16px_32px_-18px_rgba(0,0,0,0.7)]">
      <h2 className="text-sm font-semibold text-foreground">History</h2>

      {history.isLoading && (
        <div className="mt-4 flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      )}
      {history.isError && (
        <p className="mt-4 text-sm text-negative">{history.error instanceof Error ? history.error.message : "Failed to load."}</p>
      )}
      {history.data && history.data.length === 0 && (
        <p className="mt-4 text-sm text-foreground-muted">No fills yet on this subaccount.</p>
      )}

      {history.data && history.data.length > 0 && (
        <div className="mt-3 flex flex-col divide-y divide-border">
          {history.data.map((fill) => {
            const isBuy = fill.baseFilled.gt(0);
            const size = removeDecimals(fill.baseFilled.abs(), 18);
            const price = fill.baseFilled.isZero() ? fill.quoteFilled.abs() : fill.quoteFilled.abs().div(fill.baseFilled.abs());
            const symbol = symbolMap[fill.productId];
            return (
              <div key={`${fill.digest}-${fill.submissionIndex}`} className="flex items-center justify-between py-2.5 text-sm">
                <span className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-raised">
                    {symbol ? <TokenIcon symbol={symbol} size={18} /> : null}
                  </span>
                  <span className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {isBuy ? "Buy" : "Sell"} {symbol ?? `#${fill.productId}`}
                    </span>
                    <span className="text-xs text-foreground-muted">{formatRelativeTime(fill.timestamp.toNumber())}</span>
                  </span>
                </span>
                <span className={`text-right text-xs ${isBuy ? "text-positive" : "text-negative"}`}>
                  {isBuy ? "+" : "-"}
                  {formatAmount(size, 4)}
                  <div className="text-foreground-muted">{formatUsd(price)}</div>
                </span>
              </div>
            );
          })}
        </div>
      )}

      <Link
        href="/dashboard/history"
        className="mt-4 block rounded-full border border-border py-2 text-center text-sm font-medium text-foreground-muted transition hover:text-foreground"
      >
        See all
      </Link>
    </div>
  );
}
