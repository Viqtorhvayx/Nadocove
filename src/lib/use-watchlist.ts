"use client";

import { useCallback, useSyncExternalStore } from "react";
import { isAddress } from "viem";

const STORAGE_KEY = "nadocove:watchlist";

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

// Must be a stable reference — a fresh `[]` literal on every call breaks
// useSyncExternalStore's equality check and causes an infinite render loop.
const EMPTY_ADDRESSES: string[] = [];
function getServerSnapshot(): string[] {
  return EMPTY_ADDRESSES;
}

function write(next: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  notify();
}

/**
 * A personal, local-only list of addresses — stored in this browser's
 * localStorage, nowhere else. Not a social feature: nobody else can see
 * what's on your watchlist, and it doesn't follow you across devices. A
 * real "who's following whom" feature would need a backend to store that
 * relationship where others could see it, which this app doesn't have.
 */
export function useWatchlist() {
  const addresses = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const add = useCallback((address: string) => {
    if (!isAddress(address)) return false;
    const normalized = address.toLowerCase();
    const current = getSnapshot();
    if (current.some((a) => a.toLowerCase() === normalized)) return true;
    write([...current, address]);
    return true;
  }, []);

  const remove = useCallback((address: string) => {
    const current = getSnapshot();
    write(current.filter((a) => a.toLowerCase() !== address.toLowerCase()));
  }, []);

  return { addresses, add, remove };
}
