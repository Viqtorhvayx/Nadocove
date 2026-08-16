import { useQuery } from "@tanstack/react-query";
import { isAddress } from "viem";
import { readOnlyNadoClient } from "@/lib/nado-read-client";
import { DEFAULT_SUBACCOUNT_NAME } from "@/lib/subaccount-constants";

/**
 * Real subaccount names an address has actually used, via the indexer's
 * listSubaccounts. "default" is always included even if unused yet, since
 * it's the canonical starting subaccount every flow in this app assumes.
 */
export function useListSubaccounts(address: string | undefined) {
  const validAddress = address && isAddress(address) ? address : undefined;

  const query = useQuery({
    queryKey: ["list-subaccounts", validAddress],
    queryFn: () =>
      readOnlyNadoClient.context.indexerClient.listSubaccounts({
        address: validAddress!,
        limit: 50,
      }),
    enabled: Boolean(validAddress),
    staleTime: 30_000,
  });

  const names = new Set([DEFAULT_SUBACCOUNT_NAME]);
  for (const sub of query.data ?? []) names.add(sub.subaccountName);

  return { ...query, names: Array.from(names) };
}
