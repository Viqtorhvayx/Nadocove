import { NextRequest, NextResponse } from "next/server";
import { and, eq, gt } from "drizzle-orm";
import { parseSiweMessage, verifySiweMessage } from "viem/siwe";
import { siwePublicClient } from "@/lib/auth/siwe-public-client";
import { db } from "@/lib/db/client";
import { siweNonces } from "@/lib/db/schema";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  let message: string;
  let signature: `0x${string}`;
  try {
    const body = await request.json();
    message = body.message;
    signature = body.signature;
    if (typeof message !== "string" || typeof signature !== "string") {
      throw new Error("invalid body");
    }
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const parsed = parseSiweMessage(message);
  if (!parsed.address || !parsed.nonce) {
    return NextResponse.json({ error: "Malformed SIWE message." }, { status: 400 });
  }

  // Atomically consume the nonce — a single DELETE...RETURNING means two
  // concurrent requests replaying the same nonce can't both succeed; only
  // the first to reach this query gets a row back.
  const consumed = await db()
    .delete(siweNonces)
    .where(and(eq(siweNonces.nonce, parsed.nonce), gt(siweNonces.expiresAt, new Date())))
    .returning({ nonce: siweNonces.nonce });

  if (consumed.length === 0) {
    return NextResponse.json(
      { error: "Sign-in expired or already used — request a new nonce and try again." },
      { status: 401 },
    );
  }

  const isValid = await verifySiweMessage(siwePublicClient, {
    message,
    signature,
    nonce: parsed.nonce,
    domain: request.nextUrl.host,
  });

  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const res = NextResponse.json({ address: parsed.address });
  res.cookies.set(SESSION_COOKIE, createSessionToken(parsed.address), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
