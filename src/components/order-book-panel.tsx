"use client";

import { useState } from "react";
import type { EngineSymbol } from "@nadohq/engine-client";
import { OrderBook } from "@/components/order-book";
import { RecentTrades } from "@/components/recent-trades";

type Tab = "book" | "trades";

export function OrderBookPanel({
  productId,
  symbol,
}: {
  productId: number | undefined;
  symbol: EngineSymbol | undefined;
}) {
  const [tab, setTab] = useState<Tab>("book");

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),inset_0_-1px_0_0_rgba(0,0,0,0.2),0_16px_32px_-18px_rgba(0,0,0,0.7)]">
      <div className="flex items-baseline justify-between gap-4">
        <div className="flex gap-4">
          {(
            [
              ["book", "Order Book"],
              ["trades", "Trades"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`text-sm font-semibold transition ${
                tab === id ? "text-foreground" : "text-foreground-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="text-xs text-foreground-muted">{symbol?.symbol}</span>
      </div>

      <div className="mt-4">
        {tab === "book" ? (
          <OrderBook productId={productId} symbol={symbol} />
        ) : (
          <RecentTrades productId={productId} />
        )}
      </div>
    </div>
  );
}
