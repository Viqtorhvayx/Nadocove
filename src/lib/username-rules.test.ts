import { describe, expect, it } from "vitest";
import { validateUsername } from "@/lib/username-rules";

describe("validateUsername", () => {
  it("accepts a normal lowercase handle", () => {
    expect(validateUsername("victor_trades")).toEqual({ ok: true });
  });

  it("accepts the minimum length (3)", () => {
    expect(validateUsername("abc")).toEqual({ ok: true });
  });

  it("accepts the maximum length (20)", () => {
    expect(validateUsername("a".repeat(20))).toEqual({ ok: true });
  });

  it("rejects below the minimum length", () => {
    expect(validateUsername("ab").ok).toBe(false);
  });

  it("rejects above the maximum length", () => {
    expect(validateUsername("a".repeat(21)).ok).toBe(false);
  });

  it("rejects uppercase letters", () => {
    expect(validateUsername("Victor").ok).toBe(false);
  });

  it("rejects spaces", () => {
    expect(validateUsername("victor trades").ok).toBe(false);
  });

  it("rejects special characters that could be confused for markup or paths", () => {
    expect(validateUsername("victor<script>").ok).toBe(false);
    expect(validateUsername("../admin").ok).toBe(false);
    expect(validateUsername("victor.trades").ok).toBe(false);
  });

  it("rejects reserved names", () => {
    expect(validateUsername("admin").ok).toBe(false);
    expect(validateUsername("nadocove").ok).toBe(false);
    expect(validateUsername("settings").ok).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(validateUsername("").ok).toBe(false);
  });
});
