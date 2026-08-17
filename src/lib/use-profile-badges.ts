import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { isAddress, type Address } from "viem";
import type { IndexerLeaderboardRankType } from "@nadohq/indexer-client";
import { readOnlyNadoClient } from "@/lib/nado-read-client";
import { useAllContests } from "@/lib/use-competitions";

/** The one social account Nado itself lets a trader link — real, not local. */
export function useSocialAccount(address: string | undefined) {
  const validAddress = address && isAddress(address) ? (address as Address) : undefined;

  return useQuery({
    queryKey: ["social-accounts", validAddress],
    queryFn: async () => {
      const res = await readOnlyNadoClient.context.indexerClient.listSocialAccounts({
        address: validAddress!,
      });
      // React Query rejects a queryFn returning undefined outright — null
      // is the correct "no linked account" value here.
      return res.accounts.find((a) => a.provider === "twitter") ?? null;
    },
    enabled: Boolean(validAddress),
    staleTime: 60_000,
  });
}

export type LeaderboardPlacement = {
  contestId: number;
  contestTitle: string;
  rankType: IndexerLeaderboardRankType;
  rank: number;
  totalParticipants: number;
};

/**
 * Every qualified leaderboard placement this address has across every
 * contest Nado has run — computed straight from getLeaderboardParticipant,
 * not a fabricated "reputation score." Sorted best-percentile-first.
 */
export function useLeaderboardPlacements(address: string | undefined, subaccountName: string) {
  const validAddress = address && isAddress(address) ? (address as Address) : undefined;
  const contests = useAllContests();
  const contestIds = useMemo(() => contests.data?.map((c) => c.contestId) ?? [], [contests.data]);

  const participant = useQuery({
    queryKey: ["leaderboard-participant", validAddress, subaccountName, contestIds],
    queryFn: () =>
      readOnlyNadoClient.context.indexerClient.getLeaderboardParticipant({
        contestIds,
        subaccount: { subaccountOwner: validAddress!, subaccountName },
      }),
    enabled: Boolean(validAddress) && contestIds.length > 0,
  });

  return useMemo((): LeaderboardPlacement[] => {
    if (!participant.data || !contests.data) return [];
    const placements: LeaderboardPlacement[] = [];
    for (const [contestIdStr, p] of Object.entries(participant.data.participant)) {
      const contest = contests.data.find((c) => c.contestId === Number(contestIdStr));
      if (!contest) continue;
      for (const [rankType, track] of Object.entries(p.tracks)) {
        if (!track || track.qualificationStatus !== "qualified") continue;
        placements.push({
          contestId: contest.contestId,
          contestTitle: contest.title,
          rankType: rankType as IndexerLeaderboardRankType,
          rank: track.rank.toNumber(),
          totalParticipants: contest.totalParticipants.toNumber(),
        });
      }
    }
    return placements.sort(
      (a, b) => a.rank / a.totalParticipants - b.rank / b.totalParticipants,
    );
  }, [participant.data, contests.data]);
}
