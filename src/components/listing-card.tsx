import Link from "next/link";
import type { Listing } from "@prisma/client";
import { CAMPUS_LABELS } from "@/lib/constants";

export function ListingCard({
  listing,
  href,
  actions,
}: {
  listing: Pick<Listing, "id" | "title" | "rentCents" | "campus" | "bedrooms" | "vegPreferred">;
  href?: string;
  actions?: React.ReactNode;
}) {
  const body = (
    <div className="rounded border border-gray-200 p-4 hover:border-gray-400">
      <h3 className="font-medium">{listing.title}</h3>
      <p className="text-sm text-gray-600">
        ${(listing.rentCents / 100).toFixed(0)}/mo · {listing.bedrooms} BR ·{" "}
        {CAMPUS_LABELS[listing.campus]}
        {listing.vegPreferred ? " · Vegetarian preferred" : ""}
      </p>
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      {href ? <Link href={href}>{body}</Link> : body}
      {actions && <div className="flex gap-3 px-1">{actions}</div>}
    </div>
  );
}
