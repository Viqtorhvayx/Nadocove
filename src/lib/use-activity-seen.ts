"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "nadocove:activity-last-seen";

function readLastSeen(): number {
  if (typeof window === "undefined") return 0;
  try {
    return Number(localStorage.getItem(STORAGE_KEY)) || 0;
  } catch {
    // Private browsing / storage blocked — treat everything as unseen
    // rather than throwing.
    return 0;
  }
}

/**
 * Per-device "have I looked at the activity feed" watermark. Local only
 * (like the Watchlist below Following) — nothing worth syncing across
 * devices or exposing to anyone else, unlike the follow graph itself.
 */
export function useActivitySeen() {
  const [lastSeen, setLastSeen] = useState(0);

  useEffect(() => {
    setLastSeen(readLastSeen());
  }, []);

  const markSeen = useCallback(() => {
    const now = Math.floor(Date.now() / 1000);
    try {
      localStorage.setItem(STORAGE_KEY, String(now));
    } catch {
      // ignore — nothing to persist to, just skip the write
    }
    setLastSeen(now);
  }, []);

  return { lastSeen, markSeen };
}
