"use client";

import { useState } from "react";
import BigNumber from "bignumber.js";
import { removeDecimals, type OrderExecutionType } from "@nadohq/shared";
import type { EngineSymbol } from "@nadohq/engine-client";
import { Card } from "@/components/card";
import { ConfirmDialog, ConfirmRow } from "@/components/confirm-dialog";
import { TokenIcon } from "@/components/token-icon";
import { formatUsd } from "@/lib/format";
import { useCancelOrder, useOpenOrders, usePlaceOrder } from "@/lib/use-subaccount-data";
import { BUILDER_ID, BUILDER_FEE_RATE } from "@/lib/builder";

function OpenOrders({ productId }: { productId: number | undefined }) {
  const openOrders = useOpenOrders(productId);
  const cancelOrder = useCancelOrder();

  const orders = openOrders.data?.orders ?? [];

  if (productId === undefined) return null;
  if (openOrders.isLoading) {
    return <p className="text-xs text-foreground-muted">Loading orders…</p>;
  }
  if (orders.length === 0) {
    return (
      <p className="text-xs text-foreground-muted">
        No open orders for this market.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {orders.map((order) => (
        <div
          key={order.digest}
          className="flex items-center justify-between rounded-lg border border-border bg-surface-raised px-3 py-2 text-xs"
        >
          <span className="text-foreground">
            {order.price.toString()} ×{" "}
            {removeDecimals(order.unfilledAmount, 18).toString()}
          </span>
          <button
            type="button"
            onClick={() =>
              cancelOrder.mutate({ digest: order.digest, productId })
            }
            disabled={cancelOrder.isPending}
            className="text-negative hover:underline disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      ))}
    </div>
  );
}

type TradePanelProps = {
  symbols: EngineSymbol[];
  selectedProductId: number | undefined;
  onProductIdChange: (productId: number) => void;
};

export function TradePanel({ symbols, selectedProductId, onProductIdChange }: TradePanelProps) {
  const placeOrder = usePlaceOrder();

  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [executionType, setExecutionType] =
    useState<OrderExecutionType>("default");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const selectedSymbol = symbols.find((s) => s.productId === selectedProductId)?.symbol;

  const canSubmit =
    selectedProductId !== undefined &&
    Number(amount) > 0 &&
    Number(price) > 0 &&
    !placeOrder.isPending;

  const notional =
    Number(amount) > 0 && Number(price) > 0
      ? new BigNumber(amount).times(price)
      : undefined;

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
          if (!canSubmit) return;
          setConfirmOpen(true);
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs text-foreground-muted">
            Market
            <div className="relative">
              {selectedSymbol && (
                <TokenIcon
                  symbol={selectedSymbol}
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                />
              )}
              <select
                value={selectedProductId ?? ""}
                onChange={(e) => onProductIdChange(Number(e.target.value))}
                className={`w-full rounded-lg border border-border bg-surface-raised py-2 pr-3 text-sm text-foreground ${
                  selectedSymbol ? "pl-9" : "pl-3"
                }`}
              >
                {symbols.length === 0 && <option value="">Loading…</option>}
                {symbols.map((s) => (
                  <option key={s.productId} value={s.productId}>
                    {s.symbol}
                  </option>
                ))}
              </select>
            </div>
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
              <option value="default">Limit</option>
              <option value="ioc">Market (IOC)</option>
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
                    ? "border-positive bg-positive/10 text-positive shadow-[inset_0_1px_0_0_rgba(52,211,153,0.3),0_0_12px_-4px_rgba(52,211,153,0.5)]"
                    : "border-negative bg-negative/10 text-negative shadow-[inset_0_1px_0_0_rgba(248,113,113,0.3),0_0_12px_-4px_rgba(248,113,113,0.5)]"
                  : "btn-tactile-secondary border-transparent text-foreground-muted hover:text-foreground"
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
          className="btn-tactile-primary rounded-full px-5 py-2.5 text-sm font-semibold text-background disabled:opacity-50"
        >
          Review {side === "buy" ? "buy" : "sell"} order
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

      <ConfirmDialog
        title={`Confirm ${side} order`}
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (selectedProductId === undefined) return;
          placeOrder.mutate(
            { productId: selectedProductId, side, amount, price, executionType },
            { onSuccess: () => setConfirmOpen(false) },
          );
        }}
        confirmLabel={`${side === "buy" ? "Buy" : "Sell"} ${selectedSymbol ?? ""}`}
        confirming={placeOrder.isPending}
      >
        <ConfirmRow label="Market" value={selectedSymbol ?? "—"} />
        <ConfirmRow
          label="Side"
          value={<span className="capitalize">{side}</span>}
        />
        <ConfirmRow
          label="Type"
          value={
            executionType === "default"
              ? "Limit"
              : executionType === "ioc"
                ? "Market (IOC)"
                : "Post only"
          }
        />
        <ConfirmRow label="Amount" value={amount || "—"} />
        <ConfirmRow label="Price" value={price ? formatUsd(new BigNumber(price)) : "—"} />
        <ConfirmRow
          label="Notional"
          value={notional ? formatUsd(notional) : "—"}
        />
        {BUILDER_ID > 0 && (
          <ConfirmRow
            label="Builder fee"
            value={`${BUILDER_FEE_RATE / 100}bps to NadoCove`}
          />
        )}
      </ConfirmDialog>

      <div className="mt-6 border-t border-border pt-4">
        <h3 className="mb-2 text-xs font-semibold text-foreground-muted">
          Open orders
        </h3>
        <OpenOrders productId={selectedProductId} />
      </div>
    </Card>
  );
}
