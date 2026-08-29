"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import BigNumber from "bignumber.js";
import { ProductEngineType } from "@nadohq/shared";
import type { EngineSymbol } from "@nadohq/engine-client";
import { TokenIcon } from "@/components/token-icon";
import { formatUsd, formatPercent } from "@/lib/format";
import { maxLeverageFor } from "@/lib/market-leverage";
import { useFavoriteMarkets } from "@/lib/use-favorite-markets";
import type { MarketOverviewEntry } from "@/lib/use-market-overview";

type Category = "all" | "favorites" | "perp" | "spot";

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "all", label: "All" },
  { id: "favorites", label: "Favorites" },
  { id: "perp", label: "Perps" },
  { id: "spot", label: "Spot" },
];

type MarketSearchModalProps = {
  open: boolean;
  onClose: () => void;
  symbols: EngineSymbol[];
  overview: Record<number, MarketOverviewEntry> | undefined;
  selectedProductId: number | undefined;
  onSelect: (productId: number) => void;
};

/**
 * The full market picker — a searchable table (not a cramped dropdown),
 * since Nado lists ~90 markets. Every column is real: last price and 24h
 * change/volume from getV2Tickers, funding from getMultiProductFundingRates.
 * Favorites are local-only (see useFavoriteMarkets), same honesty as the
 * rest of NadoCove's "local, not social" affordances.
 */
export function MarketSearchModal({
  open,
  onClose,
  symbols,
  overview,
  selectedProductId,
  onSelect,
}: MarketSearchModalProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const favorites = useFavoriteMarkets();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return symbols.filter((s) => {
      if (q && !s.symbol.toLowerCase().includes(q)) return false;
      if (category === "favorites") return favorites.symbols.includes(s.symbol);
      if (category === "perp") return s.type === ProductEngineType.PERP;
      if (category === "spot") return s.type === ProductEngineType.SPOT;
      return true;
    });
  }, [symbols, query, category, favorites.symbols]);

  // Reset the search/highlight state whenever the modal transitions open,
  // or whenever the filter changes while open — done during render (the
  // React-documented way to "adjust state when a prop changes", using
  // useState rather than a ref since refs can't be written during render)
  // rather than an effect, since there's no external system to sync with.
  const [prevOpen, setPrevOpen] = useState(open);
  const filterKey = `${query}|${category}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setQuery("");
      setHighlighted(0);
    }
  } else if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setHighlighted(0);
  }

  useEffect(() => {
    if (open) {
      const id = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(id);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlighted((h) => Math.min(filtered.length - 1, h + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlighted((h) => Math.max(0, h - 1));
      } else if (e.key === "Enter") {
        const target = filtered[highlighted];
        if (target) {
          onSelect(target.productId);
          onClose();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        const target = filtered[highlighted];
        if (target) {
          e.preventDefault();
          favorites.toggle(target.symbol);
        }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, filtered, highlighted, onClose, onSelect, favorites]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-[8vh]" onClick={onClose}>
      <div
        className="cove-scale-in flex max-h-[78vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_40px_80px_-24px_rgba(0,0,0,0.8)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border p-3">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-raised px-3 py-2">
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0 text-foreground-muted">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
              <path d="m17 17-4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search markets…"
              className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground-muted focus:outline-none"
            />
          </div>
          <div className="mt-3 flex gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  category === c.id
                    ? "nav-item-active text-cove-indigo"
                    : "text-foreground-muted hover:bg-surface-raised hover:text-foreground"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-[auto_1.5fr_1fr_1fr_1fr] gap-2 px-4 py-2 text-[11px] text-foreground-muted">
            <span />
            <span>Market</span>
            <span className="text-right">Last Price</span>
            <span className="text-right">24h Change</span>
            <span className="text-right">Volume</span>
          </div>
          {filtered.length === 0 && (
            <p className="px-4 py-6 text-sm text-foreground-muted">No markets match &ldquo;{query}&rdquo;.</p>
          )}
          {filtered.map((s, i) => {
            const ov = overview?.[s.productId];
            const isFav = favorites.symbols.includes(s.symbol);
            const up = ov ? ov.priceChangePercent24h >= 0 : true;
            const leverage = maxLeverageFor(s);
            return (
              <button
                key={s.productId}
                type="button"
                onMouseEnter={() => setHighlighted(i)}
                onClick={() => {
                  onSelect(s.productId);
                  onClose();
                }}
                className={`grid w-full grid-cols-[auto_1.5fr_1fr_1fr_1fr] items-center gap-2 px-4 py-2 text-left text-sm transition ${
                  i === highlighted ? "bg-surface-raised" : ""
                } ${s.productId === selectedProductId ? "text-cove-indigo" : "text-foreground"}`}
              >
                <span
                  role="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.stopPropagation();
                    favorites.toggle(s.symbol);
                  }}
                  className={`text-base leading-none ${isFav ? "text-cove-amber" : "text-border"}`}
                >
                  ★
                </span>
                <span className="flex items-center gap-2 truncate font-medium">
                  <TokenIcon symbol={s.symbol} size={18} />
                  <span className="truncate">{s.symbol}</span>
                  {leverage !== undefined && (
                    <span className="shrink-0 rounded-full border border-border px-1.5 py-0.5 text-[10px] text-foreground-muted">
                      {leverage}x
                    </span>
                  )}
                </span>
                <span className="text-right tabular-nums text-foreground-muted">
                  {ov ? formatUsd(new BigNumber(ov.lastPrice)) : "—"}
                </span>
                <span className={`text-right tabular-nums ${ov ? (up ? "text-positive" : "text-negative") : "text-foreground-muted"}`}>
                  {ov ? `${up ? "+" : ""}${formatPercent(new BigNumber(ov.priceChangePercent24h / 100))}` : "—"}
                </span>
                <span className="text-right tabular-nums text-foreground-muted">
                  {ov ? formatUsd(new BigNumber(ov.quoteVolume24h), true) : "—"}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border px-4 py-2.5 text-[11px] text-foreground-muted">
          <span><kbd className="rounded border border-border px-1">↑↓</kbd> Navigate</span>
          <span><kbd className="rounded border border-border px-1">Enter</kbd> Select</span>
          <span><kbd className="rounded border border-border px-1">⌘S</kbd> Favorite</span>
          <span><kbd className="rounded border border-border px-1">Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}
