import { removeDecimals, isPerpBalance, type HealthStatusByType } from "@nadohq/shared";
import type { GetEngineSubaccountSummaryResponse } from "@nadohq/engine-client";

/**
 * The SDK's mapSubaccountSummary (mapSubaccountSummaryState in
 * @nadohq/engine-client's queryDataMappers.js) maps balance.amount,
 * perp vQuoteBalance, per-balance healthContributions, and every
 * health.{initial,maintenance,unweighted}.{health,assets,liabilities}
 * field with plain toBigNumber() instead of removeDecimals() — leaving
 * them as raw 18-decimal integers, unlike oraclePrice and the other
 * product fields on the same balance object, which the mapper does scale.
 * calcSpotBalanceValue/calcPerpBalanceValue (also from the SDK) then
 * multiply that raw amount directly by the correctly-scaled oraclePrice,
 * producing "totals" ~1e18x too large.
 *
 * Confirmed live against a real leaderboard address: a raw balance.amount
 * of "8214628929382270507022" is $8,214.63 once divided by 1e18, not
 * 8.2 sextillion. Rescaled here so every consumer of getSubaccountSummary
 * gets correct values without needing to know about the SDK bug — the
 * same pattern used for the NLP snapshot mapper bug (see use-nlp-pool.ts).
 */
export function rescaleSubaccountSummary(
  summary: GetEngineSubaccountSummaryResponse,
): GetEngineSubaccountSummaryResponse {
  return {
    ...summary,
    ...rescaleSummaryState(summary),
    preState: summary.preState ? rescaleSummaryState(summary.preState) : undefined,
  };
}

function rescaleSummaryState<T extends Pick<GetEngineSubaccountSummaryResponse, "balances" | "health">>(
  state: T,
): Pick<GetEngineSubaccountSummaryResponse, "balances" | "health"> {
  return {
    balances: state.balances.map((balance) => ({
      ...balance,
      amount: removeDecimals(balance.amount, 18),
      healthContributions: {
        initial: removeDecimals(balance.healthContributions.initial, 18),
        maintenance: removeDecimals(balance.healthContributions.maintenance, 18),
        unweighted: removeDecimals(balance.healthContributions.unweighted, 18),
      },
      ...(isPerpBalance(balance) ? { vQuoteBalance: removeDecimals(balance.vQuoteBalance, 18) } : {}),
    })),
    health: Object.fromEntries(
      Object.entries(state.health).map(([key, status]) => [
        key,
        {
          health: removeDecimals(status.health, 18),
          assets: removeDecimals(status.assets, 18),
          liabilities: removeDecimals(status.liabilities, 18),
        },
      ]),
    ) as HealthStatusByType,
  };
}
