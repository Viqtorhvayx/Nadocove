import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { readOnlyNadoClient } from "@/lib/nado-read-client";
import { useNadoClient } from "@/lib/use-nado-client";

/**
 * Real weekly cash-incentives campaign data (trading-volume-tiered reward
 * pools, per-wallet share, claim status) — verified live against Nado's
 * indexer (getCashIncentives), unlike getReferralCode which turned out to
 * be broken. Public/read-only: any address can be queried.
 */
export function useCashIncentives(address: string | undefined) {
  return useQuery({
    queryKey: ["cash-incentives", address],
    queryFn: () =>
      readOnlyNadoClient.context.indexerClient.getCashIncentives({ address: address as `0x${string}` }),
    enabled: Boolean(address),
    refetchInterval: 60_000,
  });
}

/**
 * Claims every currently-claimable cash incentives reward for the
 * connected wallet in one transaction — the SDK's claimCashIncentives()
 * fetches merkle proofs from the indexer and submits directly to the
 * Airdrop contract itself.
 */
export function useClaimCashIncentives() {
  const { address } = useAccount();
  const nadoClient = useNadoClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!nadoClient) throw new Error("Connect a wallet first.");
      return nadoClient.rewards.claimCashIncentives();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-incentives", address] });
    },
  });
}
