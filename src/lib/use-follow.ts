"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAddress } from "viem";

function normalize(address: string | undefined): string | undefined {
  return address && isAddress(address) ? address.toLowerCase() : undefined;
}

export function useFollowStats(address: string | undefined) {
  const valid = normalize(address);
  return useQuery({
    queryKey: ["follow-stats", valid],
    queryFn: async (): Promise<{ followers: number; following: number }> => {
      const res = await fetch(`/api/social/follow-stats?address=${valid}`);
      return res.json();
    },
    enabled: Boolean(valid),
    staleTime: 30_000,
  });
}

export function useIsFollowing(address: string | undefined) {
  const valid = normalize(address);
  return useQuery({
    queryKey: ["follow-status", valid],
    queryFn: async (): Promise<boolean> => {
      const res = await fetch(`/api/social/follow-status?address=${valid}`);
      const data = await res.json();
      return Boolean(data.isFollowing);
    },
    enabled: Boolean(valid),
    staleTime: 15_000,
  });
}

export function useFollowingList(address: string | undefined) {
  const valid = normalize(address);
  return useQuery({
    queryKey: ["following-list", valid],
    queryFn: async (): Promise<string[]> => {
      const res = await fetch(`/api/social/following?address=${valid}`);
      const data = await res.json();
      return data.addresses ?? [];
    },
    enabled: Boolean(valid),
    staleTime: 15_000,
  });
}

export function useFollowersList(address: string | undefined) {
  const valid = normalize(address);
  return useQuery({
    queryKey: ["followers-list", valid],
    queryFn: async (): Promise<string[]> => {
      const res = await fetch(`/api/social/followers?address=${valid}`);
      const data = await res.json();
      return data.addresses ?? [];
    },
    enabled: Boolean(valid),
    staleTime: 15_000,
  });
}

function useFollowMutation(method: "POST" | "DELETE") {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (followee: string) => {
      const res = await fetch("/api/social/follow", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followee }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Request failed.");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-status"] });
      queryClient.invalidateQueries({ queryKey: ["follow-stats"] });
      queryClient.invalidateQueries({ queryKey: ["following-list"] });
      queryClient.invalidateQueries({ queryKey: ["followers-list"] });
    },
  });
}

export function useFollow() {
  return useFollowMutation("POST");
}

export function useUnfollow() {
  return useFollowMutation("DELETE");
}
