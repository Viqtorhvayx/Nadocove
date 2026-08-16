import { useMemo } from "react";
import { useSymbols } from "@/lib/use-subaccount-data";

/** productId -> "BTC-PERP" style symbol, derived from the public symbol list. */
export function useSymbolMap(): Record<number, string> {
  const { data } = useSymbols();

  return useMemo(() => {
    const map: Record<number, string> = {};
    for (const entry of Object.values(data?.symbols ?? {})) {
      map[entry.productId] = entry.symbol;
    }
    return map;
  }, [data]);
}
