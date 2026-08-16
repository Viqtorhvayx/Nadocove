"use client";

import { useAccount } from "wagmi";
import { TradeHistoryTable } from "@/components/trade-history-table";
import { useActiveSubaccount } from "@/lib/subaccount-context";

export default function HistoryTab() {
  const { address } = useAccount();
  const { subaccountName } = useActiveSubaccount();

  return <TradeHistoryTable owner={address} subaccountName={subaccountName} />;
}
