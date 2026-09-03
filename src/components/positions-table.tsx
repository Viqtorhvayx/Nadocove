"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import {
  ProductEngineType,
  calcPerpBalanceNotionalValue,
  calcPerpBalanceValue,
  type PerpBalanceWithProduct,
} from "@nadohq/shared";
import type { GetEngineSubaccountSummaryResponse } from "@nadohq/engine-client";
import { Card } from "@/components/card";
import { PairIcon } from "@/components/token-icon";
import { formatAmount, formatSignedUsd, formatUsd, pnlColorClass } from "@/lib/format";
import { useSymbolMap } from "@/lib/use-symbol-map";

export function PositionsTable({
  query,
}: {
  query: UseQueryResult<GetEngineSubaccountSummaryResponse>;
}) {
  const symbolMap = useSymbolMap();

  if (query.isLoading || query.isError || !query.data?.exists) return null;

  const positions = query.data.balances.filter(
    (b): b is PerpBalanceWithProduct =>
      b.type === ProductEngineType.PERP && !b.amount.isZero(),
  );

  if (positions.length === 0) return null;

  return (
    <Card title="Positions">
      <div className="flex flex-col divide-y divide-border">
        {positions.map((position) => {
          const side = position.amount.gt(0) ? "long" : "short";
          const pnl = calcPerpBalanceValue(position);
          const symbol = symbolMap[position.productId];
          return (
            <div
              key={position.productId}
              className="flex items-center justify-between py-2.5 text-sm first:pt-0 last:pb-0"
            >
              <span className="flex items-center gap-2">
                {symbol && <PairIcon symbol={symbol} size={18} />}
                <span className="font-medium text-foreground">
                  {symbol ?? `${position.productId}`}
                </span>
                <span
                  className={`rounded px-1.5 py-0.5 text-xs font-semibold uppercase ${
                    side === "long"
                      ? "bg-positive/10 text-positive"
                      : "bg-negative/10 text-negative"
                  }`}
                >
                  {side}
                </span>
                <span className="text-foreground-muted">
                  {formatAmount(position.amount.abs())}
                </span>
              </span>
              <span className="text-right">
                <span className={pnlColorClass(pnl)}>{formatSignedUsd(pnl)}</span>{" "}
                <span className="text-foreground-muted">
                  ({formatUsd(calcPerpBalanceNotionalValue(position))} notional)
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
