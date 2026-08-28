"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { useFollowingList } from "@/lib/use-follow";
import { useFollowingActivity } from "@/lib/use-following-activity";
import { useActivitySeen } from "@/lib/use-activity-seen";
import { useIsSignedIn } from "@/lib/use-auth";

/**
 * A badge, not a full notification center — clicking takes you to the
 * Watchlist tab where the real activity feed lives, rather than opening
 * a dropdown that duplicates it. Only renders once signed in, since
 * there's nothing to watch (no follow graph) before that.
 */
export function NotificationBell() {
  const { address } = useAccount();
  const isSignedIn = useIsSignedIn();
  const following = useFollowingList(isSignedIn ? address : undefined);
  const activity = useFollowingActivity(following.data);
  const { lastSeen, markSeen } = useActivitySeen();

  if (!isSignedIn) return null;

  const unreadCount =
    activity.data?.filter((fill) => fill.timestamp.toNumber() > lastSeen).length ?? 0;

  return (
    <Link
      href="/dashboard/watchlist"
      onClick={markSeen}
      aria-label={unreadCount > 0 ? `${unreadCount} new activity` : "Activity"}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground-muted transition hover:text-foreground"
    >
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
        <path
          d="M5 8a5 5 0 0 1 10 0c0 3.5 1.25 4.5 1.25 4.5H3.75S5 11.5 5 8Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M8.5 15.5a1.5 1.5 0 0 0 3 0"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-cove-amber px-1 text-[10px] font-bold text-background">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
