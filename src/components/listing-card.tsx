import Image from "next/image";
import Link from "next/link";
import type { Listing, ListingPhoto } from "@prisma/client";
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
  > & { photos: Pick<ListingPhoto, "id" | "url">[] };
  href?: string;
  actions?: React.ReactNode;
}) {
  const body = (
    // h-full so every card in a grid row fills the row's height equally
    // (the row height itself is set by the tallest card's content) rather
    // than staying its own shorter content height and leaving the grid
    // cell's leftover space invisible below it.
    <div className="tile tile-interactive flex h-full flex-col gap-3 p-4">
      {listing.photos.length > 0 && (
        <div
          className={
            listing.photos.length === 1
              ? "aspect-[4/3] overflow-hidden rounded-lg"
              : "grid grid-cols-2 gap-1 [&>*:first-child]:col-span-2"
          }
        >
          {listing.photos.slice(0, 3).map((photo) => (
            <Image
              key={photo.id}
              src={photo.url}
              alt=""
              width={320}
              height={240}
              className="aspect-[4/3] h-full w-full rounded-lg border border-border object-cover"
            />
          ))}
        </div>
      )}
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
    <div className="flex h-full flex-col gap-2">
      {href ? (
        <Link href={href} className="flex-1">
          {body}
        </Link>
      ) : (
        <div className="flex-1">{body}</div>
      )}
      {actions && <div className="flex gap-3 px-1">{actions}</div>}
    </div>
  );
}
