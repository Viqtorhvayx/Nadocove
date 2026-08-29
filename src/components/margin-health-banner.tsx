"use client";

import Link from "next/link";
import { formatPercent } from "@/lib/format";
import { useMarginHealthStatus } from "@/lib/use-margin-health-status";

/**
 * A persistent, app-wide banner across the dashboard when a subaccount's
 * real assets/liabilities ratio drops close to (or below) its maintenance
 * requirement — a heads-up before liquidation risk, not just after. Not
 * dismissible: it should keep reflecting the account's actual current
 * state (refetched every 15s along with the rest of the health data).
 */
export function MarginHealthBanner() {
  const status = useMarginHealthStatus();
  if (!status) return null;

  const danger = status.level === "danger";

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
        danger
          ? "border-negative/30 bg-negative/10 text-negative"
          : "border-[#F5B942]/30 bg-[#F5B942]/10 text-[#F5B942]"
      }`}
    >
      <span className="flex items-center gap-2">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${danger ? "bg-negative" : "bg-[#F5B942]"}`} />
          <span className={`relative inline-flex h-2 w-2 rounded-full ${danger ? "bg-negative" : "bg-[#F5B942]"}`} />
        </span>
        <span className="font-medium">
          {danger
            ? "Your account is at or below its maintenance margin requirement — at risk of liquidation."
            : `Margin health is low (${formatPercent(status.ratio.minus(1), 0)} buffer above maintenance requirement).`}
        </span>
      </span>
      <Link
        href="/dashboard/deposit"
        className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
          danger
            ? "border-negative/40 text-negative hover:bg-negative/15"
            : "border-[#F5B942]/40 text-[#F5B942] hover:bg-[#F5B942]/15"
        }`}
      >
        Add margin
      </Link>
    </div>
  );
}
