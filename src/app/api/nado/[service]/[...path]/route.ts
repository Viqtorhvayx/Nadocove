import { NextRequest } from "next/server";
import { REAL_ENDPOINTS, type NadoService } from "@/lib/nado-endpoints";
import { guardProxyRequest, PROXY_FETCH_TIMEOUT_MS } from "@/lib/proxy-guard";

// Nado's gateway/archive/trigger/mobile APIs don't send CORS headers for
// browser origins (confirmed on both testnet and mainnet) — this proxies
// requests server-side, where CORS doesn't apply. See nado-endpoints.ts,
// and proxy-guard.ts for what "hardened" does and doesn't mean here.
//
// Only GET/POST are exposed: every @nadohq/*-client package (engine,
// indexer, trigger, mobile) exclusively uses GET (simple queries) and POST
// (the query/execute endpoints) — confirmed by checking their source
// directly. PUT/PATCH/DELETE are unused surface, dropped here.
async function proxy(
  request: NextRequest,
  params: Promise<{ service: string; path: string[] }>,
) {
  const blocked = guardProxyRequest(request);
  if (blocked) return blocked;

  const { service, path } = await params;

  if (!(service in REAL_ENDPOINTS) || service === "rpc") {
    return Response.json({ error: `Unknown Nado service: ${service}` }, { status: 404 });
  }

  const base = REAL_ENDPOINTS[service as NadoService];
  const targetUrl = `${base}/${path.join("/")}${request.nextUrl.search}`;

  try {
    const res = await fetch(targetUrl, {
      method: request.method,
      headers: { "content-type": request.headers.get("content-type") ?? "application/json" },
      body: request.method === "GET" ? undefined : await request.text(),
      signal: AbortSignal.timeout(PROXY_FETCH_TIMEOUT_MS),
    });

    return new Response(await res.text(), {
      status: res.status,
      headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
    });
  } catch {
    return Response.json({ error: `Upstream ${service} request failed` }, { status: 502 });
  }
}

type RouteParams = { params: Promise<{ service: string; path: string[] }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  return proxy(request, params);
}
export async function POST(request: NextRequest, { params }: RouteParams) {
  return proxy(request, params);
}
