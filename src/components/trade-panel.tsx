"use client";

import { useMemo, useState } from "react";
import type { OrderExecutionType } from "@nadohq/shared";
import { Card } from "@/components/card";
import { usePlaceOrder, useSymbols } from "@/lib/use-subaccount-data";
import { BUILDER_ID, BUILDER_FEE_RATE } from "@/lib/builder";

export function TradePanel() {
  const symbolsQuery = useSymbols();
  const placeOrder = usePlaceOrder();

  const symbols = useMemo(() => {
    const entries = Object.values(symbolsQuery.data?.symbols ?? {});
    return entries.sort((a, b) => a.symbol.localeCompare(b.symbol));
  }, [symbolsQuery.data]);

  const [productId, setProductId] = useState<number | undefined>(undefined);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [executionType, setExecutionType] =
    useState<OrderExecutionType>("default");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");

  const selectedProductId = productId ?? symbols[0]?.productId;

  const canSubmit =
    selectedProductId !== undefined &&
    Number(amount) > 0 &&
    Number(price) > 0 &&
    !placeOrder.isPending;

  return (
    <Card
      title="Trade"
      note={
        BUILDER_ID > 0
          ? `Builder #${BUILDER_ID} · ${BUILDER_FEE_RATE / 100}bps`
          : "no Builder ID set — see .env.example"
      }
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (selectedProductId === undefined) return;
          placeOrder.mutate({
            productId: selectedProductId,
            side,
            amount,
            price,
            executionType,
          });
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs text-foreground-muted">
            Market
            <select
              value={selectedProductId ?? ""}
              onChange={(e) => setProductId(Number(e.target.value))}
              className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-foreground"
            >
              {symbols.length === 0 && <option value="">Loading…</option>}
              {symbols.map((s) => (
                <option key={s.productId} value={s.productId}>
                  {s.symbol}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-foreground-muted">
            Order type
            <select
              value={executionType}
              onChange={(e) =>
                setExecutionType(e.target.value as OrderExecutionType)
              }
              className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-foreground"
            >
              <option value="default">Limit (rests on book)</option>
              <option value="ioc">Market (IOC, up to price)</option>
              <option value="post_only">Post only</option>
            </select>
          </label>
        </div>

        <div className="flex gap-2">
          {(["buy", "sell"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSide(s)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold capitalize transition ${
                side === s
                  ? s === "buy"
                    ? "border-positive bg-positive/10 text-positive"
                    : "border-negative bg-negative/10 text-negative"
                  : "border-border text-foreground-muted hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs text-foreground-muted">
            Amount
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.01"
              className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-foreground-muted">
            Price (limit)
            <input
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="80000"
              className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-foreground"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-full bg-cove-teal px-5 py-2.5 text-sm font-semibold text-background transition hover:bg-cove-teal-dim disabled:opacity-50"
        >
          {placeOrder.isPending
            ? "Placing…"
            : `${side === "buy" ? "Buy" : "Sell"}`}
        </button>

        {placeOrder.isError && (
          <p className="text-sm text-negative">
            {placeOrder.error instanceof Error
              ? placeOrder.error.message
              : "Order failed."}
          </p>
        )}
        {placeOrder.isSuccess && (
          <p className="text-sm text-positive">Order placed.</p>
        )}
      </form>
    </Card>
  );
}
