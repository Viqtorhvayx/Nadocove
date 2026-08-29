"use client";

import BigNumber from "bignumber.js";
import type { EngineSymbol } from "@nadohq/engine-client";
import { TokenIcon } from "@/components/token-icon";
import { formatUsd, formatPercent } from "@/lib/format";
import { maxLeverageFor } from "@/lib/market-leverage";
import type { MarketOverviewEntry } from "@/lib/use-market-overview";
import { usePerpPrices } from "@/lib/use-perp-prices";

function Stat({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-foreground-muted">{label}</span>
      <span className={`text-sm font-medium tabular-nums ${valueClassName ?? "text-foreground"}`}>{value}</span>
    </div>
  );
}

type MarketHeaderProps = {
  symbol: EngineSymbol | undefined;
  overview: MarketOverviewEntry | undefined;
  onOpenSearch: () => void;
};

/**
 * The market identity + stats strip that sits above the chart — real Mark
 * and Oracle prices (getMultiProductPerpPrices), real 24h change/volume
 * (getV2Tickers), real open interest (the latest market snapshot), and a
 * real funding rate. No countdown timer next to funding: Nado's docs
 * describe it as a 24h rate rather than an 8h/1h settlement cycle like
 * some other venues, and there's nothing in the SDK confirming a specific
 * next-settlement time to show honestly.
 */
export function MarketHeader({ symbol, overview, onOpenSearch }: MarketHeaderProps) {
  const perpPrices = usePerpPrices(symbol?.productId);
  const maxLeverage = maxLeverageFor(symbol);
  const changePct = overview ? overview.priceChangePercent24h / 100 : undefined;
  const up = changePct !== undefined && changePct >= 0;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={onOpenSearch}
        className="flex items-center gap-2.5 rounded-xl px-2 py-1 text-left transition hover:bg-surface-raised"
      >
        {symbol && <TokenIcon symbol={symbol.symbol} size={28} />}
        <span className="text-lg font-semibold text-foreground">{symbol?.symbol ?? "Select market"}</span>
        {maxLeverage !== undefined && (
          <span className="rounded-full border border-border bg-surface-raised px-2 py-0.5 text-[11px] font-medium text-foreground-muted">
            Up to {maxLeverage}x
          </span>
        )}
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-foreground-muted">
          <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="flex flex-wrap gap-x-6 gap-y-3 px-2">
        <Stat label="Mark" value={perpPrices.data ? formatUsd(perpPrices.data.markPrice) : "—"} />
        <Stat label="Oracle" value={perpPrices.data ? formatUsd(perpPrices.data.indexPrice) : "—"} />
        <Stat
          label="24h Change"
          value={changePct !== undefined ? `${up ? "+" : ""}${formatPercent(new BigNumber(changePct))}` : "—"}
          valueClassName={changePct === undefined ? undefined : up ? "text-positive" : "text-negative"}
        />
        <Stat
          label="24h Volume"
          value={overview ? formatUsd(new BigNumber(overview.quoteVolume24h), true) : "—"}
        />
        <Stat
          label="Open Interest"
          value={overview?.openInterestQuote ? formatUsd(overview.openInterestQuote, true) : "—"}
        />
        <Stat
          label="Funding"
          value={overview?.fundingRate ? formatPercent(overview.fundingRate, 4) : "—"}
          valueClassName={
            overview?.fundingRate ? (overview.fundingRate.gte(0) ? "text-positive" : "text-negative") : undefined
          }
        />
      </div>
    </div>
  );
}
