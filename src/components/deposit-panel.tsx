"use client";

import { useMemo, useState } from "react";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import { ConfirmDialog, ConfirmRow } from "@/components/confirm-dialog";
import { Skeleton } from "@/components/skeleton";
import { TokenSelectDropdown } from "@/components/token-select-dropdown";
import { useActiveSubaccount } from "@/lib/subaccount-context";
import { useDirectDepositAddress } from "@/lib/use-direct-deposit-address";
import {
  useDepositableProductIds,
  useTokenMetadata,
  useTokenWalletBalance,
  useTokenAllowance,
  useDepositFlow,
  type DepositableToken,
} from "@/lib/use-deposit";
import {
  canSubmitDeposit,
  computeDepositAmountRaw,
  computeExceedsBalance,
  computeNeedsApproval,
} from "@/lib/deposit-math";

export function DepositPanel() {
  const { address } = useAccount();
  const { subaccountName } = useActiveSubaccount();
  const productIds = useDepositableProductIds();
  const metaQueries = useTokenMetadata(productIds);
  const [referralCodeInput, setReferralCodeInput] = useState("");
  const dda = useDirectDepositAddress(address, subaccountName);
  const [ddaCopied, setDdaCopied] = useState(false);

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

  const amountRaw = useMemo(
    () => computeDepositAmountRaw(amount, selectedToken?.decimals),
    [selectedToken, amount],
  );

  const walletBalanceHuman =
    selectedToken && walletBalance.data !== undefined
      ? formatUnits(walletBalance.data, selectedToken.decimals)
      : undefined;

  const allowanceRaw = allowance.data ? BigInt(allowance.data.toFixed(0)) : undefined;
  const needsApproval = computeNeedsApproval(amountRaw, allowanceRaw);
  const exceedsBalance = computeExceedsBalance(amountRaw, walletBalance.data);

  const canSubmit = canSubmitDeposit({
    selectedProductId,
    amountRaw,
    walletBalanceLoaded: walletBalance.data !== undefined,
    exceedsBalance,
    isPending: depositFlow.isPending,
  });

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),inset_0_-1px_0_0_rgba(0,0,0,0.2),0_16px_32px_-18px_rgba(0,0,0,0.7)]">
        <h1 className="text-lg font-semibold text-foreground">Deposit</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Into subaccount &quot;{subaccountName}&quot;
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
                Balance: {walletBalanceHuman ?? "—"} {selectedToken?.symbol ?? ""}
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
                onClick={() => walletBalanceHuman && setAmount(walletBalanceHuman)}
                disabled={!walletBalanceHuman}
                className="btn-tactile-secondary shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold text-foreground-muted transition hover:text-foreground disabled:opacity-50"
              >
                Max
              </button>
            </div>
          </label>

          {exceedsBalance && (
            <p className="text-sm text-negative">Amount exceeds your wallet balance.</p>
          )}

          <label className="flex flex-col gap-1.5 text-xs text-foreground-muted">
            Referral code (optional)
            <input
              value={referralCodeInput}
              onChange={(e) => setReferralCodeInput(e.target.value)}
              placeholder="Have a code? Enter it here"
              className="rounded-lg border border-border bg-surface-raised px-4 py-3 text-sm text-foreground placeholder:text-foreground-muted"
            />
          </label>

          <button
            type="submit"
            disabled={!canSubmit}
            className="btn-tactile-primary rounded-full px-5 py-3.5 text-sm font-semibold text-background disabled:opacity-50"
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
      </div>

      {(dda.isLoading || dda.data) && (
        <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-foreground-muted">Direct deposit address</span>
            {dda.data && (
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(dda.data).then(() => {
                    setDdaCopied(true);
                    setTimeout(() => setDdaCopied(false), 1500);
                  });
                }}
                className="btn-tactile-secondary rounded-full px-3 py-1 text-xs font-medium text-foreground-muted transition hover:text-foreground"
              >
                {ddaCopied ? "Copied!" : "Copy"}
              </button>
            )}
          </div>
          {dda.isLoading && <Skeleton className="mt-2 h-4 w-3/4" />}
          {dda.data && <p className="mt-2 break-all font-mono text-sm text-foreground">{dda.data}</p>}
          <p className="mt-2 text-xs text-foreground-muted">
            A dedicated address unique to this subaccount — funds sent here credit it directly.
            Verify with Nado what it accepts before sending anything; this isn&apos;t documented
            in the SDK NadoCove is built on.
          </p>
        </div>
      )}

      <ConfirmDialog
        title="Confirm deposit"
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (selectedProductId === undefined || amountRaw === undefined) return;
          depositFlow.mutate(
            { productId: selectedProductId, amountRaw, needsApproval, referralCode: referralCodeInput.trim() || undefined },
            { onSuccess: () => setConfirmOpen(false) },
          );
        }}
        confirmLabel={needsApproval ? "Approve & deposit" : "Deposit"}
        confirming={depositFlow.isPending}
      >
        <ConfirmRow label="Asset" value={selectedToken?.symbol ?? "—"} />
        <ConfirmRow label="Amount" value={amount || "—"} />
        <ConfirmRow label="Into subaccount" value={subaccountName} />
        {referralCodeInput.trim() && (
          <ConfirmRow label="Referral code" value={referralCodeInput.trim()} />
        )}
        {needsApproval ? (
          <ConfirmRow
            label="Steps"
            value="Approve token spend, then deposit (2 wallet prompts)"
          />
        ) : (
          <ConfirmRow label="Steps" value="Deposit (1 wallet prompt)" />
        )}
      </ConfirmDialog>
    </div>
  );
}
