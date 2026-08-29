"use client";

import { useState } from "react";
import BigNumber from "bignumber.js";
import {
  removeDecimals,
  ProductEngineType,
  QUOTE_PRODUCT_ID,
  type OrderExecutionType,
  type SpotBalanceWithProduct,
  type PerpBalanceWithProduct,
} from "@nadohq/shared";
import type { EngineSymbol } from "@nadohq/engine-client";
import { ConfirmDialog, ConfirmRow } from "@/components/confirm-dialog";
import { TokenIcon } from "@/components/token-icon";
import { formatAmount, formatMarketPair, formatUsd, QUOTE_ASSET_SYMBOL } from "@/lib/format";
import { maxLeverageFor } from "@/lib/market-leverage";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useLiquidationEstimate } from "@/lib/use-liquidation-estimate";
import { useMarketLiquidity } from "@/lib/use-market-liquidity";
import { usePerpPrices } from "@/lib/use-perp-prices";
import { usePlaceTriggerOrders } from "@/lib/use-place-trigger-orders";
import {
  useCancelOrder,
  useOpenOrders,
  usePlaceOrder,
  useSubaccountSummary,
} from "@/lib/use-subaccount-data";
import { BUILDER_ID, BUILDER_FEE_RATE } from "@/lib/builder";

const MARKET_SLIPPAGE_TOLERANCE = 0.01; // 1% — the buffer added to the best price so an "ioc" order actually fills as a market order.
const SIZE_PRESETS = [25, 50, 75, 100] as const;

function roundDownToIncrement(value: BigNumber, increment: BigNumber): BigNumber {
  if (increment.isZero()) return value;
  return value.div(increment).integerValue(BigNumber.ROUND_DOWN).times(increment);
}

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

type OrderMode = "market" | "limit" | "pro";

type TradePanelProps = {
  symbol: EngineSymbol | undefined;
};

