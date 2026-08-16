"use client";

import { useAccount } from "wagmi";
import { Logo } from "@/components/logo";
import { ConnectButton } from "@/components/connect-button";
import { Card } from "@/components/card";
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

          <Card
            title="Points & Season 2 pool"
            note="coming next"
            className="border-dashed"
          >
            <p className="text-sm text-foreground-muted">
              Season 2&apos;s weekly points pool scales 300K–950K with
              protocol volume. Wiring this card up to your live share
              requires confirming the indexer&apos;s points route — tracked
              as a follow-up. In the meantime,{" "}
              <a
                href="https://docs.nado.xyz/incentives-and-rewards/points/season-2-live"
                target="_blank"
                rel="noreferrer"
                className="underline decoration-border underline-offset-2 hover:text-foreground"
              >
                see the Season 2 docs
              </a>
              .
            </p>
          </Card>

          <Card title="Trade" note="coming next" className="border-dashed">
            <p className="text-sm text-foreground-muted">
              Order entry ships here next, tagged with NadoCove&apos;s
              Builder ID so every trade placed from this dashboard earns
              builder fees automatically.
            </p>
          </Card>
        </main>
      )}
    </div>
  );
}
