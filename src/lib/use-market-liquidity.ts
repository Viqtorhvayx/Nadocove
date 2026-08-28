import { useQuery } from "@tanstack/react-query";
import { readOnlyNadoClient } from "@/lib/nado-read-client";

/**
 * Real order book depth from the engine — per-price-tick bids/asks, not
 * synthesized. The engine skips empty price levels, so ticks aren't
 * guaranteed evenly spaced.
 */
export function useMarketLiquidity(productId: number | undefined, depth = 12) {
  return useQuery({
    queryKey: ["market-liquidity", productId, depth],
    queryFn: () =>
      readOnlyNadoClient.market.getMarketLiquidity({ productId: productId!, depth }),
    enabled: productId !== undefined,
    refetchInterval: 3_000,
  });
}
