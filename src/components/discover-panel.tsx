"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import BigNumber from "bignumber.js";
import type { IndexerLeaderboardRankType } from "@nadohq/indexer-client";
import { Card } from "@/components/card";
import { formatAmount, formatUsd, truncateAddress } from "@/lib/format";
import { useAllContests, useContestLeaderboard } from "@/lib/use-competitions";

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

  const availableRankTypes = useMemo(
    () => selectedContest?.tracks.map((t) => t.rankType) ?? [],
    [selectedContest],
  );

  if (contests.isLoading) {
    return (
      <Card title="Discover">
        <p className="text-sm text-foreground-muted">Loading…</p>
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
          <p className="text-sm text-foreground-muted">Loading…</p>
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
              return (
                <Link
                  key={p.subaccount.subaccountOwner + p.subaccount.subaccountName}
                  href={`/u/${p.subaccount.subaccountOwner}`}
                  className="flex items-center justify-between gap-3 py-3 text-sm transition first:pt-0 last:pb-0 hover:text-cove-indigo"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-6 text-foreground-muted">
                      #{track?.rank.toString() ?? "—"}
                    </span>
                    <span className="font-mono text-foreground">
                      {twitter ? `@${twitter.username}` : truncateAddress(p.subaccount.subaccountOwner)}
                    </span>
                    {p.subaccount.subaccountName !== "default" && (
                      <span className="text-xs text-foreground-muted">
                        ({p.subaccount.subaccountName})
                      </span>
                    )}
                  </span>
                  <span className="text-foreground-muted">
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
