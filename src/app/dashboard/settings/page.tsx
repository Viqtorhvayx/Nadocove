"use client";

import { useAccount } from "wagmi";
import { Card } from "@/components/card";
import { SubaccountSelector } from "@/components/subaccount-selector";
import { ClaimBuilderFeeCard } from "@/components/claim-builder-fee-card";
import { SignInButton, SessionAddress } from "@/components/sign-in-button";
import { useActiveSubaccount } from "@/lib/subaccount-context";

export default function SettingsTab() {
  const { address } = useAccount();
  const { subaccountName, setSubaccountName } = useActiveSubaccount();

  return (
    <>
      <Card title="NadoCove identity" note="separate from your wallet connection">
        <p className="mb-4 text-sm text-foreground-muted">
          A wallet connection proves you can trade — it doesn&apos;t prove
          who&apos;s making a request to NadoCove&apos;s own backend. Sign in
          with a free signature (no gas, no transaction) to claim a username
          or follow other traders.
        </p>
        <div className="flex items-center justify-between">
          <SessionAddress />
          <SignInButton />
        </div>
      </Card>

      <Card title="Subaccount" note="max 12 characters">
        <p className="mb-4 text-sm text-foreground-muted">
          Nado subaccounts are independent trading accounts under the same
          wallet. Switch to view or trade a different one, or type a new name
          to start one — it&apos;s created automatically the first time you
          deposit into it.
        </p>
        <SubaccountSelector
          ownerAddress={address}
          value={subaccountName}
          onChange={setSubaccountName}
          allowCustom
        />
      </Card>

      <Card
        title="Public on-chain data"
        note="not a privacy control"
        className="border-dashed"
      >
        <p className="text-sm text-foreground-muted">
          Your subaccount balances, positions, and trade history are public
          on-chain data, readable by anyone who queries Nado&apos;s own API
          directly — including at{" "}
          <code className="text-xs">nadocove.xyz/u/{address ?? "your-address"}</code>.
          There&apos;s no toggle here or anywhere else that can make this
          private: doing that for real would need Nado itself to restrict who
          can read it, not a setting in a third-party app like this one.
        </p>
      </Card>

      <ClaimBuilderFeeCard />
    </>
  );
}
