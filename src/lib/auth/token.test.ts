import { describe, expect, it, vi } from "vitest";
import { signToken, verifyToken } from "@/lib/auth/token";

describe("signToken / verifyToken", () => {
  it("round-trips a payload", () => {
    const token = signToken({ address: "0xabc" }, 60);
    expect(verifyToken<{ address: string }>(token)?.address).toBe("0xabc");
  });

  it("rejects an expired token", () => {
    const token = signToken({ address: "0xabc" }, -1);
    expect(verifyToken(token)).toBeUndefined();
  });

  it("rejects a token with a tampered payload", () => {
    const token = signToken({ address: "0xabc" }, 60);
    const [, signature] = token.split(".");
    const tamperedBody = Buffer.from(
      JSON.stringify({ address: "0xevil", exp: Date.now() + 60_000 }),
    ).toString("base64url");
    expect(verifyToken(`${tamperedBody}.${signature}`)).toBeUndefined();
  });

  it("rejects a token with a tampered signature", () => {
    const token = signToken({ address: "0xabc" }, 60);
    const [body] = token.split(".");
    expect(verifyToken(`${body}.not-the-real-signature`)).toBeUndefined();
  });

  it("rejects a malformed token", () => {
    expect(verifyToken("not-a-real-token")).toBeUndefined();
  });

  it("rejects undefined", () => {
    expect(verifyToken(undefined)).toBeUndefined();
  });

  it("is signed with AUTH_SECRET — a different secret can't verify it", () => {
    const token = signToken({ address: "0xabc" }, 60);
    vi.stubEnv("AUTH_SECRET", "a-completely-different-secret");
    expect(verifyToken(token)).toBeUndefined();
    vi.unstubAllEnvs();
  });
});
