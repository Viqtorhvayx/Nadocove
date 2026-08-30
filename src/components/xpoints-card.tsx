"use client";

import BigNumber from "bignumber.js";
import { Card } from "@/components/card";
import { Skeleton } from "@/components/skeleton";
import { useXPoints } from "@/lib/use-xpoints";

function formatPoints(value: BigNumber | undefined) {
  if (!value) return "—";
  return value.integerValue(BigNumber.ROUND_FLOOR).toFormat();
}

export function XPointsCard({ address }: { address: string | undefined }) {
  const xpoints = useXPoints(address);

  const epochs = xpoints.data?.pointsPerEpoch ?? [];
  const currentEpoch = epochs.reduce<(typeof epochs)[number] | undefined>(
    (latest, epoch) => (!latest || epoch.startTime.gt(latest.startTime) ? epoch : latest),
    undefined,
  );

  return (
    <Card title="XPoints" note="quest-based rewards">
      {xpoints.isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      )}
      {xpoints.isError && (
        <p className="text-sm text-negative">
          {xpoints.error instanceof Error ? xpoints.error.message : "Failed to load."}
        </p>
      )}
      {xpoints.data && (
        <div className="flex flex-col gap-4">
          {currentEpoch ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="min-w-0">
                  <div className="text-xs text-foreground-muted">{currentEpoch.description}</div>
                  <div className="break-words text-lg font-semibold text-foreground">
                    {formatPoints(currentEpoch.totalPoints)}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-foreground-muted">Rank</div>
                  <div className="break-words text-lg font-semibold text-foreground">{currentEpoch.rank}</div>
                </div>
              </div>

              {currentEpoch.quests.length > 0 && (
                <div className="flex flex-col gap-1.5 border-t border-border pt-3">
                  {currentEpoch.quests.map((quest) => (
                    <div key={quest.questType} className="flex items-center justify-between text-xs">
                      <span className="text-foreground-muted">{quest.questType}</span>
                      <span className="font-medium tabular-nums text-foreground">{formatPoints(quest.points)}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-foreground-muted">No epoch activity yet.</p>
          )}

          <div className="border-t border-border pt-3 text-xs text-foreground-muted">
            All-time: {formatPoints(xpoints.data.allTimePoints.totalPoints)} points · rank{" "}
            {xpoints.data.allTimePoints.rank}
          </div>
        </div>
      )}
    </Card>
  );
}
