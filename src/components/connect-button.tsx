"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";

type ConnectButtonProps = {
  className?: string;
};

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function ConnectButton({ className }: ConnectButtonProps) {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const baseClass =
    "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:opacity-60 " +
    (className ?? "");

  if (isConnected && address) {
    return (
      <button
        type="button"
        onClick={() => disconnect()}
        className={`${baseClass} border border-border bg-surface text-foreground hover:border-cove-teal-dim`}
      >
        {truncateAddress(address)}
      </button>
    );
  }

  const injectedConnector = connectors.find((c) => c.id === "injected") ?? connectors[0];

  return (
    <button
      type="button"
      disabled={isPending || !injectedConnector}
      onClick={() => injectedConnector && connect({ connector: injectedConnector })}
      className={`${baseClass} bg-cove-teal text-background hover:bg-cove-teal-dim`}
    >
      {isPending ? "Connecting…" : "Connect Wallet"}
    </button>
  );
}
