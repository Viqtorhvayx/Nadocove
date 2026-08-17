import BigNumber from "bignumber.js";

/**
 * Pure amount math for the withdraw flow, split out of withdraw-panel.tsx
 * for the same reason as deposit-math.ts — unit-testable without React,
 * for the part of the form where a bug means moving the wrong amount.
 */

export function exceedsMaxWithdrawable(
  amount: string,
  maxWithdrawable: BigNumber | undefined,
): boolean {
  return Number(amount) > 0 && maxWithdrawable !== undefined && new BigNumber(amount).gt(maxWithdrawable);
}

export function canSubmitWithdraw(params: {
  selectedProductId: number | undefined;
  amount: string;
  maxWithdrawableLoaded: boolean;
  exceedsMax: boolean;
  isPending: boolean;
}): boolean {
  return (
    params.selectedProductId !== undefined &&
    Number(params.amount) > 0 &&
    params.maxWithdrawableLoaded &&
    !params.exceedsMax &&
    !params.isPending
  );
}
