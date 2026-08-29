import { useQuery } from "@tanstack/react-query";
import { isAddress, type Address } from "viem";
import { readOnlyNadoClient } from "@/lib/nado-read-client";
import { DEFAULT_SUBACCOUNT_NAME } from "@/lib/subaccount-constants";
import { rescaleSubaccountSummary } from "@/lib/rescale-subaccount-summary";

export function useAddressSummary(
  address: string | undefined,
  subaccountName: string = DEFAULT_SUBACCOUNT_NAME,
) {
  const validAddress = address && isAddress(address) ? (address as Address) : undefined;

  return useQuery({
    queryKey: ["address-summary", validAddress, subaccountName],
    queryFn: () =>
      readOnlyNadoClient.subaccount.getSubaccountSummary({
        subaccountOwner: validAddress!,
        subaccountName,
      }),
    select: rescaleSubaccountSummary,
    enabled: Boolean(validAddress),
  });
}

export function useAddressFeeRates(
  address: string | undefined,
  subaccountName: string = DEFAULT_SUBACCOUNT_NAME,
) {
  const validAddress = address && isAddress(address) ? (address as Address) : undefined;

  return useQuery({
    queryKey: ["address-fee-rates", validAddress, subaccountName],
    queryFn: () =>
      readOnlyNadoClient.subaccount.getSubaccountFeeRates({
        subaccountOwner: validAddress!,
        subaccountName,
      }),
    enabled: Boolean(validAddress),
  });
}
