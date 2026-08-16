import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import BigNumber from "bignumber.js";
import {
  addDecimals,
  nowInSeconds,
  packOrderAppendix,
  type OrderExecutionType,
} from "@nadohq/shared";
import { useNadoClient } from "@/lib/use-nado-client";
import { BUILDER_ID, BUILDER_FEE_RATE } from "@/lib/builder";

export const DEFAULT_SUBACCOUNT_NAME = "default";

export function useSubaccountSummary() {
  const { address } = useAccount();
  const nadoClient = useNadoClient();

  return useQuery({
    queryKey: ["subaccount-summary", address, DEFAULT_SUBACCOUNT_NAME],
    queryFn: () =>
      nadoClient!.subaccount.getSubaccountSummary({
        subaccountOwner: address!,
        subaccountName: DEFAULT_SUBACCOUNT_NAME,
      }),
    enabled: Boolean(nadoClient && address),
    refetchInterval: 15_000,
  });
}

export function useSubaccountFeeRates() {
  const { address } = useAccount();
  const nadoClient = useNadoClient();

  return useQuery({
    queryKey: ["subaccount-fee-rates", address, DEFAULT_SUBACCOUNT_NAME],
    queryFn: () =>
      nadoClient!.subaccount.getSubaccountFeeRates({
        subaccountOwner: address!,
        subaccountName: DEFAULT_SUBACCOUNT_NAME,
      }),
    enabled: Boolean(nadoClient && address),
    refetchInterval: 30_000,
  });
}

export function useSymbols() {
  const nadoClient = useNadoClient();

  return useQuery({
    queryKey: ["symbols"],
    queryFn: () => nadoClient!.market.getSymbols(),
    enabled: Boolean(nadoClient),
    staleTime: 60_000,
  });
}

type PlaceOrderInput = {
  productId: number;
  side: "buy" | "sell";
  amount: string; // human units, e.g. "0.01"
  price: string; // human units, e.g. "80000"
  executionType: OrderExecutionType;
  expirySeconds?: number;
};

export function usePlaceOrder() {
  const { address } = useAccount();
  const nadoClient = useNadoClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      side,
      amount,
      price,
      executionType,
      expirySeconds = 60,
    }: PlaceOrderInput) => {
      if (!nadoClient || !address) {
        throw new Error("Connect a wallet first.");
      }

      const signedAmount = new BigNumber(amount).times(
        side === "buy" ? 1 : -1,
      );

      const appendix = packOrderAppendix({
        orderExecutionType: executionType,
        builder:
          BUILDER_ID > 0
            ? { builderId: BUILDER_ID, builderFeeRate: BUILDER_FEE_RATE }
            : undefined,
      });

      return nadoClient.market.placeOrder({
        order: {
          subaccountName: DEFAULT_SUBACCOUNT_NAME,
          expiration: nowInSeconds() + expirySeconds,
          appendix,
          price,
          amount: addDecimals(signedAmount, 18),
        },
        productId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subaccount-summary"] });
      queryClient.invalidateQueries({ queryKey: ["open-orders"] });
    },
  });
}

export function useOpenOrders(productId: number | undefined) {
  const { address } = useAccount();
  const nadoClient = useNadoClient();

  return useQuery({
    queryKey: ["open-orders", address, DEFAULT_SUBACCOUNT_NAME, productId],
    queryFn: () =>
      nadoClient!.market.getOpenSubaccountOrders({
        subaccountOwner: address!,
        subaccountName: DEFAULT_SUBACCOUNT_NAME,
        productId: productId!,
      }),
    enabled: Boolean(nadoClient && address && productId !== undefined),
    refetchInterval: 10_000,
  });
}

export function useCancelOrder() {
  const nadoClient = useNadoClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      digest,
      productId,
    }: {
      digest: string;
      productId: number;
    }) => {
      if (!nadoClient) throw new Error("Connect a wallet first.");
      return nadoClient.market.cancelOrders({
        digests: [digest],
        productIds: [productId],
        subaccountName: DEFAULT_SUBACCOUNT_NAME,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["open-orders"] });
    },
  });
}
