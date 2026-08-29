import { useQuery } from "@tanstack/react-query";
import { isAddress, type Address } from "viem";
import { readOnlyNadoClient } from "@/lib/nado-read-client";

/**
 * Real "XPoints" data (getXPoints, query type "nado_xpoints") — verified
 * live against Nado's indexer, and distinct from the existing "Points"
 * (getPoints/"nado_points", Season 2) shown in PointsCard: separate
 * weekly epochs, its own rank, and a per-quest breakdown (e.g.
 * ProtocolDepositBoost, ProtocolTieredVolumeBoost) the other system
 * doesn't have.
 */
export function useXPoints(address: string | undefined) {
  const validAddress = address && isAddress(address) ? (address as Address) : undefined;

  return useQuery({
    queryKey: ["xpoints", validAddress],
    queryFn: () => readOnlyNadoClient.context.indexerClient.getXPoints({ address: validAddress! }),
    enabled: Boolean(validAddress),
    staleTime: 30_000,
  });
}
