import { useQuery } from "@tanstack/react-query";
import { removeDecimals } from "@nadohq/shared";
import { readOnlyNadoClient } from "@/lib/nado-read-client";

/**
 * Real daily snapshots of Nado's own liquidity pool (NLP) — the vault
 * traders' counterparty PnL flows through, verified live against the
 * indexer (getNlpSnapshots). Public/platform-wide, not per-user.
 *
 * The SDK's own mapIndexerNlpSnapshot is inconsistent: it applies
 * removeDecimals() to oraclePrice but not to tvl/cumulativePnl/
 * cumulativeVolume/cumulativeMintAmountQuote/cumulativeBurnAmountQuote,
 * which are raw 18-decimal integers just like oraclePrice's raw source —
 * confirmed against a live response (tvl "7986065074509762785367764" is
 * ~$7.99M once divided by 1e18, not ~$8 quintillion). Re-scaled here so
 * every consumer of this hook gets correct values without needing to know
 * about the bug.
 */
export function useNlpPool(days = 30) {
  return useQuery({
    queryKey: ["nlp-pool", days],
    queryFn: () =>
      readOnlyNadoClient.context.indexerClient.getNlpSnapshots({
        granularity: 86_400,
        limit: days,
      }),
    select: (data) =>
      [...data.snapshots]
        .sort((a, b) => (a.timestamp.comparedTo(b.timestamp) ?? 0))
        .map((s) => ({
          ...s,
          tvl: removeDecimals(s.tvl, 18),
          cumulativePnl: removeDecimals(s.cumulativePnl, 18),
          cumulativeVolume: removeDecimals(s.cumulativeVolume, 18),
          cumulativeMintAmountQuote: removeDecimals(s.cumulativeMintAmountQuote, 18),
          cumulativeBurnAmountQuote: removeDecimals(s.cumulativeBurnAmountQuote, 18),
        })),
    staleTime: 5 * 60_000,
  });
}
