"use client";

import { useEffect, useRef, useState } from "react";
import { TokenIcon } from "@/components/token-icon";
import type { DepositableToken } from "@/lib/use-deposit";

type TokenSelectDropdownProps = {
  tokens: DepositableToken[];
  value: number | undefined;
  onChange: (productId: number) => void;
};

/**
 * An icon-forward asset picker for deposit/withdraw — a native <select>
 * can't show token logos in its options, so this is the same custom
 * dropdown pattern as SubaccountDropdown and the Trade page's market
 * picker: a themed button + absolute list instead of OS chrome.
 */
export function TokenSelectDropdown({ tokens, value, onChange }: TokenSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = tokens.find((t) => t.productId === value);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={tokens.length === 0}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface-raised px-4 py-3.5 text-left transition hover:border-cove-indigo/40 disabled:opacity-60"
      >
        {selected ? (
          <>
            <TokenIcon symbol={selected.symbol} size={28} />
            <span className="text-base font-semibold text-foreground">{selected.symbol}</span>
          </>
        ) : (
          <span className="text-sm text-foreground-muted">Loading…</span>
        )}
        <svg viewBox="0 0 20 20" fill="none" className={`ml-auto h-4 w-4 shrink-0 text-foreground-muted transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && tokens.length > 0 && (
        <div className="cove-scale-in absolute left-0 top-full z-20 mt-1.5 max-h-72 w-full overflow-y-auto rounded-xl border border-border bg-surface-raised p-1 shadow-[0_20px_40px_-16px_rgba(0,0,0,0.8)]">
          {tokens.map((t) => (
            <button
              key={t.productId}
              type="button"
              onClick={() => {
                onChange(t.productId);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                t.productId === value ? "bg-cove-indigo/15 text-foreground" : "text-foreground-muted hover:bg-surface hover:text-foreground"
              }`}
            >
              <TokenIcon symbol={t.symbol} size={24} />
              <span className="text-sm font-medium">{t.symbol}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
