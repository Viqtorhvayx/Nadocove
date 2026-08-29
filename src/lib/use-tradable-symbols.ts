import { useQuery } from "@tanstack/react-query";
import { readOnlyNadoClient } from "@/lib/nado-read-client";

/**
 * Real per-market trading status, keyed by productId — the engine's plain
 * getSymbols() (what useSymbols() returns) doesn't expose this field at
 * all, so "is this market actually tradable right now" isn't answerable
 * from that response alone. The indexer's v2 symbols endpoint carries the
 * same product list plus tradingStatus ('live' | 'post_only' |
 * 'reduce_only' | 'soft_reduce_only' | 'not_tradable').
 */
export function useTradableSymbols() {
  return useQuery({
    queryKey: ["tradable-symbols"],
    queryFn: async () => {
      const symbols = await readOnlyNadoClient.context.indexerClient.getV2Symbols({});
      const statusByProductId: Record<number, string> = {};
      for (const s of Object.values(symbols)) {
        statusByProductId[s.productId] = s.tradingStatus;
      }
      return statusByProductId;
    },
    staleTime: 60_000,
  });
}
