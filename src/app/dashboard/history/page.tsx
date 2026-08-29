"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { FundingInterestHistoryTable } from "@/components/funding-interest-history-table";
import { TradeHistoryTable } from "@/components/trade-history-table";
import { useActiveSubaccount } from "@/lib/subaccount-context";

const TABS = ["Trades", "Funding & Interest"] as const;
type Tab = (typeof TABS)[number];

export default function HistoryTab() {
  const { address } = useAccount();
  const { subaccountName } = useActiveSubaccount();
  const [tab, setTab] = useState<Tab>("Trades");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-5 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`border-b-2 pb-2.5 text-sm font-semibold transition ${
              tab === t ? "border-cove-indigo text-foreground" : "border-transparent text-foreground-muted hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Trades" && <TradeHistoryTable owner={address} subaccountName={subaccountName} />}
      {tab === "Funding & Interest" && <FundingInterestHistoryTable owner={address} subaccountName={subaccountName} />}
    </div>
  );
}
