import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { CHAIN_ENV_TO_CHAIN } from "@nadohq/shared";
import { CHAIN_ENV } from "@/lib/chain-env";
import { proxyRpcUrl } from "@/lib/nado-endpoints";

export { CHAIN_ENV };

const inkChain = CHAIN_ENV_TO_CHAIN[CHAIN_ENV];

// A real WalletConnect project ID (free, from https://cloud.walletconnect.com)
// is needed for WalletConnect-based wallets and RainbowKit's mobile QR flow.
// Injected wallets (MetaMask, Rabby, etc.) work fine with the placeholder.
const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "00000000000000000000000000000000";

export const wagmiConfig = getDefaultConfig({
  appName: "NadoCove",
  projectId: walletConnectProjectId,
  chains: [inkChain],
  transports: {
    // Ink's RPC doesn't send CORS headers for browser origins — route
    // through our server-side proxy instead. See nado-endpoints.ts.
    [inkChain.id]: http(proxyRpcUrl()),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
