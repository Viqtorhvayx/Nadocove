"use client";

import { WalletCta } from "@/components/wallet-cta";

const FAB_CLASS =
  "btn-tactile-primary fixed bottom-8 right-6 z-40 hidden rounded-full px-5 py-3 text-sm font-semibold text-background sm:right-8 lg:inline-flex";

/**
 * The landing page's persistent action on wide screens — anchored to the
 * side instead of living in the header, so it stays reachable while
 * scrolling without pinning app-internal nav (Discover, Dashboard) in
 * front of first-time visitors who haven't connected anything yet. Hidden
 * below lg: the hero's own CTA sits right at the top of a narrower page,
 * so a fixed duplicate only risks overlapping the hero mockup card that
 * follows it.
 */
export function HomeConnectFab() {
  return <WalletCta className={FAB_CLASS} />;
}
