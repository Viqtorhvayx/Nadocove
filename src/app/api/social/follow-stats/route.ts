import { NextRequest, NextResponse } from "next/server";
import { count, eq } from "drizzle-orm";
import { isAddress } from "viem";
import { db } from "@/lib/db/client";
import { follows } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  if (!address || !isAddress(address)) {
    return NextResponse.json({ error: "Invalid address." }, { status: 400 });
  }
  const lower = address.toLowerCase();

  const [[followers], [following]] = await Promise.all([
    db().select({ count: count() }).from(follows).where(eq(follows.followeeAddress, lower)),
    db().select({ count: count() }).from(follows).where(eq(follows.followerAddress, lower)),
  ]);

  return NextResponse.json({ followers: followers.count, following: following.count });
}
