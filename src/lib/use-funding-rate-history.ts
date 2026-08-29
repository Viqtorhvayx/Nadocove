import { useQuery } from "@tanstack/react-query";
import { readOnlyNadoClient } from "@/lib/nado-read-client";

/**
 * Real hourly funding-rate ticks (fundingRateFrac, 1 = 100%) for a market —
 * the header only shows the current rate, this is its trend over time.
 */
export function useFundingRateHistory(productId: number | undefined, limit = 72) {
  return useQuery({
    queryKey: ["funding-rate-history", productId, limit],
    queryFn: () =>
      readOnlyNadoClient.context.indexerClient.getFundingRateHistory({
        productId: productId!,
        limit,
      }),
    enabled: productId !== undefined,
    refetchInterval: 60_000,
  });
}
