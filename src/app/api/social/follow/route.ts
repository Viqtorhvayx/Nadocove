import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { isAddress } from "viem";
import { db } from "@/lib/db/client";
import { follows } from "@/lib/db/schema";
import { getSessionAddress } from "@/lib/auth/session";

function parseFollowee(body: unknown): string | undefined {
  const followee = (body as { followee?: unknown })?.followee;
  return typeof followee === "string" && isAddress(followee) ? followee.toLowerCase() : undefined;
}

export async function POST(request: NextRequest) {
  const follower = getSessionAddress(request);
  if (!follower) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const followee = parseFollowee(await request.json().catch(() => ({})));
  if (!followee) return NextResponse.json({ error: "Invalid address." }, { status: 400 });
  if (followee === follower) {
    return NextResponse.json({ error: "You can't follow yourself." }, { status: 400 });
  }

  await db()
    .insert(follows)
    .values({ followerAddress: follower, followeeAddress: followee })
    .onConflictDoNothing();

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const follower = getSessionAddress(request);
  if (!follower) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const followee = parseFollowee(await request.json().catch(() => ({})));
  if (!followee) return NextResponse.json({ error: "Invalid address." }, { status: 400 });

  await db()
    .delete(follows)
    .where(and(eq(follows.followerAddress, follower), eq(follows.followeeAddress, followee)));

  return NextResponse.json({ ok: true });
}
