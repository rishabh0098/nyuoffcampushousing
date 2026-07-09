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
    include: { photos: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex flex-col gap-1">
        <span className="eyebrow">Browse</span>
        <h1 className="font-display text-2xl text-ink">Available listings</h1>
      </div>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="lg:sticky lg:top-6">
          <ListingFilterForm />
        </div>
        <div className="flex-1">
          {/* auto-fill (not auto-fit) keeps unused column tracks reserved,
              so a lone remaining card doesn't stretch to fill the row. */}
          {listings.length === 0 ? (
            <p className="tile p-8 text-center text-ink-soft">No matching listings found</p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  href={`/listings/${listing.id}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
