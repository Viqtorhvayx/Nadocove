"use client";

import BigNumber from "bignumber.js";
import { Card } from "@/components/card";
import { Skeleton } from "@/components/skeleton";
import { usePoints } from "@/lib/use-points";

function formatPoints(value: BigNumber | undefined) {
  if (!value) return "—";
  return value.integerValue(BigNumber.ROUND_FLOOR).toFormat();
}

export function PointsCard({ address }: { address: string | undefined }) {
  const points = usePoints(address);

  const epochs = points.data?.pointsPerEpoch ?? [];
  const currentEpoch = epochs.reduce<(typeof epochs)[number] | undefined>(
    (latest, epoch) =>
      !latest || epoch.startTime.gt(latest.startTime) ? epoch : latest,
    undefined,
  );

  return (
    <Card title="Points" note="Season 2">
      {points.isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      )}
      {points.isError && (
        <p className="text-sm text-negative">
          {points.error instanceof Error
            ? points.error.message
            : "Failed to load points."}
        </p>
      )}
      {points.data && (
        <div className="flex flex-col gap-4">
          {currentEpoch ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="min-w-0">
                <div className="text-xs text-foreground-muted">
                  Epoch {currentEpoch.epoch}
                </div>
                <div className="break-words text-lg font-semibold text-foreground">
                  {formatPoints(currentEpoch.points)}
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-xs text-foreground-muted">Rank</div>
                <div className="break-words text-lg font-semibold text-foreground">
                  {currentEpoch.rank}
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-xs text-foreground-muted">
                  Epoch pool
                </div>
                <div className="break-words text-lg font-semibold text-foreground">
                  {formatPoints(currentEpoch.totalPoints)}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-foreground-muted">
              No epoch activity yet.
            </p>
          )}

          <div className="border-t border-border pt-3 text-xs text-foreground-muted">
            All-time: {formatPoints(points.data.allTimePoints.points)} points
            · rank {points.data.allTimePoints.rank} · tier{" "}
            {points.data.allTimePoints.tier}
          </div>
        </div>
      )}
    </Card>
  );
}
