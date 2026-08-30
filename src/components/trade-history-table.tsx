"use client";

import { removeDecimals } from "@nadohq/shared";
import { Card } from "@/components/card";
import { Skeleton } from "@/components/skeleton";
import { TokenIcon } from "@/components/token-icon";
import { downloadCsv } from "@/lib/csv-export";
import { formatAmount, formatSignedUsd, formatUsd, pnlColorClass } from "@/lib/format";
import { useSymbolMap } from "@/lib/use-symbol-map";
import { useMatchHistory } from "@/lib/use-match-history";

const CSV_HEADERS = ["Time", "Market", "Side", "Type", "Size", "Price", "Fee", "Realized PnL"];

export function TradeHistoryTable({
  owner,
  subaccountName,
}: {
  owner: string | undefined;
  subaccountName: string;
}) {
  const history = useMatchHistory(owner, subaccountName, 500);
  const symbolMap = useSymbolMap();

  function handleExport() {
    if (!history.data || history.data.length === 0) return;
    const rows = history.data.map((fill) => {
      const isBuy = fill.baseFilled.gt(0);
      const price = fill.baseFilled.isZero()
        ? fill.quoteFilled.abs()
        : fill.quoteFilled.abs().div(fill.baseFilled.abs());
      const size = removeDecimals(fill.baseFilled.abs(), 18);
      const fee = removeDecimals(fill.totalFee, 18);
      const realizedPnl = removeDecimals(fill.realizedPnl, 18);
      const symbol = symbolMap[fill.productId] ?? `${fill.productId}`;
      return [
        new Date(fill.timestamp.toNumber() * 1000).toISOString(),
        symbol,
        isBuy ? "buy" : "sell",
        fill.isTaker ? "taker" : "maker",
        size.toString(),
        price.toString(),
        fee.toString(),
        realizedPnl.toString(),
      ];
    });
    downloadCsv(`nadocove-trades-${subaccountName}-${new Date().toISOString().slice(0, 10)}.csv`, CSV_HEADERS, rows);
  }

  return (
    <Card
      title="Trade history"
      note={
        <span className="flex items-center gap-3">
          {`"${subaccountName}"`}
          {history.data && history.data.length > 0 && (
            <button
              type="button"
              onClick={handleExport}
              className="btn-tactile-secondary rounded-full px-3 py-1 text-xs font-medium text-foreground-muted transition hover:text-foreground"
            >
              Export CSV
            </button>
          )}
        </span>
      }
    >
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
      {history.data && history.data.length === 0 && (
        <p className="text-sm text-foreground-muted">No fills yet on this subaccount.</p>
      )}
      {history.data && history.data.length > 0 && (
        <div className="max-h-[32rem] overflow-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-xs text-foreground-muted">
                <th className="pb-2 font-normal">Time</th>
                <th className="pb-2 font-normal">Market</th>
                <th className="pb-2 font-normal">Side</th>
                <th className="pb-2 text-right font-normal">Size</th>
                <th className="pb-2 text-right font-normal">Price</th>
                <th className="pb-2 text-right font-normal">Fee</th>
                <th className="pb-2 text-right font-normal">Realized PnL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {history.data.map((fill) => {
                const isBuy = fill.baseFilled.gt(0);
                // baseFilled/quoteFilled are raw 18-decimal fixed-point — a
                // ratio of the two is scale-invariant, so price needs no
                // conversion, but the standalone fields below do.
                const price = fill.baseFilled.isZero()
                  ? fill.quoteFilled.abs()
                  : fill.quoteFilled.abs().div(fill.baseFilled.abs());
                const size = removeDecimals(fill.baseFilled.abs(), 18);
                const fee = removeDecimals(fill.totalFee, 18);
                const realizedPnl = removeDecimals(fill.realizedPnl, 18);
                const symbol = symbolMap[fill.productId];
                return (
                  <tr key={fill.digest + fill.submissionIndex}>
                    <td className="py-2 text-foreground-muted">
                      {new Date(fill.timestamp.toNumber() * 1000).toLocaleString()}
                    </td>
                    <td className="py-2 text-foreground">
                      <span className="flex items-center gap-2">
                        {symbol && <TokenIcon symbol={symbol} size={16} />}
                        {symbol ?? `${fill.productId}`}
                      </span>
                    </td>
                    <td className="py-2">
                      <span
                        className={`rounded px-1.5 py-0.5 text-xs font-semibold uppercase ${
                          isBuy
                            ? "bg-positive/10 text-positive"
                            : "bg-negative/10 text-negative"
                        }`}
                      >
                        {isBuy ? "buy" : "sell"}
                      </span>{" "}
                      <span className="text-xs text-foreground-muted">
                        {fill.isTaker ? "taker" : "maker"}
                      </span>
                    </td>
                    <td className="py-2 text-right text-foreground-muted">
                      {formatAmount(size)}
                    </td>
                    <td className="py-2 text-right text-foreground-muted">
                      {formatUsd(price)}
                    </td>
                    <td className="py-2 text-right text-foreground-muted">
                      {formatUsd(fee)}
                    </td>
                    <td className={`py-2 text-right ${pnlColorClass(realizedPnl)}`}>
                      {formatSignedUsd(realizedPnl)}
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
