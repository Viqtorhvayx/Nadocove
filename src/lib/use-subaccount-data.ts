import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { useNadoClient } from "@/lib/use-nado-client";

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
