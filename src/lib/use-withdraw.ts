import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import BigNumber from "bignumber.js";
import { addDecimals } from "@nadohq/shared";
import { useNadoClient } from "@/lib/use-nado-client";
import { useActiveSubaccount } from "@/lib/subaccount-context";

/**
 * Engine-estimated max withdrawable amount for a product in the active
 * subaccount — already margin-aware (won't let a withdrawal break a
 * leveraged position's health), unlike just reading the raw balance.
 * Already in human-readable units, same convention as the rest of the
 * engine's responses (see the note in format.ts).
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
