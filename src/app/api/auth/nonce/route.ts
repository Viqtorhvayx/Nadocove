import { NextResponse } from "next/server";
import { generateSiweNonce } from "viem/siwe";
import { lt } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { siweNonces } from "@/lib/db/schema";
import { NONCE_TTL_SECONDS } from "@/lib/auth/session";

export async function GET() {
  const nonce = generateSiweNonce();
  const expiresAt = new Date(Date.now() + NONCE_TTL_SECONDS * 1000);

  // Opportunistic cleanup of expired, never-consumed nonces — no cron job
  // needed for this volume; every nonce issuance sweeps a few more.
  await db().delete(siweNonces).where(lt(siweNonces.expiresAt, new Date()));
  await db().insert(siweNonces).values({ nonce, expiresAt });

  return NextResponse.json({ nonce });
}
