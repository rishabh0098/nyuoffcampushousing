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
import { useCompare } from "@/lib/compare-context";
import { useDashboardNav } from "@/lib/dashboard-nav-context";
import { ListingMediaEmbed } from "@/components/listing-media-embed";
import { IconX, ModalCloseButton } from "@/components/icons";

type ComparableListing = Listing;

export function CompareModal({ onClose }: { onClose: () => void }) {
  const { openListing } = useDashboardNav();
  const { selectedIds, remove } = useCompare();
  const [listings, setListings] = useState<ComparableListing[] | null>(null);

  function openListingFromCompare(id: string) {
    openListing(id);
    onClose();
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (selectedIds.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setListings([]);
      return;
    }
    let cancelled = false;
    fetch(`/api/listings/compare?ids=${encodeURIComponent(selectedIds.join(","))}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`compare fetch failed: ${res.status}`);
        return res.json() as Promise<{ listings: ComparableListing[] }>;
      })
      .then((data) => {
        if (!cancelled) setListings(Array.isArray(data.listings) ? data.listings : []);
      })
      .catch(() => {
        if (!cancelled) setListings([]);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedIds]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="tile flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-display text-lg text-ink">Compare listings</h2>
          <ModalCloseButton onClick={onClose} />
        </div>

        <div className="overflow-auto p-4">
          {listings === null ? (
            <p className="p-4 text-sm text-ink-soft">Loading…</p>
          ) : listings.length === 0 ? (
            <p className="p-4 text-sm text-ink-soft">
              Nothing left to compare — the selected listings are no longer available.
            </p>
          ) : (
            <CompareTable listings={listings} onRemove={remove} onOpen={openListingFromCompare} />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function CompareTable({
  listings,
  onRemove,
  onOpen,
}: {
  listings: ComparableListing[];
  onRemove: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  const cheapestId = bestByMin(listings, (l) => l.rentCents);
  const closestId = bestByMin(listings, (l) => l.distanceFromCampusMiles);

  return (
    // table-fixed + equal column widths keep every listing column the same
    // size regardless of whether it has a photo or longer text values.
    <table className="w-full table-fixed border-collapse text-sm">
      <colgroup>
        <col className="w-36" />
        {listings.map((listing) => (
          <col key={listing.id} />
        ))}
      </colgroup>
      <thead>
        <tr>
          <th className="p-2" />
          {listings.map((listing) => (
            <th key={listing.id} className="p-2 text-left align-top">
              <div className="flex flex-col gap-2">
                <ListingMediaEmbed mediaLink={listing.mediaLink} compact />
                <div className="flex min-w-0 items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onOpen(listing.id)}
                    className="font-display min-w-0 truncate text-left text-ink hover:underline"
                  >
                    {listing.title}
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(listing.id)}
                    className="btn btn-ghost h-7 w-7 shrink-0 p-0"
                    aria-label={`Remove ${listing.title} from comparison`}
                  >
                    <IconX size={14} />
                  </button>
                </div>
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <Row label="Rent">
          {listings.map((l) => (
            <Cell key={l.id} highlight={l.id === cheapestId}>
              ${(l.rentCents / 100).toFixed(0)}/mo
            </Cell>
          ))}
        </Row>
        <Row label="Area">
          {listings.map((l) => (
            <Cell key={l.id}>{AREA_LABELS[l.area]}</Cell>
          ))}
        </Row>
        <Row label="Campus">
          {listings.map((l) => (
            <Cell key={l.id}>{CAMPUS_LABELS[l.campus]}</Cell>
          ))}
        </Row>
        <Row label="Distance from campus">
          {listings.map((l) => (
            <Cell key={l.id} highlight={l.id === closestId}>
              {l.distanceFromCampusMiles} mi
            </Cell>
          ))}
        </Row>
        <Row label="Bedrooms">
          {listings.map((l) => (
            <Cell key={l.id}>{l.bedrooms}</Cell>
          ))}
        </Row>
        <Row label="Bathrooms">
          {listings.map((l) => (
            <Cell key={l.id}>{l.bathrooms}</Cell>
          ))}
        </Row>
        <Row label="Furnished">
          {listings.map((l) => (
            <Cell key={l.id}>{FURNISHED_STATUS_LABELS[l.furnishedStatus]}</Cell>
          ))}
        </Row>
        <Row label="Move-in date">
          {listings.map((l) => (
            <Cell key={l.id}>{new Date(l.moveInDate).toLocaleDateString()}</Cell>
          ))}
        </Row>
        <Row label="Lease ends">
          {listings.map((l) => (
            <Cell key={l.id}>
              {l.leaseEndDate ? new Date(l.leaseEndDate).toLocaleDateString() : "Open-ended"}
            </Cell>
          ))}
        </Row>
        <Row label="Lease type">
          {listings.map((l) => (
            <Cell key={l.id}>{LEASE_TYPE_LABELS[l.leaseType]}</Cell>
          ))}
        </Row>
        <Row label="Guarantor required">
          {listings.map((l) => (
            <Cell key={l.id}>{l.guarantorReq ? "Yes" : "No"}</Cell>
          ))}
        </Row>
        <Row label="Utilities included">
          {listings.map((l) => (
            <Cell key={l.id}>{l.utilitiesIncl ? "Yes" : "No"}</Cell>
          ))}
        </Row>
        <Row label="Wifi included">
          {listings.map((l) => (
            <Cell key={l.id}>{l.wifiIncl ? "Yes" : "No"}</Cell>
          ))}
        </Row>
        <Row label="AC in room">
          {listings.map((l) => (
            <Cell key={l.id}>{l.acIncl ? "Yes" : "No"}</Cell>
          ))}
        </Row>
        <Row label="Private bathroom">
          {listings.map((l) => (
            <Cell key={l.id}>{l.privateBathroom ? "Yes" : "No"}</Cell>
          ))}
        </Row>
        <Row label="In-unit laundry">
          {listings.map((l) => (
            <Cell key={l.id}>{l.laundryIncl ? "Yes" : "No"}</Cell>
          ))}
        </Row>
        <Row label="Vegetarian preferred">
          {listings.map((l) => (
            <Cell key={l.id}>{l.vegPreferred ? "Yes" : "No"}</Cell>
          ))}
        </Row>
        <Row label="Gender preference">
          {listings.map((l) => (
            <Cell key={l.id}>{GENDER_PREFERENCE_LABELS[l.genderPref]}</Cell>
          ))}
        </Row>
        <Row label="Contact">
          {listings.map((l) => (
            <Cell key={l.id}>
              <ul className="flex flex-col gap-0.5">
                {l.contactWhatsapp && <li>WhatsApp: {l.contactWhatsapp}</li>}
                {l.contactEmail && <li>Email: {l.contactEmail}</li>}
                {l.contactPhone && <li>Phone: {l.contactPhone}</li>}
              </ul>
            </Cell>
          ))}
        </Row>
      </tbody>
    </table>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="border-t border-border">
      <th className="p-2 text-left align-top text-xs font-medium text-ink-soft">{label}</th>
      {children}
    </tr>
  );
}

function Cell({ children, highlight }: { children: React.ReactNode; highlight?: boolean }) {
  return (
    <td
      className={`overflow-hidden p-2 align-top break-words ${
        highlight ? "rounded-md bg-accent-soft font-medium text-accent" : "text-ink"
      }`}
    >
      {children}
    </td>
  );
}

/** Id of the item with the smallest `select(item)` value, or null if there's a tie or fewer than 2 items to compare. */
function bestByMin<T extends { id: string }>(items: T[], select: (item: T) => number): string | null {
  if (items.length < 2) return null;
  const values = items.map(select);
  const min = Math.min(...values);
  const winners = items.filter((_, i) => values[i] === min);
  return winners.length === 1 ? winners[0].id : null;
}
