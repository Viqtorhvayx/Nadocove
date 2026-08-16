import { useMemo } from "react";
import { usePublicClient, useWalletClient } from "wagmi";
import { createNadoClient } from "@nadohq/client";
import { NADO_DEPLOYMENTS } from "@nadohq/shared";
import { CHAIN_ENV } from "@/lib/chain-env";
import { proxyUrl } from "@/lib/nado-endpoints";

/**
 * Bridges the connected wagmi wallet/public clients into a NadoClient.
 * Returns undefined until a wallet is connected — callers should guard
 * queries on this being defined (see useSubaccountSummary).
 *
 * Engine/indexer/trigger/mobile calls route through /api/nado/* server-side
 * proxies (see nado-endpoints.ts) — Nado's APIs don't send CORS headers for
 * browser origins. The RPC transport itself is proxied at the wagmiConfig
 * level (see wagmi.ts), so publicClient/walletClient here are already safe.
 */
export function useNadoClient() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  return useMemo(() => {
    if (!walletClient || !publicClient) return undefined;
    // @nadohq/client@0.36.0's expected viem Chain/PublicClient shape doesn't
    // structurally match viem@2.52.0's (a version-skew issue in the SDK's
    // published types — see the matching cast + longer note in
    // nado-read-client.ts, which reproduces this from a plain viem client
    // with no wagmi involved). Cast at this single boundary rather than
    // losing type safety throughout the rest of the app.
    return createNadoClient(
      {
        contractAddresses: NADO_DEPLOYMENTS[CHAIN_ENV],
        engineEndpoint: proxyUrl("engine"),
        indexerEndpoint: proxyUrl("indexer"),
        triggerEndpoint: proxyUrl("trigger"),
        mobileEndpoint: proxyUrl("mobile"),
      },
      { walletClient, publicClient } as unknown as Parameters<typeof createNadoClient>[1],
    );
  }, [walletClient, publicClient]);
}
