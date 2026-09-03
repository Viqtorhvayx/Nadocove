import { useMemo } from "react";
import BigNumber from "bignumber.js";
import { useQuery } from "@tanstack/react-query";
import { readOnlyNadoClient } from "@/lib/nado-read-client";

/**
 * Real 24h high/low, derived from the last 24 hourly candles — Nado's v2
 * ticker endpoint (getV2Tickers) doesn't expose a 24h high/low field at
 * all, only last price/volume/change, so this is computed from the same
 * real OHLC data the chart itself draws rather than left out or guessed.
 * A separate fixed-period fetch from what MarketChart uses, since that
 * hook's period follows the user's own timeframe selector.
 */
export function use24hRange(productId: number | undefined) {
  const query = useQuery({
    queryKey: ["24h-range", productId],
    queryFn: () =>
      readOnlyNadoClient.market.getCandlesticks({
        productId: productId!,
        period: 3600,
        limit: 24,
      }),
    enabled: productId !== undefined,
    refetchInterval: 60_000,
  });

  return useMemo(() => {
    const candles = query.data;
    if (!candles || candles.length === 0) return { ...query, high: undefined, low: undefined };
    let high = candles[0].high;
    let low = candles[0].low;
    for (const c of candles) {
      if (c.high.gt(high)) high = c.high;
      if (c.low.lt(low)) low = c.low;
    }
    return { ...query, high: high as BigNumber, low: low as BigNumber };
  }, [query]);
}
