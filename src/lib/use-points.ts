import { useQuery } from "@tanstack/react-query";
import { isAddress, type Address } from "viem";
import { readOnlyNadoClient } from "@/lib/nado-read-client";

// Points are read-only and don't require signing, so this always uses the
// read-only client — works on the dashboard before a wallet finishes
// connecting, and on public profile pages with no wallet at all.
export function usePoints(address: string | undefined) {
  const validAddress = address && isAddress(address) ? (address as Address) : undefined;

  return useQuery({
    queryKey: ["points", validAddress],
    queryFn: () =>
      readOnlyNadoClient.context.indexerClient.getPoints({
        address: validAddress!,
      }),
    enabled: Boolean(validAddress),
    staleTime: 30_000,
  });
}
