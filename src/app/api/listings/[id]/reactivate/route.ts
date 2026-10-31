import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { OwnershipError, reactivateListing } from "@/lib/listings";
import { invalidateListingsCaches } from "@/lib/cached-listings";
import { forbidCrossOrigin } from "@/lib/same-origin";

/** R20 — owner-only. A missing or unowned id is a 404 (see OwnershipError). */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const forbidden = forbidCrossOrigin(request);
  if (forbidden) return forbidden;

  const session = await verifySession();
  const { id } = await params;

  try {
    await reactivateListing(id, session.email);
    invalidateListingsCaches();
  } catch (error) {
    // Missing, unowned, and still-Active rows all surface as the same 404.
    if (error instanceof OwnershipError) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }
    throw error;
  }

  return NextResponse.json({ ok: true });
}
