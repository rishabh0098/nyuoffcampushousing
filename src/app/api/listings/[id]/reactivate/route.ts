import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { OwnershipError, reactivateListing } from "@/lib/listings";
import { invalidateListingsCaches } from "@/lib/cached-listings";
import { forbidCrossOrigin } from "@/lib/same-origin";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const forbidden = forbidCrossOrigin(request);
  if (forbidden) return forbidden;

  const session = await verifySession();
  const { id } = await params;

  try {
    await reactivateListing(id, session.email);
    invalidateListingsCaches();
  } catch (error) {
    if (error instanceof OwnershipError) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }
    throw error;
  }

  return NextResponse.json({ ok: true });
}
