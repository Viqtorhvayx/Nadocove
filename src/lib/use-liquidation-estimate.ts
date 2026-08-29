import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import BigNumber from "bignumber.js";
import { addDecimals, ProductEngineType, type PerpBalanceWithProduct } from "@nadohq/shared";
import type { EngineSymbol, SubaccountTx } from "@nadohq/engine-client";
import { useNadoClient } from "@/lib/use-nado-client";
import { useActiveSubaccount } from "@/lib/subaccount-context";

/**
 * Estimated liquidation price for the position this order would leave you
 * with, computed from a real engine simulation rather than a hand-rolled
 * margin model:
 *
 * 1. Ask the engine what your maintenance health (assets - liabilities)
 *    would be right after this trade, at CURRENT oracle prices
 *    (getEngineEstimatedSubaccountSummary — a real simulation covering
 *    every existing balance/position correctly, not something guessed here).
 * 2. Health is linear in this one market's oracle price while every other
 *    price stays put: health(P) = H0 + weight * amount * (P - P0). Solving
 *    health(P) = 0 for P gives the liquidation price.
 *
 * This assumes other positions' prices don't move — the standard
 * simplification most simple perp UIs make for an order-preview estimate,
 * called out as "Est." in the label. It is not what happens if several of
 * your positions move against you at once.
 */
export function useLiquidationEstimate({
  symbol,
  side,
  amount,
  oraclePrice,
}: {
  symbol: EngineSymbol | undefined;
  side: "buy" | "sell";
  amount: string;
  oraclePrice: BigNumber | undefined;
}) {
  const { address } = useAccount();
  const { subaccountName } = useActiveSubaccount();
  const nadoClient = useNadoClient();

  const productId = symbol?.productId;
  const amountNum = Number(amount);
  const enabled = Boolean(nadoClient && address && productId !== undefined && oraclePrice && amountNum > 0);

  const query = useQuery({
    queryKey: ["liquidation-estimate", address, subaccountName, productId, side, amount, oraclePrice?.toString()],
    // react-query rejects `undefined` as query data — use null for "not
    // computable" (no resulting position, or a zero-weight edge case).
    queryFn: async (): Promise<BigNumber | null> => {
      if (!nadoClient || !address || productId === undefined || !oraclePrice || !symbol) return null;

      const signedAmount = new BigNumber(amount).times(side === "buy" ? 1 : -1);
      const vQuoteDelta = signedAmount.times(oraclePrice).negated();
      const tx: SubaccountTx = {
        type: "apply_delta",
        tx: {
          productId,
          amountDelta: addDecimals(signedAmount, 18),
          vQuoteDelta: addDecimals(vQuoteDelta, 18),
        },
      };

      const estimate = await nadoClient.subaccount.getEngineEstimatedSubaccountSummary({
        subaccountOwner: address,
        subaccountName,
        txs: [tx],
        preState: false,
      });

      const postBalance = estimate.balances.find(
        (b): b is PerpBalanceWithProduct => b.type === ProductEngineType.PERP && b.productId === productId,
      );
      if (!postBalance || postBalance.amount.isZero()) return null;

      const A = postBalance.amount;
      const weight = A.gte(0) ? symbol.longWeightMaintenance : new BigNumber(2).minus(symbol.longWeightMaintenance);
      const denominator = weight.times(A);
      if (denominator.isZero()) return null;

      const H0 = estimate.health.maintenance.health;
      return oraclePrice.minus(H0.div(denominator));
    },
    enabled,
    staleTime: 5_000,
  });

  return { ...query, data: query.data ?? undefined };
}
