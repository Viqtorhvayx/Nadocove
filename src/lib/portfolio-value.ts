import BigNumber from "bignumber.js";
import { ProductEngineType, calcPerpBalanceValue, calcSpotBalanceValue } from "@nadohq/shared";
import type { GetEngineSubaccountSummaryResponse } from "@nadohq/engine-client";

/** Total real portfolio value across every non-zero balance — same
 * calculation PortfolioOverviewCard uses internally, extracted so the
 * dashboard header can show the same number without duplicating it. */
export function calcTotalPortfolioValue(summary: GetEngineSubaccountSummaryResponse | undefined): BigNumber | undefined {
  if (!summary?.exists) return undefined;
  let total = new BigNumber(0);
  for (const balance of summary.balances) {
    if (balance.amount.isZero()) continue;
    total = total.plus(balance.type === ProductEngineType.SPOT ? calcSpotBalanceValue(balance) : calcPerpBalanceValue(balance));
  }
  return total;
}
