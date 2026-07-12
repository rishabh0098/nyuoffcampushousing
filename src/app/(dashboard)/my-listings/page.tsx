import Link from "next/link";
import { verifySession } from "@/lib/session";
import { getMyListings } from "@/lib/listings";
import { ListingCard } from "@/components/listing-card";
import {
  EditListingButton,
  ReactivateListingButton,
  RemoveListingButton,
} from "@/components/listing-actions";

// R9 — My Listings: Active/Inactive split, plus a "zero listings" empty state.
export default async function MyListingsPage() {
  const session = await verifySession();
  const { active, inactive } = await getMyListings(session.email);
  const isEmpty = active.length === 0 && inactive.length === 0;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="eyebrow">Manage</span>
          <h1 className="font-display text-2xl text-ink">My listings</h1>
        </div>
        <Link href="/my-listings/new" className="btn btn-primary">
          Add listing
        </Link>
      </div>

      {isEmpty && <p className="tile p-8 text-center text-ink-soft">You have zero listings.</p>}

      {active.length > 0 && (
        <section>
          <h2 className="eyebrow mb-1">Active</h2>
          <p className="mb-3 text-sm text-ink-soft">
            Active listings automatically move to Inactive after 15 days and can be reactivated
            again.
          </p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
            {active.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                href={`/listings/${listing.id}`}
                actions={
                  <>
                    <EditListingButton listingId={listing.id} />
                    <RemoveListingButton listingId={listing.id} />
                  </>
                }
              />
            ))}
          </div>
        </section>
      )}

      {inactive.length > 0 && (
        <section>
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
            Inactive
          </h2>
          <p className="mb-3 text-sm text-ink-soft">
            Inactive listings are private to you and are permanently deleted after 2 months
            unless reactivated.
          </p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
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
