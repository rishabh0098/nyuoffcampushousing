import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { getCachedMyListings } from "@/lib/cached-listings";

export async function GET() {
  const session = await verifySession();
  const { active, inactive } = await getCachedMyListings(session.email);
  return NextResponse.json({ active, inactive });
}
