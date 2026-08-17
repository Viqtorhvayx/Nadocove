import { useQuery } from "@tanstack/react-query";
import type { IndexerPortfolioPeriod } from "@nadohq/indexer-client";
import { readOnlyNadoClient } from "@/lib/nado-read-client";

export function usePortfolioHistory(
  address: string | undefined,
  subaccountName: string,
) {
  return useQuery({
    queryKey: ["portfolio-history", address, subaccountName],
    queryFn: () =>
      readOnlyNadoClient.context.indexerClient.getPortfolio({
        subaccount: { subaccountOwner: address!, subaccountName },
      }),
    enabled: Boolean(address),
    staleTime: 30_000,
  });
}

export const PERFORMANCE_PERIODS: { period: IndexerPortfolioPeriod; label: string }[] = [
  { period: "day", label: "1D" },
  { period: "week", label: "1W" },
  { period: "month", label: "1M" },
  { period: "allTime", label: "All" },
];
