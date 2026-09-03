import { resolveIconTicker, hasTokenIcon, iconFormatFor, fallbackColorFor } from "@/lib/token-icon";

type TokenIconProps = {
  symbol: string;
  size?: number;
  className?: string;
};

/**
 * A real logo when we have one (majors + established DeFi tokens, see
 * public/tokens/), otherwise a colored initials badge — not a fake logo,
 * an honest placeholder. Nado also lists tokenized stocks (AAPL-PERP and
 * similar), which fall into this fallback since they're not crypto assets.
 */
export function TokenIcon({ symbol, size = 20, className }: TokenIconProps) {
  const ticker = resolveIconTicker(symbol);

  if (hasTokenIcon(symbol)) {
    return (
      <img
        src={`/tokens/${ticker}.${iconFormatFor(symbol)}`}
        alt=""
        width={size}
        height={size}
        className={`shrink-0 rounded-full ${className ?? ""}`}
      />
    );
  }

  // Tickers longer than 2 chars (mostly the tokenized-stock symbols, e.g.
  // AAPL, TSLA) read better with the full symbol than a 2-letter initial —
  // it's already the thing people recognize, unlike a crypto contract ticker.
  const initials = ticker.length > 2 ? ticker.slice(0, 4).toUpperCase() : ticker.toUpperCase();
  const fontSize = initials.length > 3 ? size * 0.3 : size * 0.42;
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, backgroundColor: fallbackColorFor(ticker), fontSize }}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold leading-none text-background ${className ?? ""}`}
    >
      {initials}
    </span>
  );
}

/**
 * Every market on Nado — perp or spot — settles against the same single
 * quote asset, USD₮0 (see QUOTE_ASSET_SYMBOL in lib/format.ts). This shows
 * that at a glance the way Hyperliquid-style pair badges do: the base
 * asset's icon with USD₮0's mark overlapping its bottom-right corner,
 * rather than just the base icon alone reading as if it traded in
 * isolation. Use this wherever an icon represents a tradable market
 * (headers, search rows, positions, fills, fee schedules) — plain
 * TokenIcon is still correct for an actual wallet/spot balance, which
 * isn't "paired" with anything, just held.
 */
export function PairIcon({ symbol, size = 20, className }: TokenIconProps) {
  const quoteSize = Math.round(size * 0.58);
  const ringWidth = Math.max(1.5, size * 0.07);
  return (
    <span
      className={`relative inline-block shrink-0 ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <TokenIcon symbol={symbol} size={size} />
      <span
        className="absolute rounded-full bg-background"
        style={{
          width: quoteSize + ringWidth * 2,
          height: quoteSize + ringWidth * 2,
          right: -ringWidth,
          bottom: -ringWidth,
        }}
      >
        <img
          src="/tokens/usdt0.svg"
          alt=""
          width={quoteSize}
          height={quoteSize}
          className="absolute rounded-full"
          style={{ left: ringWidth, top: ringWidth }}
        />
      </span>
    </span>
  );
}
