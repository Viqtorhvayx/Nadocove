import { AddressLookup } from "@/components/address-lookup";
import { AppShell } from "@/components/app-shell";
import { DiscoverPanel } from "@/components/discover-panel";
import { NlpPoolCard } from "@/components/nlp-pool-card";

export default function DiscoverPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground">Discover</h1>
        <p className="max-w-xl text-sm text-foreground-muted">
          Real standings from Nado&apos;s own trading competitions — no wallet
          needed. Look up any address directly, too.
        </p>
        <div className="mt-2 max-w-md">
          <AddressLookup />
        </div>
      </div>

      <NlpPoolCard />

      <DiscoverPanel />
    </AppShell>
  );
}
