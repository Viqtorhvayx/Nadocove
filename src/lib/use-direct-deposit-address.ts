import { useQuery } from "@tanstack/react-query";
import { readOnlyNadoClient } from "@/lib/nado-read-client";

/**
 * Real per-subaccount Direct Deposit Address (getSubaccountDDA) — a
 * dedicated address that credits this subaccount directly, verified live
 * against Nado's indexer. Which chains/assets it actually accepts isn't
 * documented anywhere in this SDK, so the UI doesn't claim specifics
 * beyond what the response itself proves: the address exists and is
 * unique to this subaccount.
 */
export function useDirectDepositAddress(subaccountOwner: string | undefined, subaccountName: string) {
  return useQuery({
    queryKey: ["direct-deposit-address", subaccountOwner, subaccountName],
    queryFn: () =>
      readOnlyNadoClient.context.indexerClient.getSubaccountDDA({
        subaccount: { subaccountOwner: subaccountOwner!, subaccountName },
      }),
    select: (data) => data.address,
    enabled: Boolean(subaccountOwner),
  });
}
