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

/**
 * All contests, active or ended — used by Discover, which shows the most
 * recent contest's standings even when nothing is currently running rather
 * than going blank between competitions.
 */
export function useAllContests() {
  return useQuery({
    queryKey: ["leaderboard-contests", "all"],
    queryFn: () => readOnlyNadoClient.context.indexerClient.getLeaderboardContests({}),
    staleTime: 60_000,
    select: (data) =>
      [...data.contests].sort((a, b) => b.endTime.comparedTo(a.endTime) ?? 0),
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
