import { NextRequest } from "next/server";
import { REAL_ENDPOINTS, type NadoService } from "@/lib/nado-endpoints";

// Nado's gateway/archive/trigger/mobile APIs don't send CORS headers for
// browser origins (confirmed on both testnet and mainnet) — this proxies
// requests server-side, where CORS doesn't apply. See nado-endpoints.ts.
async function proxy(
  request: NextRequest,
  params: Promise<{ service: string; path: string[] }>,
) {
  const { service, path } = await params;

  if (!(service in REAL_ENDPOINTS) || service === "rpc") {
    return Response.json({ error: `Unknown Nado service: ${service}` }, { status: 404 });
  }

  const base = REAL_ENDPOINTS[service as NadoService];
  const targetUrl = `${base}/${path.join("/")}${request.nextUrl.search}`;

  const res = await fetch(targetUrl, {
    method: request.method,
    headers: { "content-type": request.headers.get("content-type") ?? "application/json" },
    body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.text(),
  });

  return new Response(await res.text(), {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
  });
}

type RouteParams = { params: Promise<{ service: string; path: string[] }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  return proxy(request, params);
}
export async function POST(request: NextRequest, { params }: RouteParams) {
  return proxy(request, params);
}
export async function PUT(request: NextRequest, { params }: RouteParams) {
  return proxy(request, params);
}
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return proxy(request, params);
}
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return proxy(request, params);
}
