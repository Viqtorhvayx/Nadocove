"use client";

import { useAccount } from "wagmi";
import { Card } from "@/components/card";
import { Identity } from "@/components/identity";
import { useFollowingList, useUnfollow } from "@/lib/use-follow";
import { useIsSignedIn } from "@/lib/use-auth";

/**
 * Real, server-backed, visible to anyone who looks at your profile —
 * the opposite of the local Watchlist below. Requires being signed in
 * (not just wallet-connected) since it's your own follow list.
 */
export function FollowingPanel() {
  const { address } = useAccount();
  const isSignedIn = useIsSignedIn();
  const following = useFollowingList(isSignedIn ? address : undefined);
  const unfollow = useUnfollow();

  return (
    <Card title="Following" note="public — visible on your profile">
      <p className="mb-4 text-sm text-foreground-muted">
        Traders you follow. Unlike the watchlist below, this is real and
        visible to anyone — your follower count shows up on their profile
        too.
      </p>

      {!isSignedIn && (
        <p className="text-sm text-foreground-muted">
          Sign in from Settings to see and manage who you follow.
        </p>
      )}

      {isSignedIn && following.data && following.data.length === 0 && (
        <p className="text-sm text-foreground-muted">
          Not following anyone yet — follow a trader from their profile.
        </p>
      )}

      {isSignedIn && following.data && following.data.length > 0 && (
        <div className="flex flex-col divide-y divide-border">
          {following.data.map((addr) => (
            <div
              key={addr}
              className="flex items-center justify-between py-2.5 text-sm first:pt-0 last:pb-0"
            >
              <a href={`/u/${addr}`} className="font-mono text-foreground hover:text-cove-indigo">
                <Identity address={addr} />
              </a>
              <button
                type="button"
                onClick={() => unfollow.mutate(addr)}
                disabled={unfollow.isPending}
                className="text-xs text-foreground-muted hover:text-negative disabled:opacity-50"
              >
                Unfollow
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
