"use client";

import { useAccount } from "wagmi";
import { useIsSignedIn, useSignIn, useSignOut } from "@/lib/use-auth";
import { truncateAddress } from "@/lib/format";

/**
 * Sign-In With Ethereum (SIWE) — a signature, not a transaction, so it's
 * gas-free. This is a separate identity layer from just having a wallet
 * connected: it's what lets NadoCove's backend know which address is
 * making a request (claiming a username, following someone) without ever
 * touching a key.
 */
export function SignInButton({ className = "" }: { className?: string }) {
  const { isConnected } = useAccount();
  const isSignedIn = useIsSignedIn();
  const signIn = useSignIn();
  const signOut = useSignOut();

  if (!isConnected) return null;

  if (isSignedIn) {
    return (
      <button
        type="button"
        onClick={() => signOut.mutate()}
        disabled={signOut.isPending}
        className={`rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground-muted transition hover:text-foreground disabled:opacity-50 ${className}`}
      >
        {signOut.isPending ? "Signing out…" : "Sign out"}
      </button>
    );
  }

  return (
    <div className={`flex flex-col items-end gap-1 ${className}`}>
      <button
        type="button"
        onClick={() => signIn.mutate()}
        disabled={signIn.isPending}
        className="rounded-full bg-cove-indigo px-3 py-1.5 text-xs font-semibold text-background transition hover:bg-cove-indigo-dim disabled:opacity-50"
      >
        {signIn.isPending ? "Sign in…" : "Sign in with Ethereum"}
      </button>
      {signIn.isError && (
        <span className="text-xs text-negative">
          {signIn.error instanceof Error ? signIn.error.message : "Sign-in failed."}
        </span>
      )}
    </div>
  );
}

export function SessionAddress() {
  const isSignedIn = useIsSignedIn();
  const { address } = useAccount();
  if (!isSignedIn || !address) return null;
  return (
    <span className="text-xs text-foreground-muted">Signed in as {truncateAddress(address)}</span>
  );
}
