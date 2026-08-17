import { parseUnits } from "viem";

/**
 * Pure amount/decimal math for the deposit flow, split out of
 * deposit-panel.tsx so it's unit-testable without rendering React —
 * this is the part of a money-moving form where a bug is a fund-safety
 * issue, not just a display glitch.
 */

/** Human input (e.g. "0.1") -> the token's real on-chain raw units, or
 * undefined for anything not a valid positive amount. */
export function computeDepositAmountRaw(
  amount: string,
  decimals: number | undefined,
): bigint | undefined {
  if (decimals === undefined || !amount || Number(amount) <= 0) return undefined;
  try {
    return parseUnits(amount, decimals);
  } catch {
    return undefined;
  }
}

/** getTokenAllowance returns a BigNumber over raw (undecimalled) token units
 * — same units as amountRaw already, no human-decimal scaling either side. */
export function computeNeedsApproval(
  amountRaw: bigint | undefined,
  allowanceRaw: bigint | undefined,
): boolean {
  return amountRaw !== undefined && (allowanceRaw === undefined || allowanceRaw < amountRaw);
}

export function computeExceedsBalance(
  amountRaw: bigint | undefined,
  walletBalanceRaw: bigint | undefined,
): boolean {
  return (
    amountRaw !== undefined && walletBalanceRaw !== undefined && amountRaw > walletBalanceRaw
  );
}

export function canSubmitDeposit(params: {
  selectedProductId: number | undefined;
  amountRaw: bigint | undefined;
  walletBalanceLoaded: boolean;
  exceedsBalance: boolean;
  isPending: boolean;
}): boolean {
  return (
    params.selectedProductId !== undefined &&
    params.amountRaw !== undefined &&
    params.amountRaw > BigInt(0) &&
    params.walletBalanceLoaded &&
    !params.exceedsBalance &&
    !params.isPending
  );
}
