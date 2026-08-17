import { Logo } from "@/components/logo";
import { ConnectButton } from "@/components/connect-button";
import { AddressLookup } from "@/components/address-lookup";
import { DiscoverPanel } from "@/components/discover-panel";

export default function DiscoverPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6">
      <header className="flex items-center justify-between py-6">
        <Logo size={24} />
        <ConnectButton />
      </header>

      <main className="flex flex-1 flex-col gap-6 pb-16">
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
