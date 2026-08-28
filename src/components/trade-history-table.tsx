"use client";

import { Card } from "@/components/card";
import { Skeleton } from "@/components/skeleton";
import { TokenIcon } from "@/components/token-icon";
import { formatAmount, formatSignedUsd, formatUsd, pnlColorClass } from "@/lib/format";
import { useSymbolMap } from "@/lib/use-symbol-map";
import { useMatchHistory } from "@/lib/use-match-history";

export function TradeHistoryTable({
  owner,
  subaccountName,
}: {
  owner: string | undefined;
  subaccountName: string;
}) {
  const history = useMatchHistory(owner, subaccountName);
  const symbolMap = useSymbolMap();

  return (
    <Card title="Trade history" note={`"${subaccountName}"`}>
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
                const price = fill.baseFilled.isZero()
                  ? fill.quoteFilled.abs()
                  : fill.quoteFilled.abs().div(fill.baseFilled.abs());
                const symbol = symbolMap[fill.productId];
                return (
                  <tr key={fill.digest + fill.submissionIndex}>
                    <td className="py-2 text-foreground-muted">
                      {new Date(fill.timestamp.toNumber() * 1000).toLocaleString()}
                    </td>
                    <td className="py-2 text-foreground">
                      <span className="flex items-center gap-2">
                        {symbol && <TokenIcon symbol={symbol} size={16} />}
                        {symbol ?? `#${fill.productId}`}
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
                      {formatAmount(fill.baseFilled.abs())}
                    </td>
                    <td className="py-2 text-right text-foreground-muted">
                      {formatUsd(price)}
                    </td>
                    <td className="py-2 text-right text-foreground-muted">
                      {formatUsd(fill.totalFee)}
                    </td>
                    <td className={`py-2 text-right ${pnlColorClass(fill.realizedPnl)}`}>
                      {formatSignedUsd(fill.realizedPnl)}
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
