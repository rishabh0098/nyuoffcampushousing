import Link from "next/link";
import type { Listing } from "@prisma/client";
import { CAMPUS_LABELS, FURNISHED_STATUS_LABELS } from "@/lib/constants";

export function ListingCard({
  listing,
  href,
  actions,
}: {
  listing: Pick<
    Listing,
    | "id"
    | "title"
    | "rentCents"
    | "campus"
    | "distanceFromCampusMiles"
    | "bedrooms"
    | "bathrooms"
    | "furnishedStatus"
    | "vegPreferred"
  >;
  href?: string;
  actions?: React.ReactNode;
}) {
  const body = (
    <div className="tile tile-interactive flex h-full flex-col gap-2 p-4">
      <h3 className="font-display text-lg text-ink">{listing.title}</h3>
      <p className="text-lg font-semibold text-accent">
        ${(listing.rentCents / 100).toFixed(0)}
        <span className="text-sm font-normal text-ink-soft">/mo</span>
      </p>
      <p className="mt-auto flex flex-wrap items-center gap-x-1.5 text-sm text-ink-soft">
        <span>{listing.bedrooms} BR</span>
        <span aria-hidden>·</span>
        <span>{listing.bathrooms} BA</span>
        <span aria-hidden>·</span>
        <span>{FURNISHED_STATUS_LABELS[listing.furnishedStatus]}</span>
        <span aria-hidden>·</span>
        <span>
          {listing.distanceFromCampusMiles} mi from {CAMPUS_LABELS[listing.campus]}
        </span>
        {listing.vegPreferred && (
          <>
            <span aria-hidden>·</span>
            <span>Vegetarian preferred</span>
          </>
        )}
      </p>
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      {href ? (
        <Link href={href} className="block">
          {body}
        </Link>
      ) : (
        body
      )}
      {actions && <div className="flex gap-3 px-1">{actions}</div>}
    </div>
  );
}
