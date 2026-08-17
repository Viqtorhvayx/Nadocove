"use client";

import type { ReactNode } from "react";

type ConfirmDialogProps = {
  title: string;
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  confirming?: boolean;
  children: ReactNode;
};

export function ConfirmDialog({
  title,
  open,
  onCancel,
  onConfirm,
  confirmLabel = "Confirm",
  confirming = false,
  children,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-[cove-fade-in_150ms_ease-out]"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl shadow-black/50 animate-[cove-scale-in_180ms_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <div className="mt-4 flex flex-col gap-2 text-sm">{children}</div>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-foreground-muted transition hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming}
            className="flex-1 rounded-full bg-cove-indigo px-4 py-2.5 text-sm font-semibold text-background transition hover:bg-cove-indigo-dim disabled:opacity-50"
          >
            {confirming ? "Submitting…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ConfirmRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-foreground-muted">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}
