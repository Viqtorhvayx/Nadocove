import { NextRequest } from "next/server";
import { REAL_ENDPOINTS } from "@/lib/nado-endpoints";

// Ink RPC doesn't send CORS headers for browser origins — this proxies
// JSON-RPC calls server-side, where CORS doesn't apply. See
// nado-endpoints.ts for the full explanation.
export async function POST(request: NextRequest) {
  const body = await request.text();

  const res = await fetch(REAL_ENDPOINTS.rpc, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });

  return new Response(await res.text(), {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
  });
}
