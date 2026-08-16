import { useMemo } from "react";
import { usePublicClient, useWalletClient } from "wagmi";
import { createNadoClient } from "@nadohq/client";
import { CHAIN_ENV } from "@/lib/wagmi";

/**
 * Bridges the connected wagmi wallet/public clients into a NadoClient.
 * Returns undefined until a wallet is connected — callers should guard
 * queries on this being defined (see useSubaccountSummary).
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
      { chainEnv: CHAIN_ENV },
      { walletClient, publicClient } as unknown as Parameters<typeof createNadoClient>[1],
    );
  }, [walletClient, publicClient]);
}
