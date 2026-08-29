"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import BigNumber from "bignumber.js";
import type { IndexerLeaderboardRankType } from "@nadohq/indexer-client";
import { AddressAvatar } from "@/components/address-avatar";
import { Card } from "@/components/card";
import { Skeleton } from "@/components/skeleton";
import { formatAmount, formatUsd, pnlColorClass, truncateAddress } from "@/lib/format";
import { useAllContests, useContestLeaderboard } from "@/lib/use-competitions";
import { useUsernames } from "@/lib/use-username";

const RANK_MEDAL: Record<number, { bg: string; text: string }> = {
  1: { bg: "bg-[#F5B942]/15 ring-[#F5B942]/30", text: "text-[#F5B942]" },
  2: { bg: "bg-[#C7CCD8]/15 ring-[#C7CCD8]/30", text: "text-[#C7CCD8]" },
  3: { bg: "bg-[#C97C4B]/15 ring-[#C97C4B]/30", text: "text-[#C97C4B]" },
};

function RankBadge({ rank }: { rank: number | undefined }) {
  const medal = rank !== undefined ? RANK_MEDAL[rank] : undefined;
  if (medal) {
    return (
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-1 ${medal.bg} ${medal.text}`}
      >
        {rank}
      </span>
    );
  }
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center text-sm font-medium text-foreground-muted">
      {rank ?? "—"}
    </span>
  );
}

function trackValueColorClass(rankType: IndexerLeaderboardRankType, value: BigNumber): string {
  return rankType === "roi" || rankType === "pnl" ? pnlColorClass(value) : "text-foreground";
}

const RANK_TYPE_LABEL: Record<IndexerLeaderboardRankType, string> = {
  roi: "Highest ROI",
  volume: "Highest volume",
  pnl: "Highest PnL",
  balance: "Highest balance",
  liquidation: "Most liquidations",
};

function formatTrackValue(rankType: IndexerLeaderboardRankType, value: BigNumber): string {
  switch (rankType) {
    case "roi":
      return `${formatAmount(value, 2)}%`;
    case "volume":
    case "pnl":
    case "balance":
      return formatUsd(value, true);
    case "liquidation":
      return value.toFixed(0);
  }
}

export function DiscoverPanel() {
  const contests = useAllContests();
  const [contestId, setContestId] = useState<number | undefined>(undefined);
  const [rankType, setRankType] = useState<IndexerLeaderboardRankType | undefined>(undefined);

  const allContests = contests.data ?? [];
  // Default to the most recently ended/active contest until the user picks
  // one explicitly — derived during render rather than synced via an
  // effect, so there's no flash of empty state while contests are loading.
  const effectiveContestId = contestId ?? allContests[0]?.contestId;
  const selectedContest = allContests.find((c) => c.contestId === effectiveContestId);
  const effectiveRankType = rankType ?? selectedContest?.tracks[0]?.rankType;

  const leaderboard = useContestLeaderboard(effectiveContestId, effectiveRankType);
  const participantAddresses = useMemo(
    () => leaderboard.data?.participants.map((p) => p.subaccount.subaccountOwner) ?? [],
    [leaderboard.data],
  );
  const usernames = useUsernames(participantAddresses);

  const availableRankTypes = useMemo(
    () => selectedContest?.tracks.map((t) => t.rankType) ?? [],
    [selectedContest],
  );

  if (contests.isLoading) {
    return (
      <Card title="Discover">
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (contests.isError) {
    return (
      <Card title="Discover">
        <p className="text-sm text-negative">
          {contests.error instanceof Error ? contests.error.message : "Failed to load."}
        </p>
      </Card>
    );
  }

  if (allContests.length === 0) {
    return (
      <Card title="Discover">
        <p className="text-sm text-foreground-muted">
          No trading competitions have run yet — standings will show up here once one has.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card
        title="Top traders"
        note={selectedContest ? (selectedContest.active ? "live" : "final standings") : undefined}
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <select
            value={effectiveContestId ?? ""}
            onChange={(e) => {
              const id = Number(e.target.value);
              setContestId(id);
              setRankType(allContests.find((c) => c.contestId === id)?.tracks[0]?.rankType);
            }}
            className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-foreground"
          >
            {allContests.map((c) => (
              <option key={c.contestId} value={c.contestId}>
                {c.title}
              </option>
            ))}
          </select>

          <div className="flex gap-1">
            {availableRankTypes.map((rt) => (
              <button
                key={rt}
                type="button"
                onClick={() => setRankType(rt)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  effectiveRankType === rt
                    ? "border-cove-indigo text-cove-indigo"
                    : "border-border text-foreground-muted hover:text-foreground"
                }`}
              >
                {RANK_TYPE_LABEL[rt]}
              </button>
            ))}
          </div>
        </div>

        {leaderboard.isLoading && (
          <div className="flex flex-col gap-3">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        )}
        {leaderboard.isError && (
          <p className="text-sm text-negative">
            {leaderboard.error instanceof Error ? leaderboard.error.message : "Failed to load."}
          </p>
        )}
        {leaderboard.data && leaderboard.data.participants.length === 0 && (
          <p className="text-sm text-foreground-muted">No qualified participants yet.</p>
        )}
        {leaderboard.data && leaderboard.data.participants.length > 0 && effectiveRankType && (
          <div className="flex flex-col divide-y divide-border">
            {leaderboard.data.participants.map((p) => {
              const track = p.tracks[effectiveRankType];
              const twitter = p.socialAccounts.find((a) => a.provider === "twitter");
              const nadocoveUsername = usernames.data?.[p.subaccount.subaccountOwner.toLowerCase()];
              const claimedName = nadocoveUsername ? `@${nadocoveUsername}` : twitter ? `@${twitter.username}` : undefined;
              const displayName = claimedName ?? truncateAddress(p.subaccount.subaccountOwner);
              const rank = track?.rank !== undefined ? track.rank.toNumber() : undefined;
              return (
                <Link
                  key={p.subaccount.subaccountOwner + p.subaccount.subaccountName}
                  href={`/u/${p.subaccount.subaccountOwner}`}
                  className="group -mx-3 flex items-center justify-between gap-3 rounded-xl px-3 py-3 transition hover:bg-surface-raised"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <RankBadge rank={rank} />
                    <AddressAvatar address={p.subaccount.subaccountOwner} size={34} />
                    <span className="flex min-w-0 flex-col">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-medium text-foreground transition-colors group-hover:text-cove-indigo">
                          {displayName}
                        </span>
                        {p.subaccount.subaccountName !== "default" && (
                          <span className="shrink-0 rounded-full bg-surface-raised px-1.5 py-0.5 text-[10px] font-medium text-foreground-muted">
                            {p.subaccount.subaccountName}
                          </span>
                        )}
                      </span>
                      {claimedName && (
                        <span className="font-mono text-xs text-foreground-muted">
                          {truncateAddress(p.subaccount.subaccountOwner)}
                        </span>
                      )}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 text-right text-sm font-semibold ${
                      track ? trackValueColorClass(effectiveRankType, track.value) : "text-foreground-muted"
                    }`}
                  >
                    {track ? formatTrackValue(effectiveRankType, track.value) : "—"}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
