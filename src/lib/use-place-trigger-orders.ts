import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import BigNumber from "bignumber.js";
import { addDecimals, nowInSeconds, packOrderAppendix } from "@nadohq/shared";
import { useNadoClient } from "@/lib/use-nado-client";
import { useActiveSubaccount } from "@/lib/subaccount-context";

// Real "good until cancelled" isn't a thing here — orders need an
// expiration — so trigger orders get a long one (~180 days) rather than
// the ~60s used for a regular market/limit order.
const TRIGGER_ORDER_EXPIRY_SECONDS = 60 * 60 * 24 * 180;
const TRIGGER_SLIPPAGE_TOLERANCE = 0.02; // wider than the 1% market-order buffer since this fires later, once price has already crossed the trigger.

export type PlaceTriggerOrdersInput = {
  productId: number;
  /** The side of the CLOSING order this trigger fires — "sell" closes a
   * long, "buy" closes a short. */
  closeSide: "buy" | "sell";
  amount: string;
  takeProfitPrice?: string;
  stopLossPrice?: string;
};

/**
 * Places real take-profit / stop-loss orders via Nado's trigger service
 * (nadoClient.market.placeTriggerOrders) — genuine conditional orders that
 * sit with the trigger service and fire a reduce-only IOC close once the
 * oracle price crosses the trigger, not a UI-only reminder.
 */
export function usePlaceTriggerOrders() {
  const { address } = useAccount();
  const { subaccountName } = useActiveSubaccount();
  const nadoClient = useNadoClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, closeSide, amount, takeProfitPrice, stopLossPrice }: PlaceTriggerOrdersInput) => {
      if (!nadoClient || !address) {
        throw new Error("Connect a wallet first.");
      }
      if (!takeProfitPrice && !stopLossPrice) {
        throw new Error("Set a take-profit and/or stop-loss price first.");
      }

      const signedAmount = new BigNumber(amount).times(closeSide === "buy" ? 1 : -1);
      const appendix = packOrderAppendix({ orderExecutionType: "ioc", reduceOnly: true });
      const expiration = nowInSeconds() + TRIGGER_ORDER_EXPIRY_SECONDS;

      function buildOrder(triggerPrice: string, requirement: "oracle_price_above" | "oracle_price_below") {
        const buffered =
          closeSide === "sell"
            ? new BigNumber(triggerPrice).times(1 - TRIGGER_SLIPPAGE_TOLERANCE)
            : new BigNumber(triggerPrice).times(1 + TRIGGER_SLIPPAGE_TOLERANCE);
        return {
          productId,
          order: {
            subaccountName,
            expiration,
            appendix,
            price: buffered.toString(),
            amount: addDecimals(signedAmount, 18),
          },
          triggerCriteria: {
            type: "price" as const,
            criteria: { type: requirement, triggerPrice },
          },
        };
      }

      const orders = [
        takeProfitPrice
          ? buildOrder(takeProfitPrice, closeSide === "sell" ? "oracle_price_above" : "oracle_price_below")
          : undefined,
        stopLossPrice
          ? buildOrder(stopLossPrice, closeSide === "sell" ? "oracle_price_below" : "oracle_price_above")
          : undefined,
      ].filter((o): o is NonNullable<typeof o> => o !== undefined);

      return nadoClient.market.placeTriggerOrders({ orders });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trigger-orders"] });
    },
  });
}
