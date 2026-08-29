import type BigNumber from "bignumber.js";

/**
 * Balance/health/price fields returned by the engine (Balance.amount,
 * oraclePrice, HealthStatus.*, and the calcXBalanceValue helpers) are
 * BigNumber instances already in human-readable quote/asset units, not raw
 * fixed-point integers — confirmed by inspecting real responses (e.g. BTC's
 * oraclePrice reads as "63165.40...", not an 18-decimal-scaled integer; ratio
 * fields like longWeightInitial read as "1" = 100%, not 1e18). No
 * removeDecimals() conversion needed for these.
 */

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const compactUsdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

export function formatUsd(value: BigNumber, compact = false): string {
  const num = value.toNumber();
  return compact ? compactUsdFormatter.format(num) : usdFormatter.format(num);
}

export function formatSignedUsd(value: BigNumber): string {
  const sign = value.gt(0) ? "+" : "";
  return `${sign}${formatUsd(value)}`;
}

export function formatAmount(value: BigNumber, maxDecimals = 6): string {
  return value.toFormat(Math.min(maxDecimals, value.decimalPlaces() ?? 0));
}

export function formatPercent(value: BigNumber, decimals = 1): string {
  return `${value.times(100).toFormat(decimals)}%`;
}

export function pnlColorClass(value: BigNumber): string {
  if (value.gt(0)) return "text-positive";
  if (value.lt(0)) return "text-negative";
  return "text-foreground-muted";
}

export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

/**
 * Nado's raw perp ticker ("BTC-PERP") doesn't show what it's actually
 * margined/settled in. Every perp on Nado settles in the exchange's single
 * quote asset, productId 0 — its real on-chain ERC20 symbol (read live via
 * getTokenContractForProduct + symbol()) is "USD₮0", not USDC. Displaying
 * it as "BTC / USD₮0" is accurate, not just prettier. Non-perp symbols
 * pass through unchanged.
 */
export const QUOTE_ASSET_SYMBOL = "USD₮0";

export function formatMarketPair(symbol: string): string {
  return symbol.endsWith("-PERP") ? `${symbol.slice(0, -"-PERP".length)} / ${QUOTE_ASSET_SYMBOL}` : symbol;
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
];
const relativeFormatter = new Intl.RelativeTimeFormat("en", { style: "narrow" });

/** Unix seconds -> "2m ago" / "3h ago" / "just now". */
export function formatRelativeTime(unixSeconds: number): string {
  const diffSeconds = Math.round(Date.now() / 1000 - unixSeconds);
  if (diffSeconds < 30) return "just now";
  for (const [unit, secondsInUnit] of RELATIVE_UNITS) {
    if (diffSeconds >= secondsInUnit) {
      return relativeFormatter.format(-Math.floor(diffSeconds / secondsInUnit), unit);
    }
  }
  return relativeFormatter.format(-Math.floor(diffSeconds / 60), "minute");
}
