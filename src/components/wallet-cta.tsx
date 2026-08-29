"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";

type WalletCtaProps = {
  className: string;
  connectedLabel?: string;
  connectedHref?: string;
  idleLabel?: string;
};

/** Shared "Connect Wallet, or go straight to the dashboard if already
 * connected" action — used by the landing page's floating FAB and its
 * inline hero CTA, which need identical behavior but different styling. */
export function WalletCta({
  className,
  connectedLabel = "Go to Dashboard →",
  connectedHref = "/dashboard",
  idleLabel = "Connect Wallet",
}: WalletCtaProps) {
  const { isConnected } = useAccount();

  if (isConnected) {
    return (
      <Link href={connectedHref} className={className}>
        {connectedLabel}
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
          className={className}
        >
          {idleLabel}
        </button>
      )}
    </RainbowConnectButton.Custom>
  );
}
