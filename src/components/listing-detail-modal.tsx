"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Listing } from "@prisma/client";
import {
  AREA_LABELS,
  CAMPUS_LABELS,
  FURNISHED_STATUS_LABELS,
  GENDER_PREFERENCE_LABELS,
  LEASE_TYPE_LABELS,
} from "@/lib/constants";
import { ListingMediaEmbed } from "@/components/listing-media-embed";
import { ModalCloseButton } from "@/components/icons";

type DetailListing = Listing;

export function ListingDetailModal({
  listingId,
  onClose,
}: {
  listingId: string;
  onClose: () => void;
}) {
  const [listing, setListing] = useState<DetailListing | null | undefined>(undefined);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    setListing(undefined);
    fetch(`/api/listings/${listingId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("not found");
        return res.json() as Promise<{ listing: DetailListing }>;
      })
      .then((data) => {
        if (!cancelled) setListing(data.listing);
      })
      .catch(() => {
        if (!cancelled) setListing(null);
      });
    return () => {
      cancelled = true;
    };
  }, [listingId]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Listing details"
        className="tile flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-display text-lg text-ink">Listing details</h2>
          <ModalCloseButton onClick={onClose} />
        </div>

        <div className="overflow-auto p-4">
          {listing === undefined ? (
            <p className="text-sm text-ink-soft">Loading…</p>
          ) : listing === null ? (
            <p className="text-sm text-ink-soft">This listing is no longer available.</p>
          ) : (
            <DetailBody listing={listing} />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function DetailBody({ listing }: { listing: DetailListing }) {
  return (
    <article className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-ink">{listing.title}</h1>
        <p className="mt-1 text-xl font-semibold text-accent">
          ${(listing.rentCents / 100).toFixed(0)}
          <span className="text-sm font-normal text-ink-soft">/mo</span>
        </p>
      </div>

      <ListingMediaEmbed mediaLink={listing.mediaLink} />

      <dl className="tile grid grid-cols-2 gap-x-6 gap-y-3 p-5 text-sm sm:grid-cols-3">
        <DetailItem label="Area" value={AREA_LABELS[listing.area]} />
        <DetailItem label="Campus" value={CAMPUS_LABELS[listing.campus]} />
        <DetailItem label="Distance from campus" value={`${listing.distanceFromCampusMiles} mi`} />
        <DetailItem label="Bedrooms" value={listing.bedrooms} />
        <DetailItem label="Bathrooms" value={listing.bathrooms} />
        <DetailItem label="Furnished" value={FURNISHED_STATUS_LABELS[listing.furnishedStatus]} />
        <DetailItem label="Move-in date" value={new Date(listing.moveInDate).toDateString()} />
        <DetailItem
          label="Lease ends"
          value={listing.leaseEndDate ? new Date(listing.leaseEndDate).toDateString() : "Open-ended"}
        />
        <DetailItem label="Lease type" value={LEASE_TYPE_LABELS[listing.leaseType]} />
        <DetailItem label="Guarantor required" value={listing.guarantorReq ? "Yes" : "No"} />
        <DetailItem label="Utilities included" value={listing.utilitiesIncl ? "Yes" : "No"} />
        <DetailItem label="Wifi included" value={listing.wifiIncl ? "Yes" : "No"} />
        <DetailItem label="AC in room" value={listing.acIncl ? "Yes" : "No"} />
        <DetailItem label="Private bathroom" value={listing.privateBathroom ? "Yes" : "No"} />
        <DetailItem label="In-unit laundry" value={listing.laundryIncl ? "Yes" : "No"} />
        <DetailItem label="Vegetarian preferred" value={listing.vegPreferred ? "Yes" : "No"} />
        <DetailItem label="Gender preference" value={GENDER_PREFERENCE_LABELS[listing.genderPref]} />
      </dl>

      <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{listing.description}</p>

      <section className="tile border-accent/30 bg-accent-soft/40 p-5">
        <h2 className="font-display mb-2 text-lg text-ink">Contact the poster</h2>
        <ul className="flex flex-col gap-1 text-sm text-ink">
          {listing.contactWhatsapp && <li>WhatsApp: {listing.contactWhatsapp}</li>}
          {listing.contactEmail && <li>Email: {listing.contactEmail}</li>}
          {listing.contactPhone && <li>Phone: {listing.contactPhone}</li>}
        </ul>
      </section>
    </article>
  );
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-ink-soft">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}
