import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import BigNumber from "bignumber.js";
import { addDecimals, removeDecimals } from "@nadohq/shared";
import { useNadoClient } from "@/lib/use-nado-client";
import { useActiveSubaccount } from "@/lib/subaccount-context";

/**
 * Engine-estimated max withdrawable amount for a product in the active
 * subaccount — margin-aware (won't let a withdrawal break a leveraged
 * position's health), unlike just reading the raw balance.
 *
 * Rescaled to human units here. The SDK's getMaxWithdrawable returns
 * `toBigNumber(max_withdrawable)` with no removeDecimals call (see
 * EngineQueryClient.getMaxWithdrawable), leaving a raw 18-decimal integer
 * — the same SDK bug class already documented in
 * rescale-subaccount-summary.ts and use-nlp-pool.ts. Confirmed live against
 * Nado mainnet: a funded account holding 78.03 USD₮0 came back as
 * "78032262443384210699", so without this the panel printed a 20-digit
 * "Available" figure, the Max button typed that integer into the amount
 * box (which the submit path then scaled by 1e18 again), and the
 * exceeds-max guard compared human input against a raw x18 bound and so
 * never fired.
 */
export function useMaxWithdrawable(productId: number | undefined) {
  const { address } = useAccount();
  const { subaccountName } = useActiveSubaccount();
  const nadoClient = useNadoClient();

  return useQuery({
    queryKey: ["max-withdrawable", address, subaccountName, productId],
    queryFn: () =>
      nadoClient!.spot.getMaxWithdrawable({
        subaccountOwner: address!,
        subaccountName,
        productId: productId!,
      }),
    select: (maxWithdrawable) => removeDecimals(maxWithdrawable, 18),
    enabled: Boolean(nadoClient && address && productId !== undefined),
    refetchInterval: 15_000,
  });
}

/**
 * Requests a withdrawal — a single EIP-712 signature to the engine, not an
 * on-chain transaction from the user. The engine processes it and releases
 * funds to the subaccount owner's wallet; there's no verified way from this
 * SDK to know exactly when that lands on-chain, so the UI doesn't claim a
 * timeline.
 *
 * `amount` is human units (e.g. "0.1") — internally scaled to the engine's
 * fixed 18-decimal representation, same as order amounts. This is NOT the
 * ERC20 token's own decimals (confirmed by reading getNadoEIP712Values:
 * withdraw_collateral's amount goes through toIntegerString with no
 * addDecimals call, meaning the caller must pre-scale it — exactly how
 * usePlaceOrder already handles its own amount field).
 */
export function useWithdraw() {
  const nadoClient = useNadoClient();
  const { subaccountName } = useActiveSubaccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, amount }: { productId: number; amount: string }) => {
      if (!nadoClient) throw new Error("Connect a wallet first.");
      return nadoClient.spot.withdraw({
        subaccountName,
        productId,
        amount: addDecimals(new BigNumber(amount), 18),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subaccount-summary"] });
      queryClient.invalidateQueries({ queryKey: ["max-withdrawable"] });
    },
  });
}
