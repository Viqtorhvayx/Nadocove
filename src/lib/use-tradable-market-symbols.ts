import { useMemo } from "react";
import { useSymbols } from "@/lib/use-subaccount-data";
import { useTradableSymbols } from "@/lib/use-tradable-symbols";

/**
 * The real, currently-tradable market list — useSymbols() filtered down
 * the same way the Trade page's market picker is: markets the indexer
 * reports "not_tradable" dropped, and KBTC folded out since it renders
 * identically to BTC-PERP (same underlying exposure, not a second market
 * worth listing separately). Shared so every "how many markets" figure in
 * the app (the Trade picker, the landing page's stat badge, ...) agrees.
 */
export function useTradableMarketSymbols() {
  const symbolsQuery = useSymbols();
  const tradableStatus = useTradableSymbols();

  return useMemo(() => {
    const entries = Object.values(symbolsQuery.data?.symbols ?? {});
    return entries.filter((s) => {
      if (s.symbol === "KBTC") return false;
      const status = tradableStatus.data?.[s.productId];
      if (status === "not_tradable") return false;
      return true;
    });
  }, [symbolsQuery.data, tradableStatus.data]);
}
