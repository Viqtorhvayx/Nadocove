import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { CHAIN_ENV_TO_CHAIN } from "@nadohq/shared";
import { CHAIN_ENV } from "@/lib/chain-env";
import { proxyRpcUrl } from "@/lib/nado-endpoints";

export { CHAIN_ENV };

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
    // Ink's RPC doesn't send CORS headers for browser origins — route
    // through our server-side proxy instead. See nado-endpoints.ts.
    [inkChain.id]: http(proxyRpcUrl()),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
