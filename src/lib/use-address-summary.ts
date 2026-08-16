import { useQuery } from "@tanstack/react-query";
import { isAddress, type Address } from "viem";
import { readOnlyNadoClient } from "@/lib/nado-read-client";
import { DEFAULT_SUBACCOUNT_NAME } from "@/lib/use-subaccount-data";

export function useAddressSummary(address: string | undefined) {
  const validAddress = address && isAddress(address) ? (address as Address) : undefined;

  return useQuery({
    queryKey: ["address-summary", validAddress, DEFAULT_SUBACCOUNT_NAME],
    queryFn: () =>
      readOnlyNadoClient.subaccount.getSubaccountSummary({
        subaccountOwner: validAddress!,
        subaccountName: DEFAULT_SUBACCOUNT_NAME,
      }),
    enabled: Boolean(validAddress),
  });
}

export function useAddressFeeRates(address: string | undefined) {
  const validAddress = address && isAddress(address) ? (address as Address) : undefined;

  return useQuery({
    queryKey: ["address-fee-rates", validAddress, DEFAULT_SUBACCOUNT_NAME],
    queryFn: () =>
      readOnlyNadoClient.subaccount.getSubaccountFeeRates({
        subaccountOwner: validAddress!,
        subaccountName: DEFAULT_SUBACCOUNT_NAME,
      }),
    enabled: Boolean(validAddress),
  });
}
