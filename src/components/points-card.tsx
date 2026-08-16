"use client";

import BigNumber from "bignumber.js";
import { Card } from "@/components/card";
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
        <p className="text-sm text-foreground-muted">Loading…</p>
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
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-foreground-muted">
                  Epoch {currentEpoch.epoch}
                </div>
                <div className="text-lg font-semibold text-foreground">
                  {formatPoints(currentEpoch.points)}
                </div>
              </div>
              <div>
                <div className="text-xs text-foreground-muted">Rank</div>
                <div className="text-lg font-semibold text-foreground">
                  #{currentEpoch.rank}
                </div>
              </div>
              <div>
                <div className="text-xs text-foreground-muted">
                  Epoch pool
                </div>
                <div className="text-lg font-semibold text-foreground">
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
            · rank #{points.data.allTimePoints.rank} · tier{" "}
            {points.data.allTimePoints.tier}
          </div>
        </div>
      )}
    </Card>
  );
}
