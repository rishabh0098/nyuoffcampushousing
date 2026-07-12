import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { parseListingFilters } from "@/lib/listing-filters";
import { getCachedActiveListings } from "@/lib/cached-listings";

export async function GET(request: Request) {
  await verifySession();
  const { searchParams } = new URL(request.url);
  const filters = parseListingFilters(searchParams);
  const listings = await getCachedActiveListings(filters);
  return NextResponse.json({ listings });
}
