"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "nadocove:favorite-markets";

const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedParsed: string[] = [];

function notify() {
  for (const l of listeners) l();
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): string[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedParsed = raw ? JSON.parse(raw) : [];
    } catch {
      cachedParsed = [];
    }
  }
  return cachedParsed;
}

const EMPTY: string[] = [];
function getServerSnapshot(): string[] {
  return EMPTY;
}

function write(next: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  notify();
}

/** Personal, local-only starred markets for the search modal — same
 * honest-local-storage pattern as useWatchlist, just for symbols. */
export function useFavoriteMarkets() {
  const symbols = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback((symbol: string) => {
    const current = getSnapshot();
    write(current.includes(symbol) ? current.filter((s) => s !== symbol) : [...current, symbol]);
  }, []);

  const isFavorite = useCallback((symbol: string) => getSnapshot().includes(symbol), []);

  return { symbols, toggle, isFavorite };
}
