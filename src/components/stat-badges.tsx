"use client";

import { useTradableMarketSymbols } from "@/lib/use-tradable-market-symbols";

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-full border border-border bg-surface px-4 py-2">
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
      <Stat value={marketCount > 0 ? `${marketCount}` : "—"} label="tradable markets" />
      <Stat label="you hold the keys" value="Non-custodial" />
      <Stat label="settles on Nado's orderbook" value="Built on Ink" />
    </div>
  );
}
