"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount, useSignMessage } from "wagmi";
import { createSiweMessage } from "viem/siwe";

async function fetchSession(): Promise<string | null> {
  const res = await fetch("/api/auth/session");
  if (!res.ok) return null;
  const data = await res.json();
  return data.address;
}

export function useSession() {
  return useQuery({
    queryKey: ["auth-session"],
    queryFn: fetchSession,
    staleTime: 60_000,
  });
}

/**
 * True only when the signed-in session matches the currently connected
 * wallet. Switching accounts in the wallet without re-signing counts as
 * signed out — a session for a different address no longer speaks for the
 * one that's connected now.
 */
export function useIsSignedIn(): boolean {
  const { address } = useAccount();
  const session = useSession();
  return Boolean(
    session.data && address && session.data.toLowerCase() === address.toLowerCase(),
  );
}

export function useSignIn() {
  const { address, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!address || !chainId) throw new Error("Connect a wallet first.");

      const nonceRes = await fetch("/api/auth/nonce");
      const { nonce } = await nonceRes.json();

      const message = createSiweMessage({
        address,
        chainId,
        domain: window.location.host,
        nonce,
        uri: window.location.origin,
        version: "1",
        statement: "Sign in to NadoCove.",
      });

      const signature = await signMessageAsync({ message });

      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, signature }),
      });
      if (!verifyRes.ok) {
        const body = await verifyRes.json().catch(() => ({}));
        throw new Error(body.error ?? "Sign-in failed.");
      }
      return verifyRes.json() as Promise<{ address: string }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-session"] });
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/logout", { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-session"] });
    },
  });
}
