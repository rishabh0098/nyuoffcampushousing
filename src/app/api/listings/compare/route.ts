import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/session";
import { MAX_COMPARE_LISTINGS } from "@/lib/constants";

/**
 * Backs the side-by-side comparison modal. Takes up to MAX_COMPARE_LISTINGS
 * ids and returns whichever of them are still Active — any id that's since
 * expired/been removed is simply omitted (no error), since the client-side
 * selection is just a set of ids with no server-side notion of validity.
 */
export async function GET(request: Request) {
  await verifySession();
  const { searchParams } = new URL(request.url);
  const ids = (searchParams.get("ids") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, MAX_COMPARE_LISTINGS);

  if (ids.length === 0) {
    return NextResponse.json({ listings: [] });
  }

  const listings = await prisma.listing.findMany({
    where: { id: { in: ids }, status: "Active" },
    include: { photos: true },
  });

  // Preserve the caller's selection order rather than whatever order the DB
  // returns, so the modal's column order matches the order listings were
  // added to the tray.
  const byId = new Map(listings.map((listing) => [listing.id, listing]));
  const ordered = ids.map((id) => byId.get(id)).filter((listing) => listing !== undefined);

  return NextResponse.json({ listings: ordered });
}
