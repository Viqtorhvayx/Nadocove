"use client";

import { useAccount } from "wagmi";
import { useFollow, useFollowStats, useIsFollowing, useUnfollow } from "@/lib/use-follow";
import { useIsSignedIn } from "@/lib/use-auth";

/**
 * Real, server-backed follow — visible to everyone, distinct from the
 * local-only Watchlist. Requires a signed-in session (a wallet connection
 * alone doesn't prove who's asking).
 */
export function FollowButton({ address }: { address: string }) {
  const { address: viewer } = useAccount();
  const isSignedIn = useIsSignedIn();
  const isFollowing = useIsFollowing(address);
  const follow = useFollow();
  const unfollow = useUnfollow();

  const isSelf = viewer?.toLowerCase() === address.toLowerCase();
  if (isSelf) return null;

  const pending = follow.isPending || unfollow.isPending;

  return (
    <button
      type="button"
      disabled={!isSignedIn || pending}
      title={!isSignedIn ? "Sign in from Settings to follow traders" : undefined}
      onClick={() =>
        isFollowing.data ? unfollow.mutate(address) : follow.mutate(address)
      }
      className={`rounded-full px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${
        isFollowing.data
          ? "btn-tactile-secondary text-foreground-muted transition-colors hover:text-foreground"
          : "btn-tactile-primary text-background"
      }`}
    >
      {pending ? "…" : isFollowing.data ? "Following" : "Follow"}
    </button>
  );
}

export function FollowStats({ address }: { address: string }) {
  const stats = useFollowStats(address);
  return (
    <span className="text-xs text-foreground-muted">
      <span className="font-medium text-foreground">{stats.data?.followers ?? 0}</span> followers
      {" · "}
      <span className="font-medium text-foreground">{stats.data?.following ?? 0}</span> following
    </span>
  );
}
