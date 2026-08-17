"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAddress } from "viem";

export function useUsername(address: string | undefined) {
  const validAddress = address && isAddress(address) ? address.toLowerCase() : undefined;

  return useQuery({
    queryKey: ["username", validAddress],
    queryFn: async (): Promise<string | null> => {
      const res = await fetch(`/api/social/username?address=${validAddress}`);
      const data = await res.json();
      return data.username ?? null;
    },
    enabled: Boolean(validAddress),
    staleTime: 60_000,
  });
}

/** Batch lookup for list views — one request instead of one per row. */
export function useUsernames(addresses: string[]) {
  const key = [...new Set(addresses.map((a) => a.toLowerCase()))].sort();

  return useQuery({
    queryKey: ["usernames", key],
    queryFn: async (): Promise<Record<string, string>> => {
      const res = await fetch(`/api/social/usernames?addresses=${key.join(",")}`);
      const data = await res.json();
      return data.usernames ?? {};
    },
    enabled: key.length > 0,
    staleTime: 60_000,
  });
}

export function useClaimUsername() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (username: string): Promise<string> => {
      const res = await fetch("/api/social/username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to claim username.");
      return data.username;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["username"] });
      queryClient.invalidateQueries({ queryKey: ["usernames"] });
    },
  });
}
