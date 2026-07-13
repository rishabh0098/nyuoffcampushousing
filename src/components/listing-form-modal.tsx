"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Listing } from "@prisma/client";
import { ListingForm, type ListingFormInitialValues } from "@/components/listing-form";
import { ModalCloseButton } from "@/components/icons";

type EditableListing = Listing;

function toDateInputValue(date: string | Date | null | undefined): string | undefined {
  if (!date) return undefined;
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}

function toInitialValues(listing: EditableListing): ListingFormInitialValues {
  return {
    title: listing.title,
    description: listing.description,
    rentCents: listing.rentCents,
    area: listing.area,
    campus: listing.campus,
    distanceFromCampusMiles: listing.distanceFromCampusMiles,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    furnishedStatus: listing.furnishedStatus,
    moveInDate: toDateInputValue(listing.moveInDate) ?? "",
    leaseEndDate: toDateInputValue(listing.leaseEndDate),
    leaseType: listing.leaseType,
    guarantorReq: listing.guarantorReq,
    utilitiesIncl: listing.utilitiesIncl,
    wifiIncl: listing.wifiIncl,
    acIncl: listing.acIncl,
    privateBathroom: listing.privateBathroom,
    laundryIncl: listing.laundryIncl,
    vegPreferred: listing.vegPreferred,
    genderPref: listing.genderPref,
    contactWhatsapp: listing.contactWhatsapp ?? "",
    contactEmail: listing.contactEmail ?? "",
    contactPhone: listing.contactPhone ?? "",
    mediaLink: listing.mediaLink ?? "",
  };
}

export function ListingFormModal({
  mode,
  listingId,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  listingId?: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [initialValues, setInitialValues] = useState<ListingFormInitialValues | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(mode === "edit");

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (mode !== "edit" || !listingId) return;
    let cancelled = false;
    setLoadingEdit(true);
    setLoadError(null);
    fetch(`/api/listings/${listingId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("not found");
        return res.json() as Promise<{ listing: EditableListing }>;
      })
      .then((data) => {
        if (cancelled) return;
        if (data.listing.status !== "Active") {
          setLoadError("Only Active listings can be edited. Reactivate it first.");
          setInitialValues(null);
          return;
        }
        setInitialValues(toInitialValues(data.listing));
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError("Could not load this listing for editing.");
          setInitialValues(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingEdit(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mode, listingId]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={mode === "create" ? "Add a listing" : "Edit listing"}
        className="tile flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-display text-lg text-ink">
            {mode === "create" ? "Add a listing" : "Edit listing"}
          </h2>
          <ModalCloseButton onClick={onClose} />
        </div>
        <div className="overflow-auto p-4">
          {mode === "edit" && loadingEdit ? (
            <p className="text-sm text-ink-soft">Loading…</p>
          ) : loadError ? (
            <p className="text-sm text-danger">{loadError}</p>
          ) : mode === "edit" && !initialValues ? (
            <p className="text-sm text-ink-soft">Listing not available.</p>
          ) : (
            <ListingForm
              mode={mode}
              listingId={listingId}
              initialValues={initialValues ?? undefined}
              onCancel={onClose}
              onSuccess={onSaved}
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
