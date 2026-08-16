"use client";

import { isAddress } from "viem";
import { Logo } from "@/components/logo";
import { ConnectButton } from "@/components/connect-button";
import { Card } from "@/components/card";
import { PointsCard } from "@/components/points-card";
import { safeStringify } from "@/lib/json";
import { useAddressSummary, useAddressFeeRates } from "@/lib/use-address-summary";

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function AddressProfile({ address }: { address: string }) {
  const summary = useAddressSummary(address);
  const feeRates = useAddressFeeRates(address);

  if (!isAddress(address)) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6">
        <header className="flex items-center justify-between py-6">
          <Logo size={24} />
          <ConnectButton />
        </header>
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-24 text-center">
          <h1 className="text-2xl font-semibold text-foreground">
            Not a valid address
          </h1>
          <p className="text-sm text-foreground-muted">
            &quot;{address}&quot; doesn&apos;t look like an EVM address.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6">
      <header className="flex items-center justify-between py-6">
        <Logo size={24} />
        <ConnectButton />
      </header>

      <main className="flex flex-1 flex-col gap-6 pb-16">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
            Public profile · read-only
          </span>
          <h1 className="font-mono text-2xl font-semibold text-foreground">
            {truncateAddress(address)}
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Card title="Subaccount summary" note='"default"'>
            {summary.isLoading && (
              <p className="text-sm text-foreground-muted">Loading…</p>
            )}
            {summary.isError && (
              <p className="text-sm text-negative">
                {summary.error instanceof Error
                  ? summary.error.message
                  : "Failed to load."}
              </p>
            )}
            {summary.data !== undefined && (
              <pre className="max-h-64 overflow-auto rounded-lg bg-surface-raised p-3 text-xs text-foreground-muted">
                {safeStringify(summary.data)}
              </pre>
            )}
          </Card>

          <Card title="Fee tier">
            {feeRates.isLoading && (
              <p className="text-sm text-foreground-muted">Loading…</p>
            )}
            {feeRates.isError && (
              <p className="text-sm text-negative">
                {feeRates.error instanceof Error
                  ? feeRates.error.message
                  : "Failed to load."}
              </p>
            )}
            {feeRates.data !== undefined && (
              <pre className="max-h-64 overflow-auto rounded-lg bg-surface-raised p-3 text-xs text-foreground-muted">
                {safeStringify(feeRates.data)}
              </pre>
            )}
          </Card>
        </div>

        <PointsCard address={address} />

        <Card title="Want a dashboard like this for your own account?" className="border-dashed">
          <p className="text-sm text-foreground-muted">
            Connect your wallet to see your own portfolio, trade, and make
            your profile shareable too.
          </p>
          <ConnectButton className="mt-4 px-6 py-2.5" />
        </Card>
      </main>
    </div>
  );
}
