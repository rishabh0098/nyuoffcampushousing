import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/session";
import { buildListingWhereClause, parseListingFilters } from "@/lib/listing-filters";

export async function GET(request: Request) {
  await verifySession();
  const { searchParams } = new URL(request.url);
  const filters = parseListingFilters(searchParams);
  const where = buildListingWhereClause(filters);

  const listings = await prisma.listing.findMany({
    where,
    include: { photos: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ listings });
}
