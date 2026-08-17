import { NextRequest, NextResponse } from "next/server";
import { readSessionAddress, SESSION_COOKIE } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const address = readSessionAddress(request.cookies.get(SESSION_COOKIE)?.value);
  return NextResponse.json({ address: address ?? null });
}
