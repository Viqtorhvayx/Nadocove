"use client";

import { useState } from "react";
import { isAddress } from "viem";
import { Card } from "@/components/card";
import { useWatchlist } from "@/lib/use-watchlist";
import { truncateAddress } from "@/lib/format";

export function WatchlistPanel() {
  const { addresses, add, remove } = useWatchlist();
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <Card
      title="Watchlist"
      note="local to this browser"
    >
      <p className="mb-4 text-sm text-foreground-muted">
        Personal, private shortcuts to addresses you check often — stored only
        on this device. This isn&apos;t a social feature: nobody can see your
        watchlist, and it doesn&apos;t sync anywhere.
      </p>

      <form
        className="mb-4 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = input.trim();
          if (!isAddress(trimmed)) {
            setError("Not a valid address.");
            return;
          }
          add(trimmed);
          setInput("");
          setError(null);
        }}
      >
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError(null);
          }}
          placeholder="Add address: 0x…"
          className="flex-1 rounded-full border border-border bg-surface-raised px-5 py-3 text-sm text-foreground placeholder:text-foreground-muted"
        />
        <button
          type="submit"
          className="btn-tactile-secondary rounded-full px-5 py-3 text-sm font-medium text-foreground-muted transition-colors hover:text-foreground"
        >
          Add
        </button>
      </form>
      {error && <p className="mb-4 text-sm text-negative">{error}</p>}

      {addresses.length === 0 ? (
        <p className="text-sm text-foreground-muted">
          Nothing on your watchlist yet.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {addresses.map((address) => (
            <div
              key={address}
              className="-mx-2 flex items-center justify-between rounded-lg px-2 py-2.5 text-sm transition hover:bg-surface-raised"
            >
              <a
                href={`/u/${address}`}
                className="font-mono text-foreground hover:text-cove-indigo"
              >
                {truncateAddress(address)}
              </a>
              <button
                type="button"
                onClick={() => remove(address)}
                className="text-xs text-foreground-muted hover:text-negative"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
