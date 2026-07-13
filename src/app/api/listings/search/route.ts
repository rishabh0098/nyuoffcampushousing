import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { ListingFiltersValidationError, parseListingFilters } from "@/lib/listing-filters";
import { getCachedActiveListings } from "@/lib/cached-listings";
import { toPublicListings } from "@/lib/listing-dto";

export async function GET(request: Request) {
  await verifySession();
  const { searchParams } = new URL(request.url);

  let filters;
  try {
    filters = parseListingFilters(searchParams);
  } catch (error) {
    if (error instanceof ListingFiltersValidationError) {
      return NextResponse.json(
        { error: "Invalid filters.", issues: error.issues },
        { status: 400 }
      );
    }
    throw error;
  }

  const listings = await getCachedActiveListings(filters);
  return NextResponse.json({ listings: toPublicListings(listings) });
}
