import { useMutation } from "@tanstack/react-query";
import { useAccount, useWalletClient } from "wagmi";
import {
  ENDPOINT_ABI,
  NADO_DEPLOYMENTS,
  encodeClaimBuilderFeeTx,
  subaccountToBytes32,
} from "@nadohq/shared";
import { CHAIN_ENV } from "@/lib/wagmi";
import { BUILDER_ID } from "@/lib/builder";
import { useActiveSubaccount } from "@/lib/subaccount-context";

/**
 * Claims accumulated builder fees to the builder's subaccount via the
 * Endpoint contract's slow-mode transaction queue (tx type 31).
 *
 * There is no verified way to preview the claimable amount first —
 * confirmed by two separate checks: (1) the docs reference a
 * `getClaimableBuilderFee` view function on an "OffchainExchange" contract
 * that doesn't match any of the six currently deployed contracts
 * (clearinghouse, endpoint, perpEngine, querier, spotEngine, withdrawPool);
 * (2) grepping all six contracts' ABIs directly for any function containing
 * "builder" returns nothing, and grepping the indexer client's full method
 * list for anything builder-related also returns nothing. This isn't a gap
 * I missed — the read path genuinely doesn't exist in this SDK version. A
 * balance preview isn't buildable until Nado exposes one.
 */
export function useClaimBuilderFee() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { subaccountName } = useActiveSubaccount();

  return useMutation({
    mutationFn: async () => {
      if (!walletClient || !address) {
        throw new Error("Connect a wallet first.");
      }
      if (BUILDER_ID <= 0) {
        throw new Error("No Builder ID configured — see .env.example.");
      }

      const sender = subaccountToBytes32({
        subaccountOwner: address,
        subaccountName,
      });

      const tx = encodeClaimBuilderFeeTx({
        // subaccountToBytes32 returns @nadohq/shared's `Bytes` string type;
        // encodeClaimBuilderFeeTx expects viem's `Hex` template type. Same
        // runtime hex string, different nominal types — cast at the boundary.
        sender: sender as unknown as `0x${string}`,
        builderId: BUILDER_ID,
      });
      const endpoint = NADO_DEPLOYMENTS[CHAIN_ENV].endpoint;

      return walletClient.writeContract({
        address: endpoint as unknown as `0x${string}`,
        abi: ENDPOINT_ABI,
        functionName: "submitSlowModeTransaction",
        args: [tx],
      });
    },
  });
}
