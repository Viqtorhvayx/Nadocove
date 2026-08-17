import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { isAddress } from "viem";
import { db } from "@/lib/db/client";
import { usernames } from "@/lib/db/schema";
import { getSessionAddress } from "@/lib/auth/session";
import { validateUsername } from "@/lib/username-rules";

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  const username = request.nextUrl.searchParams.get("username");

  if (address) {
    if (!isAddress(address)) {
      return NextResponse.json({ error: "Invalid address." }, { status: 400 });
    }
    const row = await db().query.usernames.findFirst({
      where: eq(usernames.address, address.toLowerCase()),
    });
    return NextResponse.json({ username: row?.username ?? null });
  }

  if (username) {
    const row = await db().query.usernames.findFirst({
      where: eq(usernames.username, username.toLowerCase()),
    });
    return NextResponse.json({ address: row?.address ?? null });
  }

  return NextResponse.json({ error: "Provide address or username." }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const sessionAddress = getSessionAddress(request);
  if (!sessionAddress) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";

  const validation = validateUsername(username);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    await db()
      .insert(usernames)
      .values({ address: sessionAddress, username })
      .onConflictDoUpdate({ target: usernames.address, set: { username } });
  } catch {
    // Unique-constraint violation on `username` — a different address
    // already claimed it. onConflictDoUpdate only covers a conflict on
    // `address` (re-claiming your own row); this one just throws.
    return NextResponse.json({ error: "That username is already taken." }, { status: 409 });
  }

  return NextResponse.json({ username });
}

export async function DELETE(request: NextRequest) {
  const sessionAddress = getSessionAddress(request);
  if (!sessionAddress) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }
  await db().delete(usernames).where(eq(usernames.address, sessionAddress));
  return NextResponse.json({ ok: true });
}
