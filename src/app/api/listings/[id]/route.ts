import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import {
  ListingInputSchema,
  OwnershipError,
  removeListing,
  updateListing,
} from "@/lib/listings";
import { invalidateListingsCaches } from "@/lib/cached-listings";
import { toOwnerListing, toPublicListing } from "@/lib/listing-dto";
import { forbidCrossOrigin } from "@/lib/same-origin";
import { withUserRls } from "@/lib/rls";

/** Detail/edit modal fetch — Active listings, or any listing owned by the caller. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession();
  const { id } = await params;

  const listing = await withUserRls(session.email, (tx) =>
    tx.listing.findFirst({
      where: {
        id,
        OR: [{ status: "Active" }, { posterEmail: session.email }],
      },
    })
  );

  if (!listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  // Owners keep posterEmail for ownership UX; everyone else gets a public DTO.
  const isOwner = listing.posterEmail === session.email;
  return NextResponse.json({
    listing: isOwner ? toOwnerListing(listing) : toPublicListing(listing),
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const forbidden = forbidCrossOrigin(request);
  if (forbidden) return forbidden;

  const session = await verifySession();
  const { id } = await params;
  const body = await request.json().catch(() => null);

  const parsed = ListingInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid listing data.", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const listing = await updateListing(id, session.email, parsed.data);
    invalidateListingsCaches();
    return NextResponse.json({ listing });
  } catch (error) {
    if (error instanceof OwnershipError) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }
    throw error;
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const forbidden = forbidCrossOrigin(request);
  if (forbidden) return forbidden;

  const session = await verifySession();
  const { id } = await params;

  try {
    await removeListing(id, session.email);
    invalidateListingsCaches();
  } catch (error) {
    if (error instanceof OwnershipError) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }
    throw error;
  }

  return NextResponse.json({ ok: true });
}
