import { useQuery } from "@tanstack/react-query";
import { readOnlyNadoClient } from "@/lib/nado-read-client";
import { DEFAULT_SUBACCOUNT_NAME } from "@/lib/subaccount-constants";

/** Cap on how many followed traders' fills we merge into one feed request. */
const MAX_FOLLOWED_ADDRESSES = 25;

/**
 * Merged, most-recent-first fill feed across everyone a signed-in user
 * follows — a real activity feed instead of "Following" being just a
 * static list of addresses. One indexer call: getMatchEvents accepts an
 * array of subaccounts, so this isn't N+1 requests. Only looks at each
 * trader's default subaccount, same convention public profile pages use
 * when no subaccount selector has been touched.
 */
export function useFollowingActivity(followingAddresses: string[] | undefined) {
  const addresses = (followingAddresses ?? []).slice(0, MAX_FOLLOWED_ADDRESSES);

  return useQuery({
    queryKey: ["following-activity", addresses],
    queryFn: () =>
      readOnlyNadoClient.context.indexerClient.getMatchEvents({
        subaccounts: addresses.map((subaccountOwner) => ({
          subaccountOwner,
          subaccountName: DEFAULT_SUBACCOUNT_NAME,
        })),
        limit: 30,
      }),
    enabled: addresses.length > 0,
    refetchInterval: 30_000,
  });
}
