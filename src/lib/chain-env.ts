// Switch to 'inkMainnet' once mainnet-ready; keeping testnet as the default
// while this is under active development avoids accidentally routing real
// funds. Split into its own module so both wagmi.ts and nado-endpoints.ts
// can import it without a circular dependency.
export const CHAIN_ENV = "inkTestnet" as const;
