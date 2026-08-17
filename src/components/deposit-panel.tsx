"use client";

import { useMemo, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { Card } from "@/components/card";
import { ConfirmDialog, ConfirmRow } from "@/components/confirm-dialog";
import { useActiveSubaccount } from "@/lib/subaccount-context";
import {
  useDepositableProductIds,
  useTokenMetadata,
  useTokenWalletBalance,
  useTokenAllowance,
  useDepositFlow,
  type DepositableToken,
} from "@/lib/use-deposit";

export function DepositPanel() {
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

  const walletBalance = useTokenWalletBalance(selectedProductId);
  const allowance = useTokenAllowance(selectedProductId);
  const depositFlow = useDepositFlow();

  const amountRaw = useMemo(() => {
    if (!selectedToken || !amount || Number(amount) <= 0) return undefined;
    try {
      return parseUnits(amount, selectedToken.decimals);
    } catch {
      return undefined;
    }
  }, [selectedToken, amount]);

  const walletBalanceHuman =
    selectedToken && walletBalance.data !== undefined
      ? formatUnits(walletBalance.data, selectedToken.decimals)
      : undefined;

  // getTokenAllowance returns a BigNumber over the raw (undecimalled) token
  // amount — same units as amountRaw, no human-decimal scaling either side.
  const allowanceRaw = allowance.data ? BigInt(allowance.data.toFixed(0)) : undefined;
  const needsApproval =
    amountRaw !== undefined && (allowanceRaw === undefined || allowanceRaw < amountRaw);

  const exceedsBalance =
    amountRaw !== undefined && walletBalance.data !== undefined && amountRaw > walletBalance.data;

  const canSubmit =
    selectedProductId !== undefined &&
    amountRaw !== undefined &&
    amountRaw > BigInt(0) &&
    walletBalance.data !== undefined &&
    !exceedsBalance &&
    !depositFlow.isPending;

  return (
    <Card title="Deposit" note={`into subaccount "${subaccountName}"`}>
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
              onClick={() => walletBalanceHuman && setAmount(walletBalanceHuman)}
              disabled={!walletBalanceHuman}
              className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground-muted transition hover:text-foreground disabled:opacity-50"
            >
              Max
            </button>
          </div>
          <span className="text-xs text-foreground-muted">
            Wallet balance: {walletBalanceHuman ?? "—"} {selectedToken?.symbol ?? ""}
          </span>
        </label>

        {exceedsBalance && (
          <p className="text-sm text-negative">Amount exceeds your wallet balance.</p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-full bg-cove-indigo px-5 py-2.5 text-sm font-semibold text-background transition hover:bg-cove-indigo-dim disabled:opacity-50"
        >
          Review deposit
        </button>

        {depositFlow.isError && (
          <p className="text-sm text-negative">
            {depositFlow.error instanceof Error
              ? depositFlow.error.message
              : "Deposit failed."}
          </p>
        )}
        {depositFlow.isSuccess && (
          <p className="text-sm text-positive">Deposit confirmed: {depositFlow.data}</p>
        )}
      </form>

      <ConfirmDialog
        title="Confirm deposit"
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (selectedProductId === undefined || amountRaw === undefined) return;
          depositFlow.mutate(
            { productId: selectedProductId, amountRaw, needsApproval },
            { onSuccess: () => setConfirmOpen(false) },
          );
        }}
        confirmLabel={needsApproval ? "Approve & deposit" : "Deposit"}
        confirming={depositFlow.isPending}
      >
        <ConfirmRow label="Asset" value={selectedToken?.symbol ?? "—"} />
        <ConfirmRow label="Amount" value={amount || "—"} />
        <ConfirmRow label="Into subaccount" value={subaccountName} />
        {needsApproval ? (
          <ConfirmRow
            label="Steps"
            value="Approve token spend, then deposit (2 wallet prompts)"
          />
        ) : (
          <ConfirmRow label="Steps" value="Deposit (1 wallet prompt)" />
        )}
      </ConfirmDialog>
    </Card>
  );
}
