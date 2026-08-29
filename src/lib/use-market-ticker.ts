import { useQuery } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import { readOnlyNadoClient } from "@/lib/nado-read-client";

/** A curated cross-section (majors + a couple of tokenized stocks) so the
 * landing-page ticker reads as a snapshot of the whole market, not a random
 * sample — falls back gracefully if any of these aren't live. */
const TICKER_SYMBOLS = [
  "BTC-PERP",
  "ETH-PERP",
  "SOL-PERP",
  "AAPL-PERP",
  "TSLA-PERP",
  "NVDA-PERP",
  "XRP-PERP",
  "AVAX-PERP",
];

export type TickerEntry = {
  symbol: string;
  price: BigNumber;
  changePct: BigNumber;
  /** Sorted 1h candle closes for the same window changePct is computed
   * from — kept around so anything wanting a little trend line (the hero
   * mockup) can reuse this one fetch instead of firing its own per symbol. */
  closes: BigNumber[];
};

/**
 * Real prices for the landing page's live ticker strip and hero chart — no
 * synthesized numbers. Price is the latest 1h candle's close; changePct
 * compares it to the close ~24 candles back (~24h ago) for an approximate
 * 24h change, the same math a "24h change" figure anywhere else would use.
 */
export function useMarketTicker() {
  return useQuery({
    queryKey: ["market-ticker"],
    queryFn: async (): Promise<TickerEntry[]> => {
      const symbolsResp = await readOnlyNadoClient.market.getSymbols();
      const bySymbol = Object.values(symbolsResp.symbols ?? {});
      const matches = TICKER_SYMBOLS.map((sym) => bySymbol.find((s) => s.symbol === sym)).filter(
        (s): s is NonNullable<typeof s> => s !== undefined,
      );

      const entries = await Promise.all(
        matches.map(async (s): Promise<TickerEntry | null> => {
          const candles = await readOnlyNadoClient.market.getCandlesticks({
            productId: s.productId,
            period: 3600,
            limit: 25,
          });
          const sorted = [...candles].sort((a, b) => a.time.minus(b.time).toNumber());
          if (sorted.length === 0) return null;
          const latest = sorted[sorted.length - 1];
          const earliest = sorted[0];
          const changePct = earliest.close.gt(0)
            ? latest.close.minus(earliest.close).div(earliest.close)
            : new BigNumber(0);
          return { symbol: s.symbol, price: latest.close, changePct, closes: sorted.map((c) => c.close) };
        }),
      );

      return entries.filter((e): e is TickerEntry => e !== null);
    },
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}
