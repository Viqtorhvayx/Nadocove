import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { isAddress } from "viem";
import { db } from "@/lib/db/client";
import { follows } from "@/lib/db/schema";
import { getSessionAddress } from "@/lib/auth/session";

/** Whether the signed-in viewer follows the given address. */
export async function GET(request: NextRequest) {
  const viewer = getSessionAddress(request);
  if (!viewer) return NextResponse.json({ isFollowing: false });

  const address = request.nextUrl.searchParams.get("address");
  if (!address || !isAddress(address)) {
    return NextResponse.json({ error: "Invalid address." }, { status: 400 });
  }

  const row = await db().query.follows.findFirst({
    where: and(
      eq(follows.followerAddress, viewer),
      eq(follows.followeeAddress, address.toLowerCase()),
    ),
  });

  return NextResponse.json({ isFollowing: Boolean(row) });
}
