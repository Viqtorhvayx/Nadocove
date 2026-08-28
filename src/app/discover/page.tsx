import { AddressLookup } from "@/components/address-lookup";
import { AppHeader } from "@/components/app-header";
import { DiscoverPanel } from "@/components/discover-panel";

export default function DiscoverPage() {
  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 pb-16">
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

        <DiscoverPanel />
      </main>
    </div>
  );
}
