import { useQuery } from "@tanstack/react-query";
import { readOnlyNadoClient } from "@/lib/nado-read-client";

export function useMatchHistory(
  subaccountOwner: string | undefined,
  subaccountName: string,
  limit = 50,
) {
  return useQuery({
    queryKey: ["match-history", subaccountOwner, subaccountName, limit],
    queryFn: () =>
      readOnlyNadoClient.context.indexerClient.getMatchEvents({
        subaccounts: [{ subaccountOwner: subaccountOwner!, subaccountName }],
        limit,
      }),
    enabled: Boolean(subaccountOwner),
  });
}
