"use client";

import { useMemo, useState } from "react";
import type { IndexerLeaderboardContest, IndexerLeaderboardRankType } from "@nadohq/indexer-client";
import { Card } from "@/components/card";
import { LeaderboardList } from "@/components/leaderboard-list";
import { Skeleton } from "@/components/skeleton";
import { formatRelativeTime } from "@/lib/format";
import { useAllContests, useContestLeaderboard } from "@/lib/use-competitions";

const RANK_TYPE_LABEL: Record<IndexerLeaderboardRankType, string> = {
  roi: "Highest ROI",
  volume: "Highest volume",
  pnl: "Highest PnL",
  balance: "Highest balance",
  liquidation: "Most liquidations",
};

function ContestStatusBadge({ contest }: { contest: IndexerLeaderboardContest }) {
  if (contest.active) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-positive/10 px-2.5 py-1 text-xs font-medium text-positive">
        <span className="h-1.5 w-1.5 rounded-full bg-positive" />
        Live
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-surface-raised px-2.5 py-1 text-xs font-medium text-foreground-muted">
      <span className="h-1.5 w-1.5 rounded-full bg-foreground-muted" />
      Ended {formatRelativeTime(contest.endTime.toNumber())}
    </span>
  );
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
      <Card title="Top traders">
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

          {selectedContest && <ContestStatusBadge contest={selectedContest} />}

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

        <LeaderboardList
          participants={leaderboard.data?.participants}
          rankType={effectiveRankType}
          isLoading={leaderboard.isLoading}
          isError={leaderboard.isError}
          error={leaderboard.error}
          emptyMessage="No qualified participants yet."
          paginationKey={`${effectiveContestId}-${effectiveRankType}`}
        />
      </Card>
    </div>
  );
}
