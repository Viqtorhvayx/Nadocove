import { useQuery } from "@tanstack/react-query";
import { readOnlyNadoClient } from "@/lib/nado-read-client";

/**
 * Real per-payment funding and interest history for a subaccount
 * (getInterestFundingPayments) — a ledger the Trade history table doesn't
 * show, since funding/interest accrue between fills rather than at them.
 */
export function useInterestFundingHistory(
  subaccountOwner: string | undefined,
  subaccountName: string,
  productIds: number[],
  limit = 200,
) {
  return useQuery({
    queryKey: ["interest-funding-history", subaccountOwner, subaccountName, productIds, limit],
    queryFn: () =>
      readOnlyNadoClient.context.indexerClient.getInterestFundingPayments({
        subaccount: { subaccountOwner: subaccountOwner!, subaccountName },
        productIds,
        limit,
      }),
    enabled: Boolean(subaccountOwner) && productIds.length > 0,
  });
}