export function TradePanel({ symbol }: TradePanelProps) {
  const selectedProductId = symbol?.productId;
  const placeOrder = usePlaceOrder();
  const placeTriggerOrders = usePlaceTriggerOrders();
  const summary = useSubaccountSummary();
  const liquidity = useMarketLiquidity(selectedProductId, 40);
  const perpPrices = usePerpPrices(selectedProductId);

  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [mode, setMode] = useState<OrderMode>("market");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [reduceOnly, setReduceOnly] = useState(false);
  const [tpSlEnabled, setTpSlEnabled] = useState(false);
  const [takeProfitPrice, setTakeProfitPrice] = useState("");
  const [stopLossPrice, setStopLossPrice] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>(undefined);

  const bestAsk = liquidity.data?.asks
    ? [...liquidity.data.asks].sort((a, b) => a.price.minus(b.price).toNumber())[0]?.price
    : undefined;
  const bestBid = liquidity.data?.bids
    ? [...liquidity.data.bids].sort((a, b) => b.price.minus(a.price).toNumber())[0]?.price
    : undefined;
  const mid = bestAsk && bestBid ? bestAsk.plus(bestBid).div(2) : undefined;

  const executionType: OrderExecutionType =
    mode === "market" ? "ioc" : mode === "pro" ? "post_only" : "default";

  // Market orders don't take a user-entered price — send the best price
  // plus a slippage buffer so the IOC order actually crosses the book.
  // Cheap enough to recompute each render; no need to memoize it.
  const effectivePrice = (() => {
    if (mode !== "market") return price;
    const best = side === "buy" ? bestAsk : bestBid;
    if (!best) return "";
    const buffered = side === "buy" ? best.times(1 + MARKET_SLIPPAGE_TOLERANCE) : best.times(1 - MARKET_SLIPPAGE_TOLERANCE);
    return buffered.toString();
  })();

  const quoteBalance = summary.data?.balances.find(
    (b): b is SpotBalanceWithProduct => b.type === ProductEngineType.SPOT && b.productId === QUOTE_PRODUCT_ID,
  );
  const position = summary.data?.balances.find(
    (b): b is PerpBalanceWithProduct => b.type === ProductEngineType.PERP && b.productId === selectedProductId,
  );

  const maxLeverage = maxLeverageFor(symbol);
  const marginFraction = symbol ? 1 - symbol.longWeightInitial.toNumber() : undefined;

  // What "100%" means for the quick-size buttons: reduce-only sizes off the
  // current position (there's no margin math when you're only closing),
  // otherwise the largest position the available quote balance can open at
  // this market's initial margin requirement and the current effective price.
  const effectivePriceBn =
    effectivePrice && Number(effectivePrice) > 0 ? new BigNumber(effectivePrice) : undefined;
  const maxSizeableAmount = reduceOnly
    ? position?.amount.abs()
    : quoteBalance && marginFraction && marginFraction > 0 && effectivePriceBn
      ? quoteBalance.amount.div(marginFraction).div(effectivePriceBn)
      : undefined;

  const canSubmit =
    selectedProductId !== undefined &&
    Number(amount) > 0 &&
    Number(effectivePrice) > 0 &&
    !placeOrder.isPending &&
    !placeTriggerOrders.isPending;

  const notional =
    Number(amount) > 0 && Number(effectivePrice) > 0
      ? new BigNumber(amount).times(effectivePrice)
      : undefined;
  const marginRequired = notional && marginFraction !== undefined ? notional.times(marginFraction) : undefined;

  // Debounced so the liquidation estimate (a real engine round-trip) isn't
  // refired on every keystroke.
  const debouncedAmount = useDebouncedValue(amount, 400);
  const liquidationEstimate = useLiquidationEstimate({
    symbol,
    side,
    amount: debouncedAmount,
    oraclePrice: perpPrices.data?.indexPrice,
  });

  const submitting = placeOrder.isPending || placeTriggerOrders.isPending;

  async function handleConfirm() {
    if (selectedProductId === undefined) return;
    setSubmitError(undefined);
    try {
      await placeOrder.mutateAsync({
        productId: selectedProductId,
        side,
        amount,
        price: effectivePrice,
        executionType,
        reduceOnly: reduceOnly || undefined,
      });

      if (tpSlEnabled && (takeProfitPrice || stopLossPrice)) {
        await placeTriggerOrders.mutateAsync({
          productId: selectedProductId,
          closeSide: side === "buy" ? "sell" : "buy",
          amount,
          takeProfitPrice: takeProfitPrice || undefined,
          stopLossPrice: stopLossPrice || undefined,
        });
      }

      setConfirmOpen(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Order failed.");
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),inset_0_-1px_0_0_rgba(0,0,0,0.2),0_16px_32px_-18px_rgba(0,0,0,0.7)]">
      <div className="flex items-center gap-2">
        <span className="rounded-full border border-border bg-surface-raised px-2.5 py-1 text-xs font-medium text-foreground-muted">
          Cross margin
        </span>
        {maxLeverage !== undefined && (
          <span className="rounded-full border border-border bg-surface-raised px-2.5 py-1 text-xs font-medium text-foreground-muted">
            Up to {maxLeverage}x
          </span>
        )}
        <span className="ml-auto text-[11px] text-foreground-muted">
          {BUILDER_ID > 0 ? `Builder #${BUILDER_ID} · ${BUILDER_FEE_RATE / 100}bps` : "no Builder ID set"}
        </span>
      </div>

      <div className="mt-4 flex gap-4 border-b border-border">
        {(
          [
            ["market", "Market"],
            ["limit", "Limit"],
            ["pro", "Pro"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={`border-b-2 pb-2 text-sm font-semibold transition ${
              mode === id ? "border-cove-indigo text-foreground" : "border-transparent text-foreground-muted hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form
        className="mt-4 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSubmit) return;
          setConfirmOpen(true);
        }}
      >
        <div className="flex gap-2">
          {(["buy", "sell"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSide(s)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold capitalize transition ${
                side === s
                  ? s === "buy"
                    ? "btn-tactile-buy text-background"
                    : "btn-tactile-sell text-background"
                  : "btn-tactile-secondary text-foreground-muted hover:text-foreground"
              }`}
            >
              {s === "buy" ? "Buy / Long" : "Sell / Short"}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-foreground-muted">Available to Trade</span>
          <span className="font-medium tabular-nums text-foreground">
            {quoteBalance
              ? `${formatAmount(quoteBalance.amount)} ${QUOTE_ASSET_SYMBOL}`
              : `0.00 ${QUOTE_ASSET_SYMBOL}`}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-foreground-muted">Current Position</span>
          <span className="font-medium tabular-nums text-foreground">
            {position ? `${formatAmount(position.amount)} ${symbol?.symbol.split("-")[0] ?? ""}` : `0.00000 ${symbol?.symbol.split("-")[0] ?? ""}`}
          </span>
        </div>

        <label className="flex flex-col gap-1.5 text-xs text-foreground-muted">
          Size
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-raised px-4 py-3.5 transition-colors focus-within:border-cove-indigo">
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent text-base text-foreground focus:outline-none"
            />
            {symbol && (
              <span className="flex shrink-0 items-center gap-1.5 text-xs text-foreground-muted">
                <TokenIcon symbol={symbol.symbol} size={14} />
                {symbol.symbol.split("-")[0]}
              </span>
            )}
          </div>
          <div className="flex gap-1.5">
            {SIZE_PRESETS.map((pct) => (
              <button
                key={pct}
                type="button"
                disabled={!maxSizeableAmount || maxSizeableAmount.lte(0)}
                onClick={() => {
                  if (!maxSizeableAmount || !symbol) return;
                  const preset = maxSizeableAmount.times(pct / 100);
                  const rounded = roundDownToIncrement(preset, symbol.sizeIncrement);
                  setAmount(rounded.gt(0) ? rounded.toString() : "");
                }}
                className="btn-tactile-secondary flex-1 rounded-md py-1.5 text-[11px] font-medium text-foreground-muted transition hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              >
                {pct === 100 ? "Max" : `${pct}%`}
              </button>
            ))}
          </div>
        </label>

        {mode !== "market" && (
          <label className="flex flex-col gap-1.5 text-xs text-foreground-muted">
            Price
            <input
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={mid ? mid.toFixed(2) : "0.00"}
              className="rounded-lg border border-border bg-surface-raised px-4 py-3.5 text-base text-foreground transition-colors focus:border-cove-indigo focus:outline-none"
            />
          </label>
        )}

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-xs text-foreground-muted">
            <input
              type="checkbox"
              checked={reduceOnly}
              onChange={(e) => setReduceOnly(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-border accent-cove-indigo"
            />
            Reduce Only
          </label>

          <label className="flex items-center gap-2 text-xs text-foreground-muted">
            <input
              type="checkbox"
              checked={tpSlEnabled}
              onChange={(e) => setTpSlEnabled(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-border accent-cove-indigo"
            />
            Take Profit / Stop Loss
          </label>

          {tpSlEnabled && (
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-surface-raised p-3">
              <label className="flex flex-col gap-1 text-[11px] text-foreground-muted">
                Take Profit
                <input
                  inputMode="decimal"
                  value={takeProfitPrice}
                  onChange={(e) => setTakeProfitPrice(e.target.value)}
                  placeholder="Price"
                  className="rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-positive focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 text-[11px] text-foreground-muted">
                Stop Loss
                <input
                  inputMode="decimal"
                  value={stopLossPrice}
                  onChange={(e) => setStopLossPrice(e.target.value)}
                  placeholder="Price"
                  className="rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-negative focus:outline-none"
                />
              </label>
              <p className="col-span-2 text-[10px] leading-relaxed text-foreground-muted">
                Places real reduce-only trigger orders sized to this trade — closes the position at the price you set. Uses the oracle price.
              </p>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className={`rounded-full py-2.5 text-sm font-semibold text-background disabled:opacity-50 ${
            side === "buy" ? "btn-tactile-buy" : "btn-tactile-sell"
          }`}
        >
          {side === "buy" ? "Buy" : "Sell"} {symbol ? formatMarketPair(symbol.symbol) : ""}
        </button>

        {(placeOrder.isError || placeTriggerOrders.isError) && !confirmOpen && (
          <p className="text-sm text-negative">
            {submitError ?? "Order failed."}
          </p>
        )}
        {placeOrder.isSuccess && !confirmOpen && (
          <p className="text-sm text-positive">
            Order placed{placeTriggerOrders.isSuccess ? " — TP/SL set." : "."}
          </p>
        )}

        <div className="flex flex-col gap-1.5 border-t border-border pt-3 text-xs">
          <div className="flex justify-between">
            <span className="text-foreground-muted">Order Value</span>
            <span className="tabular-nums text-foreground">{notional ? formatUsd(notional) : "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground-muted">Margin Required</span>
            <span className="tabular-nums text-foreground">{marginRequired ? formatUsd(marginRequired) : "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground-muted">Est. Liquidation Price</span>
            <span className="tabular-nums text-foreground">
              {liquidationEstimate.data ? formatUsd(liquidationEstimate.data) : "—"}
            </span>
          </div>
          {mode === "market" && (
            <div className="flex justify-between">
              <span className="text-foreground-muted">Max Slippage</span>
              <span className="tabular-nums text-foreground">{(MARKET_SLIPPAGE_TOLERANCE * 100).toFixed(2)}%</span>
            </div>
          )}
        </div>
      </form>

      <ConfirmDialog
        title={`Confirm ${side} order`}
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        confirmLabel={`${side === "buy" ? "Buy" : "Sell"} ${symbol ? formatMarketPair(symbol.symbol) : ""}`}
        confirming={submitting}
      >
        <ConfirmRow label="Market" value={symbol ? formatMarketPair(symbol.symbol) : "—"} />
        <ConfirmRow
          label="Side"
          value={<span className="capitalize">{side}</span>}
        />
        <ConfirmRow
          label="Type"
          value={mode === "market" ? "Market (IOC)" : mode === "pro" ? "Post only" : "Limit"}
        />
        <ConfirmRow label="Amount" value={amount || "—"} />
        <ConfirmRow label="Price" value={effectivePrice ? formatUsd(new BigNumber(effectivePrice)) : "—"} />
        <ConfirmRow
          label="Notional"
          value={notional ? formatUsd(notional) : "—"}
        />
        <ConfirmRow
          label="Est. Liquidation Price"
          value={liquidationEstimate.data ? formatUsd(liquidationEstimate.data) : "—"}
        />
        {tpSlEnabled && takeProfitPrice && (
          <ConfirmRow label="Take Profit" value={formatUsd(new BigNumber(takeProfitPrice))} />
        )}
        {tpSlEnabled && stopLossPrice && (
          <ConfirmRow label="Stop Loss" value={formatUsd(new BigNumber(stopLossPrice))} />
        )}
        {BUILDER_ID > 0 && (
          <ConfirmRow
            label="Builder fee"
            value={`${BUILDER_FEE_RATE / 100}bps to NadoCove`}
          />
        )}
        {submitError && <p className="text-sm text-negative">{submitError}</p>}
      </ConfirmDialog>

      <div className="mt-6 border-t border-border pt-4">
        <h3 className="mb-2 text-xs font-semibold text-foreground-muted">
          Open orders
        </h3>
        <OpenOrders productId={selectedProductId} />
      </div>
    </div>
  );
}
