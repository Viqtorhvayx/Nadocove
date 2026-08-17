"use client";

import { useUsername } from "@/lib/use-username";
import { truncateAddress } from "@/lib/format";

/** Shows a claimed NadoCove username if one exists, else the truncated address. */
export function Identity({ address, className }: { address: string; className?: string }) {
  const username = useUsername(address);
  return <span className={className}>{username.data ? `@${username.data}` : truncateAddress(address)}</span>;
}
