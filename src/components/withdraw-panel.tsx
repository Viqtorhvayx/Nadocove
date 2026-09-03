"use client";

import { useMemo, useState } from "react";
import { ConfirmDialog, ConfirmRow } from "@/components/confirm-dialog";
import { TokenSelectDropdown } from "@/components/token-select-dropdown";
import { useActiveSubaccount } from "@/lib/subaccount-context";
import { useDepositableProductIds, useTokenMetadata, type DepositableToken } from "@/lib/use-deposit";
import { useMaxWithdrawable, useWithdraw } from "@/lib/use-withdraw";
import { canSubmitWithdraw, exceedsMaxWithdrawable } from "@/lib/withdraw-math";

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

  const exceedsMax = exceedsMaxWithdrawable(amount, maxWithdrawable.data);

  const canSubmit = canSubmitWithdraw({
    selectedProductId,
    amount,
    maxWithdrawableLoaded: maxWithdrawable.data !== undefined,
    exceedsMax,
    isPending: withdraw.isPending,
  });

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),inset_0_-1px_0_0_rgba(0,0,0,0.2),0_16px_32px_-18px_rgba(0,0,0,0.7)]">
        <h1 className="text-lg font-semibold text-foreground">Withdraw</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          From subaccount &quot;{subaccountName}&quot;
        </p>

        <form
          className="mt-6 flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSubmit) return;
            setConfirmOpen(true);
          }}
        >
          <label className="flex flex-col gap-1.5 text-xs text-foreground-muted">
            Asset
            <TokenSelectDropdown tokens={tokens} value={selectedProductId} onChange={setProductId} />
          </label>

          <label className="flex flex-col gap-1.5 text-xs text-foreground-muted">
            <span className="flex items-center justify-between">
              Amount
              <span className="text-foreground-muted">
                Available: {maxWithdrawableHuman ?? "—"} {selectedToken?.symbol ?? ""}
              </span>
            </span>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-raised px-4 py-4 transition-colors focus-within:border-cove-indigo">
              <input
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="focus-ring-none w-full bg-transparent text-2xl font-semibold text-foreground focus:outline-none"
              />
              <button
                type="button"
                onClick={() => maxWithdrawableHuman && setAmount(maxWithdrawableHuman)}
                disabled={!maxWithdrawableHuman}
                className="btn-tactile-secondary shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold text-foreground-muted transition hover:text-foreground disabled:opacity-50"
              >
                Max
              </button>
            </div>
          </label>

          {exceedsMax && (
            <p className="text-sm text-negative">
              Amount exceeds what&apos;s safe to withdraw from this subaccount right now.
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="btn-tactile-primary rounded-full px-5 py-3.5 text-sm font-semibold text-background disabled:opacity-50"
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
      </div>

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
    </div>
  );
}
