import type { EngineSymbol } from "@nadohq/engine-client";

/**
 * Max leverage implied by a market's real initial-margin weight: a
 * longWeightInitial of 0.95 means 5% initial margin, i.e. up to 20x. This
 * is informational only — NadoCove doesn't have a leverage/margin-mode
 * selector, since order placement here doesn't take a leverage parameter
 * (Nado's shared-margin subaccount is cross-margin by design). Showing a
 * badge is honest; showing a slider that changed nothing would not be.
 */
export function maxLeverageFor(symbol: EngineSymbol | undefined): number | undefined {
  if (!symbol) return undefined;
  const marginFraction = 1 - symbol.longWeightInitial.toNumber();
  if (marginFraction <= 0) return undefined;
  return Math.floor(1 / marginFraction);
}
