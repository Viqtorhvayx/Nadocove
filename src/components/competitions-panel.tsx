"use client";

import { useState } from "react";
import { Card } from "@/components/card";
import { LeaderboardList } from "@/components/leaderboard-list";
import { Skeleton } from "@/components/skeleton";
import { useActiveContests, useContestLeaderboard } from "@/lib/use-competitions";

export function CompetitionsPanel() {
  const contests = useActiveContests();
  const [selectedContestId, setSelectedContestId] = useState<number | undefined>();

  const activeContests = contests.data?.contests ?? [];
  const selectedContest = activeContests.find((c) => c.contestId === selectedContestId);
  const defaultRankType = selectedContest?.tracks[0]?.rankType;

  const leaderboard = useContestLeaderboard(selectedContestId, defaultRankType);

  if (contests.isLoading) {
    return (
      <Card title="Trading competitions">
        <div className="flex flex-col gap-3">
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (contests.isError) {
    return (
      <Card title="Trading competitions">
        <p className="text-sm text-negative">
          {contests.error instanceof Error ? contests.error.message : "Failed to load."}
        </p>
      </Card>
    );
  }

  if (activeContests.length === 0) {
    return (
      <Card title="Trading competitions">
        <p className="text-sm text-foreground-muted">
          No active competitions right now — check back later.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card title="Active competitions">
        <div className="flex flex-col divide-y divide-border">
          {activeContests.map((contest) => (
            <button
              key={contest.contestId}
              type="button"
              onClick={() => setSelectedContestId(contest.contestId)}
              className={`-mx-2 flex items-center justify-between rounded-lg px-2 py-3 text-left text-sm transition ${
                selectedContestId === contest.contestId
                  ? "bg-surface-raised text-cove-indigo"
                  : "text-foreground hover:bg-surface-raised hover:text-cove-indigo"
              }`}
            >
              <span>
                <span className="font-medium">{contest.title}</span>
                <span className="ml-2 text-xs text-foreground-muted">
                  {contest.totalParticipants.toString()} participants
                </span>
              </span>
              <span className="text-xs text-foreground-muted">
                View leaderboard →
              </span>
            </button>
          ))}
        </div>
      </Card>

      {selectedContestId !== undefined && (
        <Card title="Leaderboard" note={selectedContest?.title}>
          <LeaderboardList
            participants={leaderboard.data?.participants}
            rankType={defaultRankType}
            isLoading={leaderboard.isLoading}
            isError={leaderboard.isError}
            error={leaderboard.error}
            paginationKey={`${selectedContestId}-${defaultRankType}`}
          />
        </Card>
      )}
    </div>
  );
}
