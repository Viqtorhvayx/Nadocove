"use client";

import { useEffect, useMemo, useState } from "react";
import { MarketChart } from "@/components/market-chart";
import { MarketHeader } from "@/components/market-header";
import { MarketSearchModal } from "@/components/market-search-modal";
import { OrderBookPanel } from "@/components/order-book-panel";
import { TradePanel } from "@/components/trade-panel";
import { useMarketOverview } from "@/lib/use-market-overview";
import { useTradableMarketSymbols } from "@/lib/use-tradable-market-symbols";

export default function TradeTab() {
  const tradableSymbols = useTradableMarketSymbols();
  const symbols = useMemo(
    () => [...tradableSymbols].sort((a, b) => a.symbol.localeCompare(b.symbol)),
    [tradableSymbols],
  );

  const productIds = useMemo(() => symbols.map((s) => s.productId), [symbols]);
  const overview = useMarketOverview(productIds);

  const [productId, setProductId] = useState<number | undefined>(undefined);
  const selectedProductId = productId ?? symbols[0]?.productId;
  const selectedSymbol = symbols.find((s) => s.productId === selectedProductId);

  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <MarketHeader
        symbol={selectedSymbol}
        overview={overview.data?.[selectedProductId ?? -1]}
        onOpenSearch={() => setSearchOpen(true)}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <MarketChart productId={selectedProductId} symbol={selectedSymbol?.symbol} />
          <OrderBookPanel productId={selectedProductId} symbol={selectedSymbol} />
        </div>

        <div className="lg:col-span-1">
          <TradePanel symbol={selectedSymbol} />
        </div>
      </div>

      <MarketSearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        symbols={symbols}
        overview={overview.data}
        selectedProductId={selectedProductId}
        onSelect={setProductId}
      />
    </div>
  );
}
