// Ink mainnet — real funds. Every deposit, trade, and claim through this
// app now moves real money; there is no faucet, no reset, no undo. Split
// into its own module so both wagmi.ts and nado-endpoints.ts can import it
// without a circular dependency.
export const CHAIN_ENV = "inkMainnet" as const;
