"use client";

import { ActivityFeed } from "@/components/activity-feed";
import { WatchlistPanel } from "@/components/watchlist-panel";
import { FollowingPanel } from "@/components/following-panel";

export default function WatchlistTab() {
  return (
    <>
      <ActivityFeed />
      <FollowingPanel />
      <WatchlistPanel />
    </>
  );
}
