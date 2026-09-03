/**
 * Base tickers we have a real logo for, in public/tokens/{ticker}.{ext} —
 * curated against Nado's actual live market list (pulled from a real
 * getSymbols() response), not a generic top-N crypto list. Nado also
 * lists tokenized stocks, FX pairs, and commodities (AAPL-PERP,
 * EURUSD-PERP, XAG-PERP, ...) and a long tail of newer/smaller tokens no
 * icon set covers yet — those fall back to the initials badge below
 * rather than showing a wrong or unrelated logo.
 *
 * Maps ticker -> file extension rather than a plain Set, since the two
 * icon sources use different formats: the majors/DeFi/stock set below is
 * hand-picked SVGs (cryptocurrency-icons / @web3icons/core / simple-icons),
 * while the newer-token batch was pulled from CoinGecko's own coin images
 * (verified one-by-one by market-cap rank against generic/collision-prone
 * tickers like CHIP, MEGA, SKR, SKY — CoinGecko only ships raster images
 * for these, no SVGs).
 */
export const TOKEN_ICON_FORMATS: Record<string, string> = {
  btc: "svg", eth: "svg", sol: "svg", xrp: "svg", usdc: "svg", bnb: "svg",
  doge: "svg", ada: "svg", avax: "svg", link: "svg", ltc: "svg", uni: "svg",
  aave: "svg", arb: "svg", sui: "svg", jup: "svg", near: "svg", bch: "svg",
  xmr: "svg", zec: "svg", axs: "svg", tao: "svg", pepe: "svg", lit: "svg",
  ton: "svg", xaut: "svg",
  // Tokenized-stock tickers Nado lists that have a real, recognizable company
  // mark (from simple-icons) — badge-style, brand-colored circle + logotype.
  // AMZN, MSFT, ORCL, and SNDK are deliberately NOT here: simple-icons did
  // have entries for Amazon/Microsoft/Oracle/SanDisk at some point, but a
  // CDN was still serving them from a stale cached release — checked against
  // the actual currently-published simple-icons version and all four are
  // gone from it (most likely pulled after a trademark takedown request,
  // which simple-icons has a documented history of doing for exactly this
  // kind of company). Not worth re-adding a mark the source library itself
  // removed, so those four still fall back to the initials badge.
  aapl: "svg", amd: "svg", avgo: "svg", dell: "svg", googl: "svg",
  intc: "svg", meta: "svg", mstr: "svg", nvda: "svg", spcx: "svg",
  tsla: "svg", crcl: "svg",
  // Newer/smaller tokens Nado lists that the original icon sets predate —
  // pulled from CoinGecko, matched by exact ticker + verified against the
  // highest market-cap-rank result to avoid grabbing an unrelated
  // same-ticker project (this matters for short/generic tickers below).
  // Not found on CoinGecko at all: BBX, ZHIPU — those still correctly fall
  // back to the initials badge.
  aster: "png", bera: "png", bonk: "jpg", chip: "png", eigen: "jpg",
  ena: "png", fartcoin: "jpg", hype: "jpg", mega: "jpeg", mon: "png",
  ondo: "png", peng: "png", pengu: "png", pump: "jpg",
  skr: "jpg", sky: "jpg", useless: "png", virtual: "png", vvv: "png",
  wld: "jpeg", wlfi: "png", xpl: "png", zro: "jpeg",
  // Tokenized stocks/ETFs with no real logo in any curated icon set, but
  // CoinGecko indexes them anyway since they trade on-chain as tokenized
  // products (Backpack Securities/Robinhood/Dinari all mint these). Picked
  // the Backpack Securities listing for each — properly branded per-company
  // marks, unlike Dinari's entries which all reuse one generic Dinari badge
  // regardless of the underlying company. Same treatment as SKHY (SK Hynix)
  // below, just not a semiconductor ticker like the rest of that group.
  mrvl: "png", mu: "png", nbis: "png", hims: "png", lly: "png",
  qqq: "png", spy: "png",
  // SKHY is SK Hynix, tokenized via Backpack Securities — a company mark
  // like the AAPL/TSLA set above, not a native crypto token.
  skhy: "png",
};

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
  wqqqx: "qqq",
  wspyx: "spy",
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
  return resolveIconTicker(symbol) in TOKEN_ICON_FORMATS;
}

/** File extension for a ticker's icon — only meaningful when hasTokenIcon() is true. */
export function iconFormatFor(symbol: string): string {
  return TOKEN_ICON_FORMATS[resolveIconTicker(symbol)];
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
