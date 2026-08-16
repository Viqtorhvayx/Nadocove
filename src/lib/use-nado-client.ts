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
    // wagmi's client generics and @nadohq/client's expected viem Chain type
    // are structurally incompatible at the type level (two independently
    // built `Chain` object types for the same Ink chain), even though both
    // wrap the same runtime JSON-RPC client. Cast at this single boundary
    // rather than losing type safety throughout the rest of the app.
    return createNadoClient(
      { chainEnv: CHAIN_ENV },
      { walletClient, publicClient } as unknown as Parameters<typeof createNadoClient>[1],
    );
  }, [walletClient, publicClient]);
}
