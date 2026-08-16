import { useMemo } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount, usePublicClient } from "wagmi";
import { QUOTE_PRODUCT_ID } from "@nadohq/shared";
import { useNadoClient } from "@/lib/use-nado-client";
import { useSymbols } from "@/lib/use-subaccount-data";
import { useActiveSubaccount } from "@/lib/subaccount-context";
import { ERC20_META_ABI } from "@/lib/erc20-meta-abi";

export type DepositableToken = {
  productId: number;
  symbol: string;
  decimals: number;
  address: `0x${string}`;
};

/**
 * Spot products a user can deposit as collateral: the primary quote asset
 * (productId 0, USD₮0 — not present in getSymbols(), it's the exchange's
 * base currency rather than a listed market) plus every other spot product.
 * Perp products (futures) aren't depositable directly.
 */
export function useDepositableProductIds(): number[] {
  const symbolsQuery = useSymbols();

  return useMemo(() => {
    const spotIds = Object.values(symbolsQuery.data?.symbols ?? {})
      .filter((s) => s.type === 0)
      .map((s) => s.productId)
      .sort((a, b) => a - b);
    return [QUOTE_PRODUCT_ID, ...spotIds.filter((id) => id !== QUOTE_PRODUCT_ID)];
  }, [symbolsQuery.data]);
}

/**
 * Resolves each productId's real ERC20 token address, symbol, and decimals
 * on-chain — via the SDK's getTokenContractForProduct (which reads
 * SpotEngine.getConfig) plus a symbol()/decimals() read. Cached forever:
 * this mapping never changes for a given chain.
 */
export function useTokenMetadata(productIds: number[]) {
  const nadoClient = useNadoClient();
  const publicClient = usePublicClient();

  return useQueries({
    queries: productIds.map((productId) => ({
      queryKey: ["token-metadata", productId],
      queryFn: async (): Promise<DepositableToken> => {
        const tokenContract = await nadoClient!.spot.getTokenContractForProduct({
          productId,
        });
        const address = tokenContract.address;
        const [symbol, decimals] = await Promise.all([
          publicClient!.readContract({
            address,
            abi: ERC20_META_ABI,
            functionName: "symbol",
          }),
          publicClient!.readContract({
            address,
            abi: ERC20_META_ABI,
            functionName: "decimals",
          }),
        ]);
        return { productId, symbol, decimals, address };
      },
      enabled: Boolean(nadoClient && publicClient),
      staleTime: Infinity,
    })),
  });
}

export function useTokenWalletBalance(productId: number | undefined) {
  const { address } = useAccount();
  const nadoClient = useNadoClient();

  return useQuery({
    queryKey: ["token-wallet-balance", address, productId],
    queryFn: () =>
      nadoClient!.spot.getTokenWalletBalance({ address: address!, productId: productId! }),
    enabled: Boolean(nadoClient && address && productId !== undefined),
    refetchInterval: 15_000,
  });
}

export function useTokenAllowance(productId: number | undefined) {
  const { address } = useAccount();
  const nadoClient = useNadoClient();

  return useQuery({
    queryKey: ["token-allowance", address, productId],
    queryFn: () =>
      nadoClient!.spot.getTokenAllowance({ address: address!, productId: productId! }),
    enabled: Boolean(nadoClient && address && productId !== undefined),
    refetchInterval: 15_000,
  });
}

/**
 * Approve (if needed) then deposit, as one mutation — waiting for the
 * approve transaction to actually be mined before submitting the deposit,
 * since depositCollateral's transferFrom needs the allowance to already be
 * on-chain. Running these as two independent mutations risked firing the
 * deposit before the approval landed.
 */
export function useDepositFlow() {
  const nadoClient = useNadoClient();
  const publicClient = usePublicClient();
  const { subaccountName } = useActiveSubaccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      amountRaw,
      needsApproval,
    }: {
      productId: number;
      amountRaw: bigint;
      needsApproval: boolean;
    }) => {
      if (!nadoClient || !publicClient) {
        throw new Error("Connect a wallet first.");
      }

      if (needsApproval) {
        const approveHash = await nadoClient.spot.approveAllowance({
          productId,
          amount: amountRaw,
        });
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
      }

      const depositHash = await nadoClient.spot.deposit({
        subaccountName,
        productId,
        amount: amountRaw,
      });
      await publicClient.waitForTransactionReceipt({ hash: depositHash });
      return depositHash;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subaccount-summary"] });
      queryClient.invalidateQueries({ queryKey: ["token-wallet-balance"] });
      queryClient.invalidateQueries({ queryKey: ["token-allowance"] });
    },
  });
}
