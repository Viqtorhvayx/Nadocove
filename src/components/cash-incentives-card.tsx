"use client";

import { Card } from "@/components/card";
import { Skeleton } from "@/components/skeleton";
import { formatUsd } from "@/lib/format";
import { useCashIncentives, useClaimCashIncentives } from "@/lib/use-cash-incentives";

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  claimable: { label: "Claimable", className: "bg-positive/10 text-positive" },
  in_progress: { label: "In progress", className: "bg-cove-indigo/10 text-cove-indigo" },
  pending: { label: "Pending", className: "bg-surface-raised text-foreground-muted" },
  no_reward: { label: "No reward", className: "bg-surface-raised text-foreground-muted" },
};

const EVENTS_SHOWN = 5;

/**
 * Real weekly trading-volume cash-incentive campaigns — verified live
 * against Nado's indexer (see use-cash-incentives.ts). Distinct from
 * Points and the Builder fee claim: this is a separate reward program
 * with its own airdrop-contract claim path.
 */
export function CashIncentivesCard({ address }: { address: string | undefined }) {
  const incentives = useCashIncentives(address);
  const claim = useClaimCashIncentives();

  const events = [...(incentives.data?.events ?? [])].sort(
    (a, b) => (b.metadata.epochStart.comparedTo(a.metadata.epochStart) ?? 0),
  );
  const claimableCount = events.filter((e) => e.wallet.claim.status === "claimable").length;

  return (
    <Card title="Cash incentives" note="weekly volume rewards">
      {incentives.isLoading && (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      )}
      {incentives.isError && (
        <p className="text-sm text-negative">
          {incentives.error instanceof Error ? incentives.error.message : "Failed to load."}
        </p>
      )}
      {incentives.data && events.length === 0 && (
        <p className="text-sm text-foreground-muted">No cash incentive campaigns yet.</p>
      )}

      {incentives.data && events.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-foreground-muted">Total reward</div>
              <div className="text-lg font-semibold text-foreground">
                {formatUsd(incentives.data.walletSummary.totalReward)}
              </div>
            </div>
            <div>
              <div className="text-xs text-foreground-muted">Claimable now</div>
              <div className="text-lg font-semibold text-positive">
                {formatUsd(incentives.data.walletSummary.claimableReward)}
              </div>
            </div>
          </div>

          {claimableCount > 0 && (
            <button
              type="button"
              onClick={() => claim.mutate()}
              disabled={claim.isPending}
              className="btn-tactile-primary rounded-full px-5 py-2 text-sm font-semibold text-background disabled:opacity-50"
            >
              {claim.isPending ? "Claiming…" : `Claim ${claimableCount} reward${claimableCount > 1 ? "s" : ""}`}
            </button>
          )}
          {claim.isError && (
            <p className="text-sm text-negative">{claim.error instanceof Error ? claim.error.message : "Claim failed."}</p>
          )}
          {claim.isSuccess && <p className="text-sm text-positive">Claim submitted: {claim.data}</p>}

          <div className="flex flex-col divide-y divide-border border-t border-border pt-1">
            {events.slice(0, EVENTS_SHOWN).map((event) => {
              const status = STATUS_LABEL[event.wallet.claim.status] ?? STATUS_LABEL.no_reward;
              const progressPct = event.metadata.maxVolume.isZero()
                ? 0
                : Math.min(100, event.platform.platformVolume.div(event.metadata.maxVolume).times(100).toNumber());
              return (
                <div key={event.metadata.eventId} className="flex flex-col gap-1.5 py-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{event.metadata.description}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${status.className}`}>{status.label}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
                    <div className="h-full rounded-full bg-cove-indigo" style={{ width: `${progressPct}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-foreground-muted">
                    <span>Platform reward pool unlocked: {formatUsd(event.platform.unlockedReward)} of {formatUsd(event.metadata.maxReward)}</span>
                    <span className="font-medium text-foreground">Your reward: {formatUsd(event.wallet.reward)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
