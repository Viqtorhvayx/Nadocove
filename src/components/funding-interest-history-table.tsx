"use client";

import { useMemo } from "react";
import type { IndexerProductPayment } from "@nadohq/indexer-client";
import { Card } from "@/components/card";
import { Skeleton } from "@/components/skeleton";
import { PairIcon } from "@/components/token-icon";
import { formatPercent, formatRelativeTime, formatSignedUsd, pnlColorClass } from "@/lib/format";
import { useSymbolMap } from "@/lib/use-symbol-map";
import { useSymbols } from "@/lib/use-subaccount-data";
import { useInterestFundingHistory } from "@/lib/use-interest-funding-history";

type Row = IndexerProductPayment & { kind: "Funding" | "Interest" };

/**
 * Real per-payment funding/interest ledger (getInterestFundingPayments) —
 * accrues between fills, so it never shows up in Trade history. Funding
 * costs in particular are easy to lose track of; this makes them visible.
 */
export function FundingInterestHistoryTable({
  owner,
  subaccountName,
}: {
  owner: string | undefined;
  subaccountName: string;
}) {
  const symbolsQuery = useSymbols();
  const productIds = useMemo(() => Object.values(symbolsQuery.data?.symbols ?? {}).map((s) => s.productId), [symbolsQuery.data]);
  const history = useInterestFundingHistory(owner, subaccountName, productIds);
  const symbolMap = useSymbolMap();

  const rows = useMemo((): Row[] => {
    if (!history.data) return [];
    const funding: Row[] = history.data.fundingPayments.map((p) => ({ ...p, kind: "Funding" }));
    const interest: Row[] = history.data.interestPayments.map((p) => ({ ...p, kind: "Interest" }));
    return [...funding, ...interest].sort((a, b) => (b.timestamp.comparedTo(a.timestamp) ?? 0));
  }, [history.data]);

  return (
    <Card title="Funding & interest" note={`"${subaccountName}"`}>
      {history.isLoading && (
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      )}
      {history.isError && (
        <p className="text-sm text-negative">
          {history.error instanceof Error ? history.error.message : "Failed to load."}
        </p>
      )}
      {history.data && rows.length === 0 && (
        <p className="text-sm text-foreground-muted">No funding or interest payments yet on this subaccount.</p>
      )}

      {rows.length > 0 && (
        <div className="max-h-[32rem] overflow-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-left text-xs text-foreground-muted">
                <th className="pb-2 font-normal">Time</th>
                <th className="pb-2 font-normal">Market</th>
                <th className="pb-2 font-normal">Type</th>
                <th className="pb-2 text-right font-normal">Rate (annualized)</th>
                <th className="pb-2 text-right font-normal">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => {
                const symbol = symbolMap[row.productId];
                return (
                  <tr key={`${row.kind}-${row.productId}-${row.submissionIndex}`}>
                    <td className="py-2 text-foreground-muted">{formatRelativeTime(row.timestamp.toNumber())}</td>
                    <td className="py-2 text-foreground">
                      <span className="flex items-center gap-2">
                        {symbol && <PairIcon symbol={symbol} size={16} />}
                        {symbol ?? `${row.productId}`}
                      </span>
                    </td>
                    <td className="py-2 text-foreground-muted">{row.kind}</td>
                    <td className="py-2 text-right text-foreground-muted">{formatPercent(row.annualPaymentRate, 2)}</td>
                    <td className={`py-2 text-right ${pnlColorClass(row.paymentAmount)}`}>
                      {formatSignedUsd(row.paymentAmount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
