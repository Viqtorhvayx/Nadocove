"use client";

import { WatchlistPanel } from "@/components/watchlist-panel";
import { FollowingPanel } from "@/components/following-panel";

export default function WatchlistTab() {
  return (
    <>
      <FollowingPanel />
      <WatchlistPanel />
    </>
  );
}
