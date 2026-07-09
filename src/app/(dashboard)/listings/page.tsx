import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/session";
import { buildListingWhereClause, parseListingFilters } from "@/lib/listing-filters";
import { ListingCard } from "@/components/listing-card";
import { ListingFilterForm } from "@/components/listing-filter-form";

// R5–R8, R24 — Available listings: filterable grid of Active listings only,
// with an explicit empty-state message for zero-match filter combinations.
export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await verifySession();
  const params = await searchParams;
  const urlSearchParams = new URLSearchParams(
    Object.entries(params).flatMap(([key, value]) =>
      value === undefined ? [] : [[key, Array.isArray(value) ? value[0] : value]]
    )
  );
  const filters = parseListingFilters(urlSearchParams);
  const where = buildListingWhereClause(filters);

  const listings = await prisma.listing.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold">Available listings</h1>
      <ListingFilterForm />
      {listings.length === 0 ? (
        <p className="text-gray-500">No matching listings found</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} href={`/listings/${listing.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
