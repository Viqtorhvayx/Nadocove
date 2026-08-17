import type { NextRequest } from "next/server";
import { signToken, verifyToken } from "@/lib/auth/token";

export const SESSION_COOKIE = "nadocove_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
export const NONCE_TTL_SECONDS = 60 * 5; // 5 minutes — just long enough to sign in

export function createSessionToken(address: string): string {
  return signToken({ address: address.toLowerCase() }, SESSION_TTL_SECONDS);
}

export function readSessionAddress(token: string | undefined): string | undefined {
  return verifyToken<{ address: string }>(token)?.address;
}

export const SESSION_MAX_AGE = SESSION_TTL_SECONDS;

/** Convenience for API routes that require a signed-in session. */
export function getSessionAddress(request: NextRequest): string | undefined {
  return readSessionAddress(request.cookies.get(SESSION_COOKIE)?.value);
}
