"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/card";
import { MarketChart } from "@/components/market-chart";
import { OrderBook } from "@/components/order-book";
import { TradePanel } from "@/components/trade-panel";
import { useSymbols } from "@/lib/use-subaccount-data";

export default function TradeTab() {
  const symbolsQuery = useSymbols();
  const symbols = useMemo(() => {
    const entries = Object.values(symbolsQuery.data?.symbols ?? {});
    return entries.sort((a, b) => a.symbol.localeCompare(b.symbol));
  }, [symbolsQuery.data]);

  const [productId, setProductId] = useState<number | undefined>(undefined);
  const selectedProductId = productId ?? symbols[0]?.productId;
  const selectedSymbol = symbols.find((s) => s.productId === selectedProductId)?.symbol;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <MarketChart productId={selectedProductId} symbol={selectedSymbol} />
        <Card title="Order book" note={selectedSymbol}>
          <OrderBook productId={selectedProductId} />
        </Card>
      </div>

      <div className="lg:col-span-1">
        <TradePanel
          symbols={symbols}
          selectedProductId={selectedProductId}
          onProductIdChange={setProductId}
        />
      </div>
    </div>
  );
}
