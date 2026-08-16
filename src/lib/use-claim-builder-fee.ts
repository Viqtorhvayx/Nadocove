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
import { DEFAULT_SUBACCOUNT_NAME } from "@/lib/use-subaccount-data";

/**
 * Claims accumulated builder fees to the builder's subaccount via the
 * Endpoint contract's slow-mode transaction queue (tx type 31).
 *
 * Note: this only submits the claim — there's no verified way to preview
 * the claimable amount first. The docs reference a `getClaimableBuilderFee`
 * view function on an "OffchainExchange" contract, but that name doesn't
 * match any of the currently deployed contracts (clearinghouse, endpoint,
 * perpEngine, querier, spotEngine, withdrawPool) or their ABIs in this SDK
 * version — likely stale docs. Rather than guess at an unverifiable read,
 * this ships the claim action alone; a balance preview is a follow-up once
 * the correct contract/ABI can be confirmed.
 */
export function useClaimBuilderFee() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

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
        subaccountName: DEFAULT_SUBACCOUNT_NAME,
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
