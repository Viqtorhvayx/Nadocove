import { useQuery } from "@tanstack/react-query";
import type { GetIndexerPortfolioResponse, IndexerPortfolioPeriod } from "@nadohq/indexer-client";
import { readOnlyNadoClient } from "@/lib/nado-read-client";

const PORTFOLIO_HISTORY_PERIODS: IndexerPortfolioPeriod[] = [
  "day",
  "week",
  "month",
  "allTime",
  "perpDay",
  "perpWeek",
  "perpMonth",
  "perpAllTime",
];

function emptyPortfolioHistory(): GetIndexerPortfolioResponse {
  return PORTFOLIO_HISTORY_PERIODS.reduce((acc, period) => {
    acc[period] = { accountValueHistory: [], pnlHistory: [], volumeHistory: [], tradeSizeHistory: [], marketCountHistory: [] };
    return acc;
  }, {} as GetIndexerPortfolioResponse);
}

/**
 * A subaccount that has never deposited or traded doesn't exist yet on
 * Nado's indexer — confirmed live: querying `portfolio` for a fresh address
 * returns a bare `{"error":"... \"subaccount not found\"","error_code":5000}`
 * instead of an empty-but-valid history. The SDK's failure-envelope check
 * (`isIndexerServerFailureResponse`) only recognizes `{status:"failure",...}`
 * bodies, so this shape falls through to a generic, un-typed
 * "Unexpected response from server: 400" — which every first-time visitor
 * with no activity yet would otherwise see as a scary raw error on their
 * very first look at the app. Treated as "no history yet" instead, since
 * that's what it actually means for the overwhelming majority of subaccounts
 * that hit this; a real outage still surfaces through the balances/positions
 * cards on the same page, which query separately and aren't swallowed here.
 */
export function usePortfolioHistory(
  address: string | undefined,
  subaccountName: string,
) {
  return useQuery({
    queryKey: ["portfolio-history", address, subaccountName],
    queryFn: async () => {
      try {
        return await readOnlyNadoClient.context.indexerClient.getPortfolio({
          subaccount: { subaccountOwner: address!, subaccountName },
        });
      } catch {
        return emptyPortfolioHistory();
      }
    },
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
