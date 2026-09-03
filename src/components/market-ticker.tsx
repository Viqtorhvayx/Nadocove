"use client";

import { PairIcon } from "@/components/token-icon";
import { formatUsd, formatPercent } from "@/lib/format";
import { useMarketTicker, type TickerEntry } from "@/lib/use-market-ticker";

function TickerPill({ entry }: { entry: TickerEntry }) {
  const up = entry.changePct.gte(0);
  return (
    <div className="flex shrink-0 items-center gap-2.5 rounded-full border border-border bg-surface px-4 py-2">
      <PairIcon symbol={entry.symbol} size={20} />
      <span className="text-sm font-semibold text-foreground">{entry.symbol}</span>
      <span className="text-sm text-foreground-muted">{formatUsd(entry.price)}</span>
      <span className={`text-sm font-medium ${up ? "text-positive" : "text-negative"}`}>
        {up ? "+" : ""}
        {formatPercent(entry.changePct)}
      </span>
    </div>
  );
}

/**
 * A real, live-updating strip of Nado market prices — the landing page's
 * "this thing is alive" moment, same job as an activity ticker on other
 * product sites, but genuine data instead of staged animation. Scrolls via
 * a duplicated track + CSS keyframe so it loops seamlessly; pauses on
 * hover so a symbol can actually be read.
 */
export function MarketTicker() {
  const ticker = useMarketTicker();
  const entries = ticker.data ?? [];

  if (entries.length === 0) return null;

  return (
    <div
      aria-hidden={false}
      className="relative w-full overflow-hidden border-y border-border bg-surface/40 py-3"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
      }}
    >
      <div className="marquee-track flex w-max gap-3">
        {[...entries, ...entries].map((entry, i) => (
          <TickerPill key={`${entry.symbol}-${i}`} entry={entry} />
        ))}
      </div>
    </div>
  );
}
