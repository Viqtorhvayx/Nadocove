"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { EngineSymbol } from "@nadohq/engine-client";
import { TokenIcon } from "@/components/token-icon";

type MarketSelectProps = {
  symbols: EngineSymbol[];
  selectedProductId: number | undefined;
  onChange: (productId: number) => void;
};

/**
 * A custom dropdown for the market picker — a native <select>'s open-state
 * popup is OS-rendered and can't be themed, so it broke the dark UI the
 * instant a user opened it. This renders its own list so it stays dark and
 * on-brand, and adds a filter box since Nado lists ~80 markets.
 */
export function MarketSelect({ symbols, selectedProductId, onChange }: MarketSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = symbols.find((s) => s.productId === selectedProductId);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return symbols;
    return symbols.filter((s) => s.symbol.toLowerCase().includes(q));
  }, [symbols, query]);

  function close() {
    setOpen(false);
    setQuery("");
  }

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        close();
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface-raised px-3 py-2 text-left text-sm text-foreground transition hover:border-foreground-muted"
      >
        {selected ? (
          <>
            <TokenIcon symbol={selected.symbol} size={16} />
            <span className="truncate">{selected.symbol}</span>
          </>
        ) : (
          <span className="text-foreground-muted">
            {symbols.length === 0 ? "Loading…" : "Select market"}
          </span>
        )}
        <svg
          viewBox="0 0 20 20"
          fill="none"
          className={`ml-auto h-3.5 w-3.5 shrink-0 text-foreground-muted transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-20 mt-1.5 w-full min-w-[220px] cove-scale-in rounded-xl border border-border bg-surface-raised shadow-[0_20px_40px_-16px_rgba(0,0,0,0.8)]">
          <div className="border-b border-border p-2">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search markets…"
              className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-foreground placeholder:text-foreground-muted"
            />
          </div>
          <ul className="max-h-64 overflow-y-auto p-1">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-xs text-foreground-muted">No markets match &ldquo;{query}&rdquo;.</li>
            )}
            {filtered.map((s) => (
              <li key={s.productId}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(s.productId);
                    close();
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition ${
                    s.productId === selectedProductId
                      ? "bg-cove-indigo/15 text-foreground"
                      : "text-foreground-muted hover:bg-background hover:text-foreground"
                  }`}
                >
                  <TokenIcon symbol={s.symbol} size={16} />
                  <span className="truncate">{s.symbol}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
