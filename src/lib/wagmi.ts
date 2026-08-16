import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { CHAIN_ENV_TO_CHAIN } from "@nadohq/shared";

// Switch to 'ink' once mainnet-ready; keeping testnet as the default while
// this is under active development avoids accidentally routing real funds.
export const CHAIN_ENV = "inkTestnet" as const;

const inkChain = CHAIN_ENV_TO_CHAIN[CHAIN_ENV];

export const wagmiConfig = createConfig({
  chains: [inkChain],
  connectors: [
    injected(), // MetaMask, Rabby, Phantom (EVM), and other browser wallets
    // WalletConnect needs a projectId from https://cloud.walletconnect.com —
    // add it via NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID once you have one:
    // walletConnect({ projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID! }),
  ],
  transports: {
    [inkChain.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
