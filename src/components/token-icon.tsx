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

  const initials = ticker.slice(0, 2).toUpperCase();
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, backgroundColor: fallbackColorFor(ticker) }}
      className={`inline-flex shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-background ${className ?? ""}`}
    >
      {initials}
    </span>
  );
}
