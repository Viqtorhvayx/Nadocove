import { ENGINE_CLIENT_ENDPOINTS } from "@nadohq/engine-client";
import { INDEXER_CLIENT_ENDPOINTS } from "@nadohq/indexer-client";
import { TRIGGER_CLIENT_ENDPOINTS } from "@nadohq/trigger-client";
import { MOBILE_CLIENT_ENDPOINTS } from "@nadohq/mobile-client";
import { CHAIN_ENV_TO_CHAIN } from "@nadohq/shared";
import { CHAIN_ENV } from "@/lib/chain-env";

/**
 * Nado's gateway/archive/trigger/mobile/RPC endpoints don't send CORS
 * headers permitting browser-origin requests (confirmed against both
 * testnet and mainnet — this isn't a testnet-only gap). Everything here
 * runs server-side, in Route Handlers under /api/nado/*, which forward to
 * these real URLs — server-to-server requests aren't subject to CORS.
 */
export const REAL_ENDPOINTS = {
  engine: ENGINE_CLIENT_ENDPOINTS[CHAIN_ENV],
  indexer: INDEXER_CLIENT_ENDPOINTS[CHAIN_ENV],
  trigger: TRIGGER_CLIENT_ENDPOINTS[CHAIN_ENV],
  mobile: MOBILE_CLIENT_ENDPOINTS[CHAIN_ENV],
  rpc: CHAIN_ENV_TO_CHAIN[CHAIN_ENV].rpcUrls.default.http[0],
} as const;

export type NadoService = "engine" | "indexer" | "trigger" | "mobile";

/**
 * Absolute base URL for this app itself, used to build proxy URLs that
 * work identically during SSR (no `window`) and in the browser. Set
 * NEXT_PUBLIC_APP_URL once deployed; falls back to localhost for dev.
 */
export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function proxyUrl(service: NadoService): string {
  return `${getAppUrl()}/api/nado/${service}`;
}

export function proxyRpcUrl(): string {
  return `${getAppUrl()}/api/nado/rpc`;
}
