"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Card } from "@/components/card";
import { useIsSignedIn } from "@/lib/use-auth";
import { useClaimUsername, useUsername } from "@/lib/use-username";

export function UsernameClaimCard() {
  const { address } = useAccount();
  const isSignedIn = useIsSignedIn();
  const current = useUsername(address);
  const claim = useClaimUsername();
  const [value, setValue] = useState("");

  if (!address) return null;

  return (
    <Card title="Username" note="what other traders see instead of your address">
      {current.data && (
        <p className="mb-3 text-sm text-foreground-muted">
          Currently: <span className="font-mono text-foreground">@{current.data}</span>
        </p>
      )}
      {!isSignedIn ? (
        <p className="text-sm text-foreground-muted">
          Sign in above to claim or change your username.
        </p>
      ) : (
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!value) return;
            claim.mutate(value, { onSuccess: () => setValue("") });
          }}
        >
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={current.data ?? "your_handle"}
            className="flex-1 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-foreground"
          />
          <button
            type="submit"
            disabled={claim.isPending || value.length === 0}
            className="rounded-full bg-cove-indigo px-4 py-2 text-sm font-semibold text-background transition hover:bg-cove-indigo-dim disabled:opacity-50"
          >
            {claim.isPending ? "Claiming…" : "Claim"}
          </button>
        </form>
      )}
      {claim.isError && (
        <p className="mt-2 text-sm text-negative">
          {claim.error instanceof Error ? claim.error.message : "Failed to claim username."}
        </p>
      )}
      {claim.isSuccess && <p className="mt-2 text-sm text-positive">Username updated.</p>}
    </Card>
  );
}
