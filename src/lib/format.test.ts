import { describe, expect, it } from "vitest";
import BigNumber from "bignumber.js";
import {
  formatAmount,
  formatPercent,
  formatSignedUsd,
  formatUsd,
  pnlColorClass,
  truncateAddress,
} from "@/lib/format";

describe("formatUsd", () => {
  it("formats a positive value with a dollar sign and two decimals", () => {
    expect(formatUsd(new BigNumber("1234.5"))).toBe("$1,234.50");
  });

  it("formats zero", () => {
    expect(formatUsd(new BigNumber(0))).toBe("$0.00");
  });

  it("formats a negative value with a leading minus", () => {
    expect(formatUsd(new BigNumber("-42.1"))).toBe("-$42.10");
  });

  it("compacts large values when compact=true", () => {
    expect(formatUsd(new BigNumber("60930000"), true)).toBe("$60.93M");
  });
});

describe("formatSignedUsd", () => {
  it("prefixes a positive value with +", () => {
    expect(formatSignedUsd(new BigNumber("17.8"))).toBe("+$17.80");
  });

  it("does not double up the sign on a negative value", () => {
    expect(formatSignedUsd(new BigNumber("-17.8"))).toBe("-$17.80");
  });

  it("does not prefix zero with +", () => {
    expect(formatSignedUsd(new BigNumber(0))).toBe("$0.00");
  });
});

describe("formatAmount", () => {
  it("caps at maxDecimals even when the value has more", () => {
    expect(formatAmount(new BigNumber("1.123456789"), 4)).toBe("1.1235");
  });

  it("does not pad decimals beyond what the value actually has", () => {
    expect(formatAmount(new BigNumber("1.5"), 6)).toBe("1.5");
  });

  it("handles whole numbers with no decimal places", () => {
    expect(formatAmount(new BigNumber("100"), 6)).toBe("100");
  });
});

describe("formatPercent", () => {
  it("multiplies by 100 and appends a percent sign", () => {
    // Leaderboard roi values arrive already as percentage numbers (e.g.
    // "23.64" meaning 23.64%), so formatPercent is only for fractional
    // values (0-1 range) elsewhere in the app — confirm that scaling here.
    expect(formatPercent(new BigNumber("0.2364"), 2)).toBe("23.64%");
  });

  it("defaults to one decimal place", () => {
    expect(formatPercent(new BigNumber("0.05"))).toBe("5.0%");
  });
});

describe("pnlColorClass", () => {
  it("returns positive class for values above zero", () => {
    expect(pnlColorClass(new BigNumber("0.01"))).toBe("text-positive");
  });

  it("returns negative class for values below zero", () => {
    expect(pnlColorClass(new BigNumber("-0.01"))).toBe("text-negative");
  });

  it("returns muted class for exactly zero", () => {
    expect(pnlColorClass(new BigNumber(0))).toBe("text-foreground-muted");
  });
});

describe("truncateAddress", () => {
  it("keeps the first 6 and last 4 characters", () => {
    expect(truncateAddress("0x4fbadbb13d2c435a0b2f868e22bb680e8824c571")).toBe(
      "0x4fba…c571",
    );
  });
});
