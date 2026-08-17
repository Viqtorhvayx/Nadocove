import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { isAddress } from "viem";
import { db } from "@/lib/db/client";
import { follows } from "@/lib/db/schema";

/** Addresses following the given address. */
export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  if (!address || !isAddress(address)) {
    return NextResponse.json({ error: "Invalid address." }, { status: 400 });
  }

  const rows = await db()
    .select({ address: follows.followerAddress, since: follows.createdAt })
    .from(follows)
    .where(eq(follows.followeeAddress, address.toLowerCase()))
    .orderBy(desc(follows.createdAt))
    .limit(100);

  return NextResponse.json({ addresses: rows.map((r) => r.address) });
}
