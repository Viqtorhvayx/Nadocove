"use client";

import { useAccount } from "wagmi";
import { Logo } from "@/components/logo";
import { ConnectButton } from "@/components/connect-button";
import { Card } from "@/components/card";
import { TradePanel } from "@/components/trade-panel";
import { PointsCard } from "@/components/points-card";
import { ClaimBuilderFeeCard } from "@/components/claim-builder-fee-card";
import { safeStringify } from "@/lib/json";
import {
  DEFAULT_SUBACCOUNT_NAME,
  useSubaccountFeeRates,
  useSubaccountSummary,
} from "@/lib/use-subaccount-data";

function DataCard({
  title,
  note,
  query,
}: {
  title: string;
  note?: string;
  query: { isLoading: boolean; isError: boolean; error: unknown; data: unknown };
}) {
  return (
    <Card title={title} note={note}>
      {query.isLoading && (
        <p className="text-sm text-foreground-muted">Loading…</p>
      )}
      {query.isError && (
        <p className="text-sm text-negative">
          {query.error instanceof Error
            ? query.error.message
            : "Failed to load."}
        </p>
      )}
      {!query.isLoading && !query.isError && (
        <pre className="max-h-64 overflow-auto rounded-lg bg-surface-raised p-3 text-xs text-foreground-muted">
          {safeStringify(query.data)}
        </pre>
      )}
    </Card>
  );
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const summary = useSubaccountSummary();
  const feeRates = useSubaccountFeeRates();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6">
      <header className="flex items-center justify-between py-6">
        <Logo size={24} />
        <ConnectButton />
      </header>

      {!isConnected && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
          <h1 className="text-2xl font-semibold text-foreground">
            Connect your wallet to view your dashboard
          </h1>
          <p className="max-w-sm text-sm text-foreground-muted">
            NadoCove reads your Nado account directly from the chain and the
            engine — nothing is stored, and we never take custody of funds.
          </p>
          <ConnectButton className="mt-2 px-6 py-3 text-base" />
        </div>
      )}

      {isConnected && address && (
        <main className="flex flex-1 flex-col gap-6 pb-16">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <DataCard
              title="Subaccount summary"
              note={`"${DEFAULT_SUBACCOUNT_NAME}"`}
              query={summary}
            />
            <DataCard title="Fee tier" query={feeRates} />
          </div>

          <PointsCard address={address} />

          <TradePanel />

          <ClaimBuilderFeeCard />
        </main>
      )}
    </div>
  );
}
