import { createPublicClient, http } from "viem";
import { CHAIN_ENV_TO_CHAIN } from "@nadohq/shared";
import { CHAIN_ENV } from "@/lib/chain-env";
import { REAL_ENDPOINTS } from "@/lib/nado-endpoints";

/**
 * Used only to verify SIWE signatures (supports ERC-6492/EIP-1271 smart
 * contract wallets, which need an on-chain read). This runs server-side in
 * a Route Handler, so it hits the real RPC directly rather than going
 * through our own /api/nado/rpc proxy — that proxy exists to route around
 * browser CORS, which doesn't apply to a server-to-server call.
 */
export const siwePublicClient = createPublicClient({
  chain: CHAIN_ENV_TO_CHAIN[CHAIN_ENV],
  transport: http(REAL_ENDPOINTS.rpc),
});
