"use client";

import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";
import { truncateAddress } from "@/lib/format";

type ConnectButtonProps = {
  className?: string;
};

export function ConnectButton({ className }: ConnectButtonProps) {
  const baseClass =
    "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:opacity-60 " +
    (className ?? "");

  return (
    <RainbowConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: { opacity: 0, pointerEvents: "none", userSelect: "none" },
            })}
          >
            {!connected ? (
              <button
                type="button"
                onClick={openConnectModal}
                className={`${baseClass} btn-tactile-primary text-background`}
              >
                Connect Wallet
              </button>
            ) : chain.unsupported ? (
              <button
                type="button"
                onClick={openChainModal}
                className={`${baseClass} border border-negative text-negative hover:bg-negative/10`}
              >
                Wrong network
              </button>
            ) : (
              <button
                type="button"
                onClick={openAccountModal}
                className={`${baseClass} btn-tactile-secondary text-foreground hover:brightness-110`}
              >
                {account.ensName ?? truncateAddress(account.address)}
              </button>
            )}
          </div>
        );
      }}
    </RainbowConnectButton.Custom>
  );
}
