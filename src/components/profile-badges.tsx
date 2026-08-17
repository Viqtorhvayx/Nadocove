"use client";

import { useSocialAccount, useLeaderboardPlacements } from "@/lib/use-profile-badges";

const RANK_TYPE_SHORT: Record<string, string> = {
  roi: "ROI",
  volume: "Volume",
  pnl: "PnL",
  balance: "Balance",
  liquidation: "Liquidations",
};

/**
 * Badges computed live from real Nado data — a linked X/Twitter account
 * (Nado's own social-account feature) and any qualified leaderboard
 * placements. Deliberately not a fabricated "reputation score": every
 * badge traces to one API response, and nothing here is NadoCove-only or
 * locally invented.
 */
export function ProfileBadges({
  address,
  subaccountName,
}: {
  address: string;
  subaccountName: string;
}) {
  const social = useSocialAccount(address);
  const placements = useLeaderboardPlacements(address, subaccountName);
  const topPlacements = placements.slice(0, 3);

  if (!social.data && topPlacements.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {social.data && (
        <a
          href={`https://x.com/${social.data.username}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground-muted transition hover:text-foreground"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- 16px decorative avatar from Twitter's CDN, not worth an Image remote-pattern config */}
          <img
            src={social.data.profileImageUrl}
            alt=""
            width={16}
            height={16}
            className="h-4 w-4 rounded-full"
          />
          Verified · @{social.data.username}
        </a>
      )}
      {topPlacements.map((p) => {
        const percentile = p.rank / p.totalParticipants;
        return (
          <span
            key={`${p.contestId}-${p.rankType}`}
            title={p.contestTitle}
            className="rounded-full border border-cove-amber/40 bg-cove-amber/10 px-3 py-1 text-xs font-medium text-cove-amber"
          >
            {percentile <= 0.01 ? "🏆" : "⭐"} #{p.rank} {RANK_TYPE_SHORT[p.rankType] ?? p.rankType}
          </span>
        );
      })}
    </div>
  );
}
