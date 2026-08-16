import { parseAbi } from "viem";

/**
 * @nadohq/shared's own ERC20_ABI (used internally for balanceOf/allowance/
 * approve/transfer) doesn't include symbol()/decimals() — this fills that
 * gap for display purposes. Standard, well-known ERC20 view functions.
 */
export const ERC20_META_ABI = parseAbi([
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
]);
