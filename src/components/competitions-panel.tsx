"use client";

import { useState } from "react";
import { Card } from "@/components/card";
import { formatAmount, truncateAddress } from "@/lib/format";
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
        <p className="text-sm text-foreground-muted">Loading…</p>
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
              className={`flex items-center justify-between py-3 text-left text-sm transition first:pt-0 last:pb-0 ${
                selectedContestId === contest.contestId
                  ? "text-cove-indigo"
                  : "text-foreground hover:text-cove-indigo"
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
          {leaderboard.isLoading && (
            <p className="text-sm text-foreground-muted">Loading…</p>
          )}
          {leaderboard.isError && (
            <p className="text-sm text-negative">
              {leaderboard.error instanceof Error
                ? leaderboard.error.message
                : "Failed to load."}
            </p>
          )}
          {leaderboard.data && leaderboard.data.participants.length === 0 && (
            <p className="text-sm text-foreground-muted">No participants yet.</p>
          )}
          {leaderboard.data && leaderboard.data.participants.length > 0 && (
            <div className="flex flex-col divide-y divide-border">
              {leaderboard.data.participants.map((p, i) => {
                const track = defaultRankType ? p.tracks[defaultRankType] : undefined;
                return (
                  <div
                    key={p.subaccount.subaccountOwner + p.subaccount.subaccountName}
                    className="flex items-center justify-between py-2.5 text-sm first:pt-0 last:pb-0"
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-6 text-foreground-muted">#{i + 1}</span>
                      <span className="font-mono text-foreground">
                        {truncateAddress(p.subaccount.subaccountOwner)}
                      </span>
                    </span>
                    <span className="text-foreground-muted">
                      {track ? formatAmount(track.value, 2) : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
