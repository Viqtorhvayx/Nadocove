import BigNumber from "bignumber.js";
import { useSubaccountSummary } from "@/lib/use-subaccount-data";

const DANGER_RATIO = 1; // assets/liabilities at or below this = already at maintenance requirement.
const WARNING_RATIO = 1.15; // within a 15% buffer of it.

export type MarginHealthStatus = {
  level: "warning" | "danger";
  ratio: BigNumber;
};

/**
 * Same assets/liabilities ratio PortfolioOverviewCard's health bar already
 * shows — surfaced here as a threshold so a global banner can warn before
 * a position is actually at risk of liquidation, not just report the
 * healthy/unhealthy state after the fact.
 */
export function useMarginHealthStatus(): MarginHealthStatus | undefined {
  const summary = useSubaccountSummary();
  const maintenance = summary.data?.exists ? summary.data.health.maintenance : undefined;

  if (!maintenance || maintenance.liabilities.isZero()) return undefined;

  const ratio = maintenance.assets.div(maintenance.liabilities);
  if (ratio.lte(DANGER_RATIO)) return { level: "danger", ratio };
  if (ratio.lt(WARNING_RATIO)) return { level: "warning", ratio };
  return undefined;
}
