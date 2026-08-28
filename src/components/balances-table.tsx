"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import {
  ProductEngineType,
  calcSpotBalanceValue,
  type SpotBalanceWithProduct,
} from "@nadohq/shared";
import type { GetEngineSubaccountSummaryResponse } from "@nadohq/engine-client";
import { Card } from "@/components/card";
import { TokenIcon } from "@/components/token-icon";
import { formatAmount, formatUsd } from "@/lib/format";
import { useSymbolMap } from "@/lib/use-symbol-map";

export function BalancesTable({
  query,
}: {
  query: UseQueryResult<GetEngineSubaccountSummaryResponse>;
}) {
  const symbolMap = useSymbolMap();

  if (query.isLoading || query.isError || !query.data?.exists) return null;

  const balances = query.data.balances.filter(
    (b): b is SpotBalanceWithProduct =>
      b.type === ProductEngineType.SPOT && !b.amount.isZero(),
  );

  if (balances.length === 0) return null;

  return (
    <Card title="Balances">
      <div className="flex flex-col divide-y divide-border">
        {balances.map((balance) => {
          const symbol = symbolMap[balance.productId];
          return (
          <div
            key={balance.productId}
            className="flex items-center justify-between py-2.5 text-sm first:pt-0 last:pb-0"
          >
            <span className="flex items-center gap-2 font-medium text-foreground">
              {symbol && <TokenIcon symbol={symbol} size={18} />}
              {symbol ?? `#${balance.productId}`}
            </span>
            <span className="text-right">
              <span className="text-foreground">{formatAmount(balance.amount)}</span>{" "}
              <span className="text-foreground-muted">
                ({formatUsd(calcSpotBalanceValue(balance))})
              </span>
            </span>
          </div>
          );
        })}
      </div>
    </Card>
  );
}
