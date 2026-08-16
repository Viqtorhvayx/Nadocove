import { NextRequest } from "next/server";
import { REAL_ENDPOINTS } from "@/lib/nado-endpoints";
import { guardProxyRequest, PROXY_FETCH_TIMEOUT_MS } from "@/lib/proxy-guard";

// Ink RPC doesn't send CORS headers for browser origins — this proxies
// JSON-RPC calls server-side, where CORS doesn't apply. See
// nado-endpoints.ts for the full explanation, and proxy-guard.ts for what
// "hardened" does and doesn't mean here.
export async function POST(request: NextRequest) {
  const blocked = guardProxyRequest(request);
  if (blocked) return blocked;

  const body = await request.text();

  try {
    const res = await fetch(REAL_ENDPOINTS.rpc, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      signal: AbortSignal.timeout(PROXY_FETCH_TIMEOUT_MS),
    });

    return new Response(await res.text(), {
      status: res.status,
      headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
    });
  } catch {
    return Response.json({ error: "Upstream RPC request failed" }, { status: 502 });
  }
}
