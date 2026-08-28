import { useQuery } from "@tanstack/react-query";
import { readOnlyNadoClient } from "@/lib/nado-read-client";

/** period label -> seconds, matching @nadohq/shared's CandlestickPeriod enum values. */
export const CANDLE_PERIODS = [
  { label: "5m", seconds: 300 },
  { label: "1h", seconds: 3600 },
  { label: "4h", seconds: 14400 },
  { label: "1D", seconds: 86400 },
] as const;

export function useCandlesticks(productId: number | undefined, periodSeconds: number, limit = 100) {
  return useQuery({
    queryKey: ["candlesticks", productId, periodSeconds, limit],
    queryFn: () =>
      readOnlyNadoClient.market.getCandlesticks({
        productId: productId!,
        period: periodSeconds,
        limit,
      }),
    enabled: productId !== undefined,
    refetchInterval: 15_000,
  });
}
