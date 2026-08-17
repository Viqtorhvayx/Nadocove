import { NextRequest, NextResponse } from "next/server";
import { inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { usernames } from "@/lib/db/schema";

/** Batch lookup — avoids N+1 requests for list views (Discover, etc). */
export async function GET(request: NextRequest) {
  const addressesParam = request.nextUrl.searchParams.get("addresses");
  if (!addressesParam) return NextResponse.json({ usernames: {} });

  const addresses = [
    ...new Set(
      addressesParam
        .split(",")
        .map((a) => a.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
  if (addresses.length === 0) return NextResponse.json({ usernames: {} });

  const rows = await db().select().from(usernames).where(inArray(usernames.address, addresses));
  const map: Record<string, string> = {};
  for (const row of rows) map[row.address] = row.username;

  return NextResponse.json({ usernames: map });
}
