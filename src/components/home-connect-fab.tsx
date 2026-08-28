"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";

const FAB_CLASS =
  "fixed bottom-8 right-6 z-40 rounded-full bg-cove-indigo px-5 py-3 text-sm font-semibold text-background shadow-lg shadow-cove-indigo/30 transition hover:bg-cove-indigo-dim sm:right-8";

/**
 * The landing page's one persistent action — anchored to the side instead
 * of living in the header, so it stays reachable while scrolling without
 * pinning app-internal nav (Discover, Dashboard) in front of first-time
 * visitors who haven't connected anything yet. Doubles as the one-click
 * path into the dashboard once a wallet is connected.
 */
export function HomeConnectFab() {
  const { isConnected } = useAccount();

  if (isConnected) {
    return (
      <Link href="/dashboard" className={FAB_CLASS}>
        Go to Dashboard →
      </Link>
    );
  }

  return (
    <RainbowConnectButton.Custom>
      {({ openConnectModal, mounted }) => (
        <button
          type="button"
          onClick={openConnectModal}
          {...(!mounted && {
            "aria-hidden": true,
            style: { opacity: 0, pointerEvents: "none" },
          })}
          className={FAB_CLASS}
        >
          Connect Wallet
        </button>
      )}
    </RainbowConnectButton.Custom>
  );
}
