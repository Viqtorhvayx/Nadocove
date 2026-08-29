import { useMemo } from "react";
import BigNumber from "bignumber.js";
import { removeDecimals } from "@nadohq/shared";
import { useMatchHistory } from "@/lib/use-match-history";

const FILLS_SAMPLED = 200;

export type PnlStats = {
  sampledFills: number;
  closedTrades: number;
  wins: number;
  losses: number;
  winRate: BigNumber | undefined;
  totalRealizedPnl: BigNumber;
  totalFees: BigNumber;
  avgWin: BigNumber | undefined;
  avgLoss: BigNumber | undefined;
  bestTrade: BigNumber | undefined;
  worstTrade: BigNumber | undefined;
};

/**
 * Win rate / avg win-loss / best-worst trade, computed from real fills —
 * Nado's indexer already tracks realizedPnl and closedAmount per match
 * event, so this is exact per-fill PnL, not a reconstruction. Sampled over
 * the most recent FILLS_SAMPLED fills rather than a full paginated
 * lifetime history, so it's presented as "recent" stats, not an all-time
 * total.
 */
export function usePnlStats(owner: string | undefined, subaccountName: string) {
  const history = useMatchHistory(owner, subaccountName, FILLS_SAMPLED);

  const stats = useMemo((): PnlStats | undefined => {
    if (!history.data) return undefined;

    const closingFills = history.data.filter((f) => f.closedAmount.gt(0));
    const realizedPnls = closingFills.map((f) => removeDecimals(f.realizedPnl, 18));
    const wins = realizedPnls.filter((pnl) => pnl.gt(0));
    const losses = realizedPnls.filter((pnl) => pnl.lt(0));

    const totalRealizedPnl = realizedPnls.reduce((sum, pnl) => sum.plus(pnl), new BigNumber(0));
    const totalFees = history.data.reduce((sum, f) => sum.plus(removeDecimals(f.totalFee, 18)), new BigNumber(0));

    return {
      sampledFills: history.data.length,
      closedTrades: closingFills.length,
      wins: wins.length,
      losses: losses.length,
      winRate: wins.length + losses.length > 0 ? new BigNumber(wins.length).div(wins.length + losses.length) : undefined,
      totalRealizedPnl,
      totalFees,
      avgWin: wins.length > 0 ? wins.reduce((sum, pnl) => sum.plus(pnl), new BigNumber(0)).div(wins.length) : undefined,
      avgLoss: losses.length > 0 ? losses.reduce((sum, pnl) => sum.plus(pnl), new BigNumber(0)).div(losses.length) : undefined,
      bestTrade: realizedPnls.length > 0 ? BigNumber.max(...realizedPnls) : undefined,
      worstTrade: realizedPnls.length > 0 ? BigNumber.min(...realizedPnls) : undefined,
    };
  }, [history.data]);

  return { ...history, data: stats };
}
