"use client";

import type { ReactNode } from "react";
import { useTradableMarketSymbols } from "@/lib/use-tradable-market-symbols";

function StatIcon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-cove-amber">
      <path d={path} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Stat({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-full border border-border bg-surface px-4 py-2">
      {icon}
      <span className="text-sm font-semibold text-foreground">{value}</span>
      <span className="text-xs text-foreground-muted">{label}</span>
    </div>
  );
}

/**
 * Honest stat badges — no invented vanity metrics (NadoCove is new and has
 * no user base to brag about yet). The market count is real, pulled live
 * and filtered the same way the Trade page's own picker is (not_tradable
 * markets and the KBTC/BTC-PERP duplicate excluded), so this number always
 * agrees with what's actually selectable there. The other two badges are
 * true architectural facts, not marketing claims.
 */
export function StatBadges() {
  const tradableSymbols = useTradableMarketSymbols();
  const marketCount = tradableSymbols.length;

  return (
    <div className="flex flex-wrap gap-2.5">
      <Stat
        icon={<StatIcon path="M3 8.5h14M3 12.5h14M7 4.5v11M13 4.5v11" />}
        value={marketCount > 0 ? `${marketCount}` : "—"}
        label="tradable markets"
      />
      <Stat
        icon={<StatIcon path="M10 2.5 4 5v5c0 4 2.5 6.5 6 7.5 3.5-1 6-3.5 6-7.5V5l-6-2.5Z" />}
        label="you hold the keys"
        value="Non-custodial"
      />
      <Stat
        icon={<StatIcon path="M8 6.5H6a3 3 0 1 0 0 6h2m4-6h2a3 3 0 1 1 0 6h-2M7 9.5h6" />}
        label="settles on Nado's orderbook"
        value="Built on Ink"
      />
    </div>
  );
}
