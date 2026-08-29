import { useQuery } from "@tanstack/react-query";
import { readOnlyNadoClient } from "@/lib/nado-read-client";

/**
 * The market's real recent-trades tape — getMatchEvents with no
 * `subaccounts` filter returns fills across every trader on this product,
 * not one account's history, so this is genuinely public market activity
 * (same data class as an exchange's public trade feed).
 */
export function useRecentTrades(productId: number | undefined, limit = 40) {
  return useQuery({
    queryKey: ["recent-trades", productId, limit],
    queryFn: () =>
      readOnlyNadoClient.context.indexerClient.getMatchEvents({
        productIds: [productId!],
        limit,
      }),
    enabled: productId !== undefined,
    refetchInterval: 5_000,
  });
}
