import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { ListingInputSchema, OwnershipError, removeListing, updateListing } from "@/lib/listings";
import { invalidateListingsCaches } from "@/lib/cached-listings";
import { prisma } from "@/lib/db";

/** Detail/edit modal fetch — Active listings, or any listing owned by the caller. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession();
  const { id } = await params;

  const listing = await prisma.listing.findFirst({
    where: {
      id,
      OR: [{ status: "Active" }, { posterEmail: session.email }],
    },
    include: { photos: true },
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  return NextResponse.json({ listing });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
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
