"use client";

import { useState } from "react";
import { useListSubaccounts } from "@/lib/use-list-subaccounts";

type SubaccountSelectorProps = {
  ownerAddress: string | undefined;
  value: string;
  onChange: (name: string) => void;
  /** Allow switching to a name not yet seen on-chain (e.g. before a first deposit). */
  allowCustom?: boolean;
  className?: string;
};

export function SubaccountSelector({
  ownerAddress,
  value,
  onChange,
  allowCustom = false,
  className,
}: SubaccountSelectorProps) {
  const { names, isLoading } = useListSubaccounts(ownerAddress);
  const [customName, setCustomName] = useState("");

  const options = names.includes(value) ? names : [...names, value];

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
        className="rounded-lg border border-border bg-surface-raised px-3 py-1.5 text-sm text-foreground"
      >
        {options.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
      {allowCustom && (
        <form
          className="flex items-center gap-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = customName.trim();
            if (!trimmed) return;
            onChange(trimmed);
            setCustomName("");
          }}
        >
          <input
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="new subaccount"
            maxLength={12}
            className="w-36 rounded-lg border border-border bg-surface-raised px-3 py-2 text-xs text-foreground placeholder:text-foreground-muted"
          />
          <button
            type="submit"
            className="rounded-lg border border-border px-3 py-2 text-xs text-foreground-muted transition hover:text-foreground"
          >
            Switch
          </button>
        </form>
      )}
    </div>
  );
}
