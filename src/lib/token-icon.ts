/** Base tickers we have a real logo for, in public/tokens/{ticker}.svg. */
export const AVAILABLE_TOKEN_ICONS = new Set([
  "btc", "eth", "sol", "xrp", "usdc", "usdt", "bnb", "doge", "ada", "avax",
  "dot", "link", "ltc", "matic", "trx", "atom", "uni", "aave", "mkr", "comp",
  "grt", "snx", "crv", "algo",
]);

/** Wrapped/synthetic variants that should visually use their underlying asset's logo. */
const ALIASES: Record<string, string> = {
  weth: "eth",
  wbtc: "btc",
  kbtc: "btc",
};

/**
 * "BTC-PERP" / "kBTC" / "WETH" -> "btc" / "btc" / "eth" — the base ticker
 * our icon set is keyed by. Strips Nado's "-PERP"/"-SPOT" market suffixes
 * and normalizes known wrapped-asset prefixes to their underlying icon.
 */
export function resolveIconTicker(symbol: string): string {
  const base = symbol.split("-")[0].toLowerCase();
  return ALIASES[base] ?? base;
}

export function hasTokenIcon(symbol: string): boolean {
  return AVAILABLE_TOKEN_ICONS.has(resolveIconTicker(symbol));
}

/** Deterministic color for the fallback initials badge, so it's not always the same hue. */
const FALLBACK_COLORS = [
  "#4C6EF5", "#F5B942", "#34D399", "#F87171", "#A78BFA", "#22D3EE", "#FB923C",
];

export function fallbackColorFor(symbol: string): string {
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) hash = (hash * 31 + symbol.charCodeAt(i)) >>> 0;
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
}
