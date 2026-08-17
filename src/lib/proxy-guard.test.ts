import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { guardProxyRequest } from "@/lib/proxy-guard";

// The guard's rate-limit buckets are module-level state shared across every
// call in this process, so each test below uses its own x-forwarded-for IP
// to avoid bleeding into other tests' counts.
let ipCounter = 0;
function nextIp() {
  ipCounter += 1;
  return `203.0.113.${ipCounter}`;
}

function makeRequest(opts: {
  origin?: string;
  contentLength?: number;
  ip?: string;
} = {}) {
  const headers: Record<string, string> = { "x-forwarded-for": opts.ip ?? nextIp() };
  if (opts.origin !== undefined) headers.origin = opts.origin;
  if (opts.contentLength !== undefined) headers["content-length"] = String(opts.contentLength);
  return new NextRequest("http://localhost:3000/api/nado/indexer/foo", { headers });
}

describe("guardProxyRequest — origin check", () => {
  it("allows a same-origin request", () => {
    expect(guardProxyRequest(makeRequest({ origin: "http://localhost:3000" }))).toBeNull();
  });

  it("allows a request with no Origin header (server-to-server)", () => {
    expect(guardProxyRequest(makeRequest())).toBeNull();
  });

  it("rejects a cross-origin request with 403", async () => {
    const res = guardProxyRequest(makeRequest({ origin: "https://evil.example" }));
    expect(res).not.toBeNull();
    expect(res!.status).toBe(403);
  });
});

describe("guardProxyRequest — body size", () => {
  it("allows a normal-sized payload", () => {
    expect(guardProxyRequest(makeRequest({ contentLength: 2_000 }))).toBeNull();
  });

  it("rejects a payload over the 100KB cap with 413", () => {
    const res = guardProxyRequest(makeRequest({ contentLength: 200_000 }));
    expect(res).not.toBeNull();
    expect(res!.status).toBe(413);
  });
});

describe("guardProxyRequest — rate limiting", () => {
  it("allows up to the per-window request cap", () => {
    const ip = nextIp();
    for (let i = 0; i < 60; i++) {
      expect(guardProxyRequest(makeRequest({ ip }))).toBeNull();
    }
  });

  it("rejects the request past the per-window cap with 429", () => {
    const ip = nextIp();
    for (let i = 0; i < 60; i++) {
      guardProxyRequest(makeRequest({ ip }));
    }
    const res = guardProxyRequest(makeRequest({ ip }));
    expect(res).not.toBeNull();
    expect(res!.status).toBe(429);
  });

  it("tracks separate IPs independently", () => {
    const ipA = nextIp();
    const ipB = nextIp();
    for (let i = 0; i < 60; i++) {
      guardProxyRequest(makeRequest({ ip: ipA }));
    }
    // ipA is now at its cap, but ipB has made no requests yet.
    expect(guardProxyRequest(makeRequest({ ip: ipB }))).toBeNull();
  });
});
