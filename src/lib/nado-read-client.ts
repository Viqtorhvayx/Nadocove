import { createPublicClient, http } from "viem";
import { createNadoClient } from "@nadohq/client";
import { CHAIN_ENV_TO_CHAIN } from "@nadohq/shared";
import { CHAIN_ENV } from "@/lib/wagmi";

/**
 * A read-only NadoClient backed by a plain viem PublicClient — no wallet
 * connection required. Used for public profile lookups, where the viewer
 * may not have (or want to connect) a wallet at all. Built once at module
 * scope since it depends on nothing that changes at runtime.
 */
const publicClient = createPublicClient({
  chain: CHAIN_ENV_TO_CHAIN[CHAIN_ENV],
  transport: http(),
});

// @nadohq/client@0.36.0's expected viem Chain/PublicClient shape doesn't
// structurally match the one produced by viem@2.52.0 (the exact version
// @nadohq/shared itself pins as a peer dep) — a version-skew issue in the
// SDK's published types, not something specific to how this client was
// built. Confirmed by hitting the identical error from a plain
// createPublicClient() call using @nadohq/shared's own chain definition
// (see the matching cast in use-nado-client.ts).
export const readOnlyNadoClient = createNadoClient(
  { chainEnv: CHAIN_ENV },
  { publicClient } as unknown as Parameters<typeof createNadoClient>[1],
);
