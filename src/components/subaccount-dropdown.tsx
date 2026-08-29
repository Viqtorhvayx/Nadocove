"use client";

import { useEffect, useRef, useState } from "react";
import { useListSubaccounts } from "@/lib/use-list-subaccounts";

type SubaccountDropdownProps = {
  ownerAddress: string | undefined;
  value: string;
  onChange: (name: string) => void;
};

/**
 * A small custom dropdown for switching subaccounts — a native <select>
 * can't be themed while its popup is open (same issue fixed on the Trade
 * page's market picker), so this is the same pattern: a button + a
 * dark-themed absolute list instead of OS chrome.
 */
export function SubaccountDropdown({ ownerAddress, value, onChange }: SubaccountDropdownProps) {
  const { names } = useListSubaccounts(ownerAddress);
  const options = names.includes(value) ? names : [...names, value];
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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

  if (options.length <= 1) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5 text-xs font-medium text-foreground-muted transition hover:text-foreground"
      >
        {value}
        <svg viewBox="0 0 20 20" fill="none" className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="cove-scale-in absolute left-0 top-full z-20 mt-1.5 min-w-[9rem] rounded-xl border border-border bg-surface-raised p-1 shadow-[0_20px_40px_-16px_rgba(0,0,0,0.8)]">
          {options.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                onChange(name);
                setOpen(false);
              }}
              className={`block w-full rounded-lg px-2.5 py-1.5 text-left text-sm transition ${
                name === value ? "bg-cove-indigo/15 text-foreground" : "text-foreground-muted hover:bg-surface hover:text-foreground"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
