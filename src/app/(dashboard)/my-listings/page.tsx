import Link from "next/link";
import { verifySession } from "@/lib/session";
import { getMyListings } from "@/lib/listings";
import { ListingCard } from "@/components/listing-card";
import { RemoveListingButton, ReactivateListingButton } from "@/components/listing-actions";

// R9 — My Listings: Active/Inactive split, plus a "zero listings" empty state.
export default async function MyListingsPage() {
  const session = await verifySession();
  const { active, inactive } = await getMyListings(session.email);
  const isEmpty = active.length === 0 && inactive.length === 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">My listings</h1>
        <Link href="/my-listings/new" className="rounded bg-black px-3 py-2 text-sm text-white">
          Add listing
        </Link>
      </div>

      {isEmpty && <p className="text-gray-500">You have zero listings.</p>}

      {active.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-500">Active</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                href={`/listings/${listing.id}`}
                actions={<RemoveListingButton listingId={listing.id} />}
              />
            ))}
          </div>
        </section>
      )}

      {inactive.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-500">Inactive</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {inactive.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                actions={<ReactivateListingButton listingId={listing.id} />}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
