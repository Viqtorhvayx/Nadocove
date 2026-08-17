import { describe, expect, it } from "vitest";
import {
  canSubmitDeposit,
  computeDepositAmountRaw,
  computeExceedsBalance,
  computeNeedsApproval,
} from "@/lib/deposit-math";

describe("computeDepositAmountRaw", () => {
  it("scales by the token's real decimals, not a fixed constant", () => {
    // USD₮0 has 6 decimals on Ink mainnet (verified against a live contract
    // read) — 0.1 USD₮0 must become 100000n, not 100000000000000000n (which
    // is what 18-decimal engine-internal scaling would wrongly produce).
    expect(computeDepositAmountRaw("0.1", 6)).toBe(BigInt(100_000));
  });

  it("scales correctly for an 8-decimal token (kBTC)", () => {
    expect(computeDepositAmountRaw("1", 8)).toBe(BigInt(100_000_000));
  });

  it("scales correctly for an 18-decimal token (WETH)", () => {
    expect(computeDepositAmountRaw("1", 18)).toBe(BigInt("1000000000000000000"));
  });

  it("returns undefined for zero", () => {
    expect(computeDepositAmountRaw("0", 6)).toBeUndefined();
  });

  it("returns undefined for a negative amount", () => {
    expect(computeDepositAmountRaw("-1", 6)).toBeUndefined();
  });

  it("returns undefined for an empty string", () => {
    expect(computeDepositAmountRaw("", 6)).toBeUndefined();
  });

  it("returns undefined for non-numeric input rather than throwing", () => {
    expect(computeDepositAmountRaw("abc", 6)).toBeUndefined();
  });

  it("returns undefined when decimals haven't loaded yet", () => {
    expect(computeDepositAmountRaw("1", undefined)).toBeUndefined();
  });
});

describe("computeNeedsApproval", () => {
  it("defaults to needing approval when allowance hasn't loaded yet", () => {
    // The conservative direction: an extra unnecessary approve step costs
    // gas, but skipping a needed one would fail the deposit outright.
    expect(computeNeedsApproval(BigInt(100), undefined)).toBe(true);
  });

  it("needs approval when allowance is below the amount", () => {
    expect(computeNeedsApproval(BigInt(100), BigInt(50))).toBe(true);
  });

  it("does not need approval when allowance covers the amount exactly", () => {
    expect(computeNeedsApproval(BigInt(100), BigInt(100))).toBe(false);
  });

  it("does not need approval when allowance exceeds the amount", () => {
    expect(computeNeedsApproval(BigInt(100), BigInt(1000))).toBe(false);
  });

  it("is false when there's no amount to approve for", () => {
    expect(computeNeedsApproval(undefined, undefined)).toBe(false);
  });
});

describe("computeExceedsBalance", () => {
  it("is false while the balance is still loading", () => {
    expect(computeExceedsBalance(BigInt(100), undefined)).toBe(false);
  });

  it("is true when the amount is greater than the balance", () => {
    expect(computeExceedsBalance(BigInt(101), BigInt(100))).toBe(true);
  });

  it("is false when the amount equals the balance", () => {
    expect(computeExceedsBalance(BigInt(100), BigInt(100))).toBe(false);
  });

  it("is false when there's no amount entered", () => {
    expect(computeExceedsBalance(undefined, BigInt(100))).toBe(false);
  });
});

describe("canSubmitDeposit", () => {
  const base = {
    selectedProductId: 0,
    amountRaw: BigInt(100),
    walletBalanceLoaded: true,
    exceedsBalance: false,
    isPending: false,
  };

  it("allows submit when everything checks out", () => {
    expect(canSubmitDeposit(base)).toBe(true);
  });

  it("blocks submit before the wallet balance has loaded, even with a valid amount", () => {
    // Regression test: this exact gap let Review/Submit fire before we
    // actually knew whether the typed amount exceeded the real balance.
    expect(canSubmitDeposit({ ...base, walletBalanceLoaded: false })).toBe(false);
  });

  it("blocks submit with no product selected", () => {
    expect(canSubmitDeposit({ ...base, selectedProductId: undefined })).toBe(false);
  });

  it("blocks submit with no valid amount", () => {
    expect(canSubmitDeposit({ ...base, amountRaw: undefined })).toBe(false);
  });

  it("blocks submit for a zero amount", () => {
    expect(canSubmitDeposit({ ...base, amountRaw: BigInt(0) })).toBe(false);
  });

  it("blocks submit when the amount exceeds balance", () => {
    expect(canSubmitDeposit({ ...base, exceedsBalance: true })).toBe(false);
  });

  it("blocks submit while a deposit is already in flight", () => {
    expect(canSubmitDeposit({ ...base, isPending: true })).toBe(false);
  });
});
