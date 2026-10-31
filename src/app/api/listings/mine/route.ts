import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { getCachedMyListings } from "@/lib/cached-listings";

/** R9 — the caller's own Active and Inactive listings (owner-only route). */
export async function GET() {
  const session = await verifySession();
  const { active, inactive } = await getCachedMyListings(session.email);
  return NextResponse.json({ active, inactive });
}
