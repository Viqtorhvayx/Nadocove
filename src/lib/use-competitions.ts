import { useQuery } from "@tanstack/react-query";
import type { IndexerLeaderboardRankType } from "@nadohq/indexer-client";
import { readOnlyNadoClient } from "@/lib/nado-read-client";

export function useActiveContests() {
  return useQuery({
    queryKey: ["leaderboard-contests"],
    queryFn: () =>
      readOnlyNadoClient.context.indexerClient.getLeaderboardContests({
        active: true,
      }),
    staleTime: 60_000,
  });
}

export function useContestLeaderboard(
  contestId: number | undefined,
  rankType: IndexerLeaderboardRankType | undefined,
) {
  return useQuery({
    queryKey: ["leaderboard", contestId, rankType],
    queryFn: () =>
      readOnlyNadoClient.context.indexerClient.getLeaderboard({
        contestId: contestId!,
        rankType,
        limit: 25,
      }),
    enabled: contestId !== undefined,
  });
}
