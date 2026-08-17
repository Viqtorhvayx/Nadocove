"use client";

import { useMemo, useState } from "react";
import BigNumber from "bignumber.js";
import { Card } from "@/components/card";
import { ConfirmDialog, ConfirmRow } from "@/components/confirm-dialog";
import { useActiveSubaccount } from "@/lib/subaccount-context";
import { useDepositableProductIds, useTokenMetadata, type DepositableToken } from "@/lib/use-deposit";
import { useMaxWithdrawable, useWithdraw } from "@/lib/use-withdraw";

export function WithdrawPanel() {
  const { subaccountName } = useActiveSubaccount();
  const productIds = useDepositableProductIds();
  const metaQueries = useTokenMetadata(productIds);

  const tokens = useMemo(
    () =>
      metaQueries
        .map((q) => q.data)
        .filter((t): t is DepositableToken => Boolean(t)),
    [metaQueries],
  );

  const [productId, setProductId] = useState<number | undefined>(undefined);
  const [amount, setAmount] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const selectedProductId = productId ?? tokens[0]?.productId;
  const selectedToken = tokens.find((t) => t.productId === selectedProductId);

  const maxWithdrawable = useMaxWithdrawable(selectedProductId);
  const withdraw = useWithdraw();

  const maxWithdrawableHuman = maxWithdrawable.data?.toFixed();

  const exceedsMax =
    Number(amount) > 0 &&
    maxWithdrawable.data !== undefined &&
    new BigNumber(amount).gt(maxWithdrawable.data);

  const canSubmit =
    selectedProductId !== undefined &&
    Number(amount) > 0 &&
    maxWithdrawable.data !== undefined &&
    !exceedsMax &&
    !withdraw.isPending;

  return (
    <Card title="Withdraw" note={`from subaccount "${subaccountName}"`}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSubmit) return;
          setConfirmOpen(true);
        }}
      >
        <label className="flex flex-col gap-1 text-xs text-foreground-muted">
          Asset
          <select
            value={selectedProductId ?? ""}
            onChange={(e) => setProductId(Number(e.target.value))}
            className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-foreground"
          >
            {tokens.length === 0 && <option value="">Loading…</option>}
            {tokens.map((t) => (
              <option key={t.productId} value={t.productId}>
                {t.symbol}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-foreground-muted">
          Amount
          <div className="flex gap-2">
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-foreground"
            />
            <button
              type="button"
              onClick={() => maxWithdrawableHuman && setAmount(maxWithdrawableHuman)}
              disabled={!maxWithdrawableHuman}
              className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground-muted transition hover:text-foreground disabled:opacity-50"
            >
              Max
            </button>
          </div>
          <span className="text-xs text-foreground-muted">
            Available to withdraw: {maxWithdrawableHuman ?? "—"} {selectedToken?.symbol ?? ""}
          </span>
        </label>

        {exceedsMax && (
          <p className="text-sm text-negative">
            Amount exceeds what&apos;s safe to withdraw from this subaccount right now.
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-full bg-cove-indigo px-5 py-2.5 text-sm font-semibold text-background transition hover:bg-cove-indigo-dim disabled:opacity-50"
        >
          Review withdrawal
        </button>

        {withdraw.isError && (
          <p className="text-sm text-negative">
            {withdraw.error instanceof Error ? withdraw.error.message : "Withdrawal failed."}
          </p>
        )}
        {withdraw.isSuccess && (
          <p className="text-sm text-positive">
            Withdrawal requested. Nado&apos;s engine processes it from here — there&apos;s no
            verified way to show exactly when it lands in your wallet.
          </p>
        )}
      </form>

      <ConfirmDialog
        title="Confirm withdrawal"
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (selectedProductId === undefined) return;
          withdraw.mutate(
            { productId: selectedProductId, amount },
            { onSuccess: () => setConfirmOpen(false) },
          );
        }}
        confirmLabel="Sign & withdraw"
        confirming={withdraw.isPending}
      >
        <ConfirmRow label="Asset" value={selectedToken?.symbol ?? "—"} />
        <ConfirmRow label="Amount" value={amount || "—"} />
        <ConfirmRow label="From subaccount" value={subaccountName} />
        <ConfirmRow label="To" value="Your connected wallet" />
        <ConfirmRow label="Steps" value="Sign a request (1 wallet prompt, no gas)" />
      </ConfirmDialog>
    </Card>
  );
}
