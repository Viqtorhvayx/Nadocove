import type { NextRequest } from "next/server";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 60; // generous for one active dashboard session; tune if needed
const MAX_BODY_BYTES = 100_000; // 100KB — generous for order/query payloads, which are typically <2KB

const buckets = new Map<string, { count: number; resetAt: number }>();

function pruneExpiredBuckets(now: number) {
  for (const [ip, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(ip);
  }
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

/**
 * Best-effort abuse guard for the /api/nado/* proxy routes.
 *
 * These routes exist purely to route around Nado's lack of CORS support for
 * browser origins (see nado-endpoints.ts) — they're not an auth boundary.
 * This raises the bar against casual/opportunistic abuse (someone embedding
 * our proxy in their own site as a free CORS relay, naive scripted spam),
 * not a determined attacker willing to spoof headers from a server.
 *
 * Rate limiting is in-memory, per serverless instance — it resets on cold
 * start and isn't shared across regions/concurrent instances. A durable
 * limit needs a shared store (Vercel KV, Upstash Redis, etc.) — a separate
 * service requiring its own account, not wired up here.
 */
export function guardProxyRequest(request: NextRequest): Response | null {
  // Same-origin check: browser requests carry an Origin header that must
  // match our own host. Server-to-server calls — including our own SSR
  // fetches to this same proxy — typically omit Origin entirely, and we
  // can't reliably distinguish "our own SSR" from "a script" by header
  // alone, so those are allowed through and left to the rate limit below.
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return Response.json({ error: "Forbidden origin" }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return Response.json({ error: "Payload too large" }, { status: 413 });
  }

  const ip = getClientIp(request);
  const now = Date.now();
  if (buckets.size > 5000) pruneExpiredBuckets(now);

  const bucket = buckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else {
    bucket.count += 1;
    if (bucket.count > RATE_LIMIT_MAX_REQUESTS) {
      return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
    }
  }

  return null;
}

export const PROXY_FETCH_TIMEOUT_MS = 10_000;
