import { useQuery } from "@tanstack/react-query";
import { readOnlyNadoClient } from "@/lib/nado-read-client";

/** Real mark + oracle/index price for one market — refetched often since
 * this is the number a trader is actually watching while a market is open
 * in the header. */
export function usePerpPrices(productId: number | undefined) {
  return useQuery({
    queryKey: ["perp-prices", productId],
    queryFn: () =>
      readOnlyNadoClient.context.indexerClient.getMultiProductPerpPrices({
        productIds: [productId!],
      }),
    select: (data) => (productId !== undefined ? data[productId] : undefined),
    enabled: productId !== undefined,
    refetchInterval: 5_000,
  });
}
