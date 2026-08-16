"use client";

import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";

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
                className={`${baseClass} bg-cove-teal text-background hover:bg-cove-teal-dim`}
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
                className={`${baseClass} border border-border bg-surface text-foreground hover:border-cove-teal-dim`}
              >
                {account.displayName}
              </button>
            )}
          </div>
        );
      }}
    </RainbowConnectButton.Custom>
  );
}
