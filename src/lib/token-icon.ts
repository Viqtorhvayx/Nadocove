/**
 * Base tickers we have a real logo for, in public/tokens/{ticker}.svg —
 * curated against Nado's actual live market list (pulled from a real
 * getSymbols() response), not a generic top-N crypto list. Nado also
 * lists tokenized stocks, FX pairs, and commodities (AAPL-PERP,
 * EURUSD-PERP, XAG-PERP, ...) and a long tail of newer/smaller tokens no
 * icon set covers yet — those fall back to the initials badge below
 * rather than showing a wrong or unrelated logo.
 */
export const AVAILABLE_TOKEN_ICONS = new Set([
  "btc", "eth", "sol", "xrp", "usdc", "bnb", "doge", "ada", "avax", "link",
  "ltc", "uni", "aave", "arb", "sui", "jup", "near", "bch", "xmr", "zec",
  "axs", "tao", "pepe", "lit", "ton", "xaut",
  // Tokenized-stock tickers Nado lists that have a real, recognizable company
  // mark (from simple-icons) — badge-style, brand-colored circle + logotype.
  // Anything not in this set (AMZN, HIMS, LLY, MRVL, MSFT, MU, NBIS, ORCL,
  // SNDK, QQQ, SPY, ...) has no widely available brand SVG and falls back to
  // the initials badge below rather than a made-up mark.
  "aapl", "amd", "avgo", "dell", "googl", "intc", "meta", "mstr", "nvda",
  "spcx", "tsla", "crcl",
]);

/** Wrapped/synthetic variants that should visually use their underlying asset's logo. */
const ALIASES: Record<string, string> = {
  weth: "eth",
  wbtc: "btc",
  kbtc: "btc",
  kbonk: "bonk",
  kpepe: "pepe",
  // XAUT0 is XAUT (Tether Gold) bridged as a LayerZero OFT — same asset.
  xaut0: "xaut",
  // Wrapped tokenized-stock spot assets (wAAPLx, wTSLAx, ...) -> same
  // company mark as the -PERP market for that stock.
  waaplx: "aapl",
  wgooglx: "googl",
  wmetax: "meta",
  wnvdax: "nvda",
  wtslax: "tsla",
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
