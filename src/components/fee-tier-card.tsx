"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import type { GetEngineSubaccountFeeRatesResponse } from "@nadohq/engine-client";
import { Card } from "@/components/card";
import { formatPercent } from "@/lib/format";
import { useSymbolMap } from "@/lib/use-symbol-map";

export function FeeTierCard({
  query,
}: {
  query: UseQueryResult<GetEngineSubaccountFeeRatesResponse>;
}) {
  const symbolMap = useSymbolMap();

  if (query.isLoading) {
    return (
      <Card title="Fee tier">
        <p className="text-sm text-foreground-muted">Loading…</p>
      </Card>
    );
  }

  if (query.isError || !query.data) {
    return (
      <Card title="Fee tier">
        <p className="text-sm text-negative">
          {query.error instanceof Error ? query.error.message : "Failed to load."}
        </p>
      </Card>
    );
  }

  const rows = Object.entries(query.data.orders).filter(
    ([, rate]) => !rate.maker.isZero() || !rate.taker.isZero(),
  );

  return (
    <Card title="Fee tier" note={`VIP ${query.data.feeTier}`}>
      {rows.length === 0 ? (
        <p className="text-sm text-foreground-muted">
          No per-market fee overrides — default rates apply.
        </p>
      ) : (
        <div className="max-h-64 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-foreground-muted">
                <th className="pb-2 font-normal">Market</th>
                <th className="pb-2 text-right font-normal">Maker</th>
                <th className="pb-2 text-right font-normal">Taker</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map(([productId, rate]) => (
                <tr key={productId}>
                  <td className="py-2 text-foreground">
                    {symbolMap[Number(productId)] ?? `#${productId}`}
                  </td>
                  <td className="py-2 text-right text-foreground-muted">
                    {formatPercent(rate.maker, 3)}
                  </td>
                  <td className="py-2 text-right text-foreground-muted">
                    {formatPercent(rate.taker, 3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
