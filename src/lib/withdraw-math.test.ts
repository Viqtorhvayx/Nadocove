import { describe, expect, it } from "vitest";
import BigNumber from "bignumber.js";
import { removeDecimals } from "@nadohq/shared";
import { canSubmitWithdraw, exceedsMaxWithdrawable } from "@/lib/withdraw-math";

/**
 * The unit contract at the hook boundary, which is where this actually broke.
 * Everything below this block tests the pure math with values that are
 * already human-scaled, so none of it could catch useMaxWithdrawable handing
 * over the engine's raw 18-decimal integer instead.
 *
 * The raw figure here was observed live on Nado mainnet: an account holding
 * 78.03 USD₮0 reports max_withdrawable as "78032262443384210699".
 */
describe("max withdrawable arrives as raw x18 and must be rescaled", () => {
  const RAW_FROM_ENGINE = new BigNumber("78032262443384210699");
  const HUMAN = removeDecimals(RAW_FROM_ENGINE, 18);

  it("rescales the engine value to real units", () => {
    expect(HUMAN.toFixed(6)).toBe("78.032262");
  });

  it("guards an over-balance withdrawal once rescaled", () => {
    expect(exceedsMaxWithdrawable("100", HUMAN)).toBe(true);
    expect(canSubmitWithdraw({
      selectedProductId: 0,
      amount: "100",
      maxWithdrawableLoaded: true,
      exceedsMax: exceedsMaxWithdrawable("100", HUMAN),
      isPending: false,
    })).toBe(false);
  });

  it("lets every realistic amount through when NOT rescaled (the old bug)", () => {
    expect(exceedsMaxWithdrawable("100", RAW_FROM_ENGINE)).toBe(false);
    expect(exceedsMaxWithdrawable("999999", RAW_FROM_ENGINE)).toBe(false);
  });
});

describe("exceedsMaxWithdrawable", () => {
  it("is false while max withdrawable is still loading", () => {
    expect(exceedsMaxWithdrawable("100", undefined)).toBe(false);
  });

  it("is true when the amount is greater than the max", () => {
    expect(exceedsMaxWithdrawable("101", new BigNumber(100))).toBe(true);
  });

  it("is false when the amount equals the max exactly", () => {
    expect(exceedsMaxWithdrawable("100", new BigNumber(100))).toBe(false);
  });

  it("is false when the amount is below the max", () => {
    expect(exceedsMaxWithdrawable("50", new BigNumber(100))).toBe(false);
  });

  it("is false for an empty or zero amount, regardless of max", () => {
    expect(exceedsMaxWithdrawable("", new BigNumber(100))).toBe(false);
    expect(exceedsMaxWithdrawable("0", new BigNumber(100))).toBe(false);
  });
});

describe("canSubmitWithdraw", () => {
  const base = {
    selectedProductId: 0,
    amount: "1.5",
    maxWithdrawableLoaded: true,
    exceedsMax: false,
    isPending: false,
  };

  it("allows submit when everything checks out", () => {
    expect(canSubmitWithdraw(base)).toBe(true);
  });

  it("blocks submit before max withdrawable has loaded, even with a valid amount", () => {
    // Regression test for the same class of gap fixed on the deposit side:
    // Review/Submit shouldn't be clickable before we know the real ceiling.
    expect(canSubmitWithdraw({ ...base, maxWithdrawableLoaded: false })).toBe(false);
  });

  it("blocks submit with no product selected", () => {
    expect(canSubmitWithdraw({ ...base, selectedProductId: undefined })).toBe(false);
  });

  it("blocks submit for a zero or empty amount", () => {
    expect(canSubmitWithdraw({ ...base, amount: "0" })).toBe(false);
    expect(canSubmitWithdraw({ ...base, amount: "" })).toBe(false);
  });

  it("blocks submit when the amount exceeds the max", () => {
    expect(canSubmitWithdraw({ ...base, exceedsMax: true })).toBe(false);
  });

  it("blocks submit while a withdrawal is already in flight", () => {
    expect(canSubmitWithdraw({ ...base, isPending: true })).toBe(false);
  });
});
