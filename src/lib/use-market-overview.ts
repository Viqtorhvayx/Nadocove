import { useQuery } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import { removeDecimals } from "@nadohq/shared";
import { readOnlyNadoClient } from "@/lib/nado-read-client";

export type MarketOverviewEntry = {
  lastPrice: number;
  priceChangePercent24h: number;
  quoteVolume24h: number;
  fundingRate: BigNumber | undefined;
  openInterestQuote: BigNumber | undefined;
};

/**
 * One combined fetch for everything the market header, the market-search
 * table, and the market list need beyond the static symbol metadata:
 * last price / 24h change / 24h volume (getV2Tickers), funding rate
 * (getMultiProductFundingRates), and open interest (the latest platform
 * snapshot's openInterestsQuote — snapshots cover every product per call,
 * so limit:1 gets the current figure for all of them at once). All three
 * calls are public/account-independent, keyed by productId.
 */
export function useMarketOverview(productIds: number[]) {
  const key = [...productIds].sort((a, b) => a - b).join(",");
  return useQuery({
    queryKey: ["market-overview", key],
    queryFn: async (): Promise<Record<number, MarketOverviewEntry>> => {
      const indexer = readOnlyNadoClient.context.indexerClient;
      const [tickers, fundingRates, snapshots] = await Promise.all([
        indexer.getV2Tickers({}),
        indexer.getMultiProductFundingRates({ productIds }),
        indexer.getMarketSnapshots({ granularity: 3600, limit: 1 }),
      ]);

      const latestSnapshot = snapshots[snapshots.length - 1];
      const result: Record<number, MarketOverviewEntry> = {};
      for (const ticker of Object.values(tickers)) {
        // openInterestsQuote is a raw 18-decimal indexer amount, same class
        // of field as match-event baseFilled/quoteFilled — needs
        // removeDecimals, unlike engine price/balance fields which already
        // come back human-readable.
        const rawOi = latestSnapshot?.openInterestsQuote[ticker.productId];
        result[ticker.productId] = {
          lastPrice: ticker.lastPrice,
          priceChangePercent24h: ticker.priceChangePercent24h,
          quoteVolume24h: ticker.quoteVolume,
          fundingRate: fundingRates[ticker.productId]?.fundingRate,
          openInterestQuote: rawOi ? removeDecimals(rawOi, 18) : undefined,
        };
      }
      return result;
    },
    enabled: productIds.length > 0,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}
