"use client";

import Link from "next/link";
import { removeDecimals } from "@nadohq/shared";
import { useAccount } from "wagmi";
import { Card } from "@/components/card";
import { Skeleton } from "@/components/skeleton";
import { Identity } from "@/components/identity";
import { TokenIcon } from "@/components/token-icon";
import { formatAmount, formatRelativeTime, formatUsd } from "@/lib/format";
import { useFollowingList } from "@/lib/use-follow";
import { useFollowingActivity } from "@/lib/use-following-activity";
import { useSymbolMap } from "@/lib/use-symbol-map";
import { useIsSignedIn } from "@/lib/use-auth";

export function ActivityFeed() {
  const { address } = useAccount();
  const isSignedIn = useIsSignedIn();
  const following = useFollowingList(isSignedIn ? address : undefined);
  const activity = useFollowingActivity(following.data);
  const symbolMap = useSymbolMap();

  if (!isSignedIn) return null;

  return (
    <Card title="Activity" note="from traders you follow">
      {following.data && following.data.length === 0 && (
        <p className="text-sm text-foreground-muted">
          Follow a trader to see their fills show up here.
        </p>
      )}

      {following.data && following.data.length > 0 && activity.isLoading && (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      )}

      {activity.data && activity.data.length === 0 && (
        <p className="text-sm text-foreground-muted">
          No recent fills from traders you follow.
        </p>
      )}

      {activity.data && activity.data.length > 0 && (
        <div className="flex flex-col divide-y divide-border">
          {[...activity.data]
            .sort((a, b) => b.timestamp.toNumber() - a.timestamp.toNumber())
            .map((fill) => {
              const isBuy = fill.baseFilled.gt(0);
              const symbol = symbolMap[fill.productId] ?? `#${fill.productId}`;
              // baseFilled/quoteFilled are raw 18-decimal fixed-point — a
              // ratio of the two is scale-invariant, so price needs no
              // conversion, but the standalone size below does.
              const price = fill.baseFilled.isZero()
                ? fill.quoteFilled.abs()
                : fill.quoteFilled.abs().div(fill.baseFilled.abs());
              const size = removeDecimals(fill.baseFilled.abs(), 18);
              return (
                <Link
                  key={fill.digest + fill.submissionIndex}
                  href={`/u/${fill.subaccountOwner}`}
                  className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-sm transition hover:bg-surface-raised"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <TokenIcon symbol={symbol} size={18} />
                    <span className="truncate">
                      <Identity address={fill.subaccountOwner} />{" "}
                      <span className={isBuy ? "text-positive" : "text-negative"}>
                        {isBuy ? "bought" : "sold"}
                      </span>{" "}
                      <span className="text-foreground-muted">
                        {formatAmount(size)} {symbol}
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-foreground-muted">{formatUsd(price)}</span>
                    <span className="block text-xs text-foreground-muted">
                      {formatRelativeTime(fill.timestamp.toNumber())}
                    </span>
                  </span>
                </Link>
              );
            })}
        </div>
      )}
    </Card>
  );
}
