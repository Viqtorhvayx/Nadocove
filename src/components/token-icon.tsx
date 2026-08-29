import { resolveIconTicker, hasTokenIcon, fallbackColorFor } from "@/lib/token-icon";

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
        src={`/tokens/${ticker}.svg`}
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
