"use client";

import { useState } from "react";
import BigNumber from "bignumber.js";
import { AddressAvatar } from "@/components/address-avatar";
import { SubaccountDropdown } from "@/components/subaccount-dropdown";
import { formatUsd, truncateAddress } from "@/lib/format";
import { useUsername } from "@/lib/use-username";

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="btn-tactile-secondary flex h-9 w-9 items-center justify-center rounded-full text-foreground-muted transition hover:text-foreground"
    >
      {children}
    </button>
  );
}

type PortfolioHeaderProps = {
  address: string;
  subaccountName: string;
  onSubaccountChange: (name: string) => void;
  totalValue: BigNumber | undefined;
  isHealthy: boolean | undefined;
};

/**
 * The wallet-identity strip above the tabs — avatar, name/address,
 * subaccount switcher, live total value, and two real actions (copy
 * address, copy this account's public NadoCove profile link). No "Added"
 * watchlist button here the way the reference has — that's for viewing
 * someone else's wallet, not your own.
 */
export function PortfolioHeader({
  address,
  subaccountName,
  onSubaccountChange,
  totalValue,
  isHealthy,
}: PortfolioHeaderProps) {
  const [copied, setCopied] = useState<"address" | "link" | undefined>(undefined);
  const username = useUsername(address);

  function copy(text: string, which: "address" | "link") {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(which);
      setTimeout(() => setCopied(undefined), 1500);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <AddressAvatar address={address} size={44} />
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-foreground">
                {username.data ? `@${username.data}` : truncateAddress(address)}
              </span>
              <SubaccountDropdown ownerAddress={address} value={subaccountName} onChange={onSubaccountChange} />
            </div>
            {username.data && (
              <span className="font-mono text-xs text-foreground-muted">{truncateAddress(address)}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isHealthy !== undefined && (
            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                isHealthy ? "border-positive/30 bg-positive/10 text-positive" : "border-negative/30 bg-negative/10 text-negative"
              }`}
            >
              {isHealthy ? "Healthy" : "At risk"}
            </span>
          )}
          <IconButton label={copied === "address" ? "Copied!" : "Copy address"} onClick={() => copy(address, "address")}>
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
              <rect x="7" y="7" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M13 7V5.5A1.5 1.5 0 0 0 11.5 4H5.5A1.5 1.5 0 0 0 4 5.5v6A1.5 1.5 0 0 0 5.5 13H7" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </IconButton>
          <IconButton
            label={copied === "link" ? "Copied!" : "Copy public profile link"}
            onClick={() => copy(`${window.location.origin}/u/${address}`, "link")}
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
              <path
                d="M8.5 11.5 11.5 8.5M7 13l-1.5 1.5a2.5 2.5 0 0 1-3.5-3.5L3.5 9.5m9-3L14 5a2.5 2.5 0 0 1 3.5 3.5L16 10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </IconButton>
        </div>
      </div>

      <div className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        {totalValue ? formatUsd(totalValue) : "—"}
      </div>
    </div>
  );
}
