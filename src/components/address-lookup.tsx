"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddressLookup() {
  const router = useRouter();
  const [value, setValue] = useState("");

  return (
    <form
      className="flex w-full max-w-md items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = value.trim();
        if (trimmed) router.push(`/u/${trimmed}`);
      }}
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Look up any address: 0x…"
        className="flex-1 rounded-full border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted"
      />
      <button
        type="submit"
        className="rounded-full border border-border px-4 py-2.5 text-sm font-medium text-foreground-muted transition hover:text-foreground"
      >
        View
      </button>
    </form>
  );
}
