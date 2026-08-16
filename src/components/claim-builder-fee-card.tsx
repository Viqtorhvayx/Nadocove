"use client";

import { Card } from "@/components/card";
import { useClaimBuilderFee } from "@/lib/use-claim-builder-fee";
import { BUILDER_ID } from "@/lib/builder";

export function ClaimBuilderFeeCard() {
  const claim = useClaimBuilderFee();

  if (BUILDER_ID <= 0) return null;

  return (
    <Card title="Builder fees" note={`Builder #${BUILDER_ID}`}>
      <p className="text-sm text-foreground-muted">
        Claims accumulated fees from trades routed through NadoCove into
        this builder&apos;s subaccount. There&apos;s no verified way to
        preview the amount first — see the code comment for why.
      </p>
      <button
        type="button"
        onClick={() => claim.mutate()}
        disabled={claim.isPending}
        className="mt-4 rounded-full border border-border px-5 py-2 text-sm font-semibold text-foreground transition hover:border-cove-teal-dim disabled:opacity-50"
      >
        {claim.isPending ? "Claiming…" : "Claim builder fees"}
      </button>
      {claim.isError && (
        <p className="mt-3 text-sm text-negative">
          {claim.error instanceof Error ? claim.error.message : "Claim failed."}
        </p>
      )}
      {claim.isSuccess && (
        <p className="mt-3 text-sm text-positive">
          Claim submitted: {claim.data}
        </p>
      )}
    </Card>
  );
}
