"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import type { Campus, FurnishedStatus, GenderPreference, LeaseType, Neighborhood } from "@prisma/client";
import { DateInput } from "@/components/date-input";
import {
  CAMPUS_OPTIONS,
  FURNISHED_STATUS_OPTIONS,
  GENDER_PREFERENCE_OPTIONS,
  LEASE_TYPE_OPTIONS,
  MAX_PHOTOS_PER_LISTING,
  NEIGHBORHOOD_OPTIONS,
} from "@/lib/constants";

export type ListingFormInitialValues = {
  title: string;
  description: string;
  rentCents: number;
  neighborhood: Neighborhood;
  campus: Campus;
  distanceFromCampusMiles: number;
  bedrooms: number;
  bathrooms: number;
  furnishedStatus: FurnishedStatus;
  moveInDate: string; // yyyy-mm-dd
  leaseEndDate?: string; // yyyy-mm-dd
  leaseType: LeaseType;
  guarantorReq: boolean;
  utilitiesIncl: boolean;
  wifiIncl: boolean;
  acIncl: boolean;
  privateBathroom: boolean;
  laundryIncl: boolean;
  vegPreferred: boolean;
  genderPref: GenderPreference;
  contactWhatsapp: string;
  contactEmail: string;
  contactPhone: string;
  existingPhotoUrls: string[];
};

// R10–R13 — shared by "add a listing" and "edit a listing": structured
// fields, optional photos, at least one contact method (enforced by
// ListingInputSchema server-side).
export function ListingForm({
  mode,
  listingId,
  initialValues,
}: {
  mode: "create" | "edit";
  listingId?: string;
  initialValues?: ListingFormInitialValues;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [moveInDate, setMoveInDate] = useState(initialValues?.moveInDate ?? "");
  const [leaseEndDate, setLeaseEndDate] = useState(initialValues?.leaseEndDate ?? "");

  const existingPhotoCount = initialValues?.existingPhotoUrls.length ?? 0;
  const remainingPhotoSlots = Math.max(0, MAX_PHOTOS_PER_LISTING - existingPhotoCount);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    if (leaseEndDate && moveInDate && leaseEndDate < moveInDate) {
      setError("Lease end date must be on or after the move-in date.");
      setPending(false);
      return;
    }

    try {
      const form = new FormData(e.currentTarget);

      const photoUrls: string[] = [];
      for (const file of photos.slice(0, remainingPhotoSlots)) {
        const uploadForm = new FormData();
        uploadForm.set("file", file);
        const res = await fetch("/api/listings/photos", { method: "POST", body: uploadForm });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Photo upload failed.");
          return;
        }
        photoUrls.push(data.url);
      }

      const payload = {
        title: form.get("title"),
        description: form.get("description"),
        rentCents: Math.round(Number(form.get("rent")) * 100),
        neighborhood: form.get("neighborhood"),
        campus: form.get("campus"),
        distanceFromCampusMiles: Number(form.get("distanceFromCampusMiles")),
        bedrooms: Number(form.get("bedrooms")),
        bathrooms: Number(form.get("bathrooms")),
        furnishedStatus: form.get("furnishedStatus"),
        moveInDate: form.get("moveInDate"),
        leaseEndDate: form.get("leaseEndDate") || undefined,
        leaseType: form.get("leaseType"),
        guarantorReq: form.get("guarantorReq") === "on",
        utilitiesIncl: form.get("utilitiesIncl") === "on",
        wifiIncl: form.get("wifiIncl") === "on",
        acIncl: form.get("acIncl") === "on",
        privateBathroom: form.get("privateBathroom") === "on",
        laundryIncl: form.get("laundryIncl") === "on",
        vegPreferred: form.get("vegPreferred") === "on",
        genderPref: form.get("genderPref"),
        contactWhatsapp: form.get("contactWhatsapp") || "",
        contactEmail: form.get("contactEmail") || "",
        contactPhone: form.get("contactPhone") || "",
        photoUrls,
      };

      const res = await fetch(
        mode === "create" ? "/api/listings" : `/api/listings/${listingId}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save listing.");
        return;
      }

      router.push("/my-listings");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto flex max-w-lg flex-col gap-4">
      <div className="mb-2 flex flex-col gap-1">
        <span className="eyebrow">{mode === "create" ? "New listing" : "Edit listing"}</span>
        <h1 className="font-display text-2xl text-ink">
          {mode === "create" ? "Add a listing" : "Edit listing"}
        </h1>
      </div>

      <Field label="Title">
        <input name="title" required defaultValue={initialValues?.title} className="input" />
      </Field>
      <Field label="Description">
        <textarea
          name="description"
          required
          rows={4}
          defaultValue={initialValues?.description}
          className="input"
        />
      </Field>
      <Field label="Rent (USD/month)">
        <input
          name="rent"
          type="number"
          min={0}
          step="1"
          required
          defaultValue={initialValues ? initialValues.rentCents / 100 : undefined}
          className="input"
        />
      </Field>
      <Field label="Neighborhood / area">
        <select
          name="neighborhood"
          required
          defaultValue={initialValues?.neighborhood ?? ""}
          className="input"
        >
          <option value="" disabled>
            Select a neighborhood…
          </option>
          {NEIGHBORHOOD_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Nearest campus">
        <select name="campus" required defaultValue={initialValues?.campus} className="input">
          {CAMPUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Distance from that campus (miles)">
        <input
          name="distanceFromCampusMiles"
          type="number"
          min={0}
          step="0.1"
          required
          defaultValue={initialValues?.distanceFromCampusMiles}
          className="input"
        />
      </Field>
      <Field label="Bedrooms">
        <input
          name="bedrooms"
          type="number"
          min={0}
          required
          defaultValue={initialValues?.bedrooms}
          className="input"
        />
      </Field>
      <Field label="Bathrooms">
        <input
          name="bathrooms"
          type="number"
          min={0.5}
          step="0.5"
          required
          defaultValue={initialValues?.bathrooms}
          className="input"
        />
      </Field>
      <Field label="Furnished">
        <select
          name="furnishedStatus"
          required
          defaultValue={initialValues?.furnishedStatus ?? "Unfurnished"}
          className="input"
        >
          {FURNISHED_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Move-in date">
        <DateInput
          name="moveInDate"
          defaultValue={initialValues?.moveInDate}
          onIsoChange={setMoveInDate}
        />
      </Field>
      <Field label="Lease end date (optional — leave blank if open-ended; must be on or after move-in)">
        <DateInput
          name="leaseEndDate"
          defaultValue={initialValues?.leaseEndDate}
          onIsoChange={setLeaseEndDate}
        />
      </Field>
      <Field label="Lease type">
        <select name="leaseType" required defaultValue={initialValues?.leaseType} className="input">
          {LEASE_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>
      <Checkbox name="guarantorReq" label="Guarantor required" defaultChecked={initialValues?.guarantorReq} />
      <Checkbox name="utilitiesIncl" label="Utilities included" defaultChecked={initialValues?.utilitiesIncl} />
      <Checkbox name="wifiIncl" label="Wifi included" defaultChecked={initialValues?.wifiIncl} />
      <Checkbox name="acIncl" label="AC in room" defaultChecked={initialValues?.acIncl} />
      <Checkbox
        name="privateBathroom"
        label="Private bathroom"
        defaultChecked={initialValues?.privateBathroom}
      />
      <Checkbox name="laundryIncl" label="In-unit laundry" defaultChecked={initialValues?.laundryIncl} />
      <Checkbox name="vegPreferred" label="Vegetarian preferred" defaultChecked={initialValues?.vegPreferred} />
      <Field label="Gender preference">
        <select
          name="genderPref"
          defaultValue={initialValues?.genderPref ?? "NoPreference"}
          className="input"
        >
          {GENDER_PREFERENCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      <fieldset className="tile flex flex-col gap-3 p-4">
        <legend className="mb-1 px-1 text-sm font-medium text-ink">
          Contact (at least one required)
        </legend>
        <Field label="WhatsApp">
          <input
            name="contactWhatsapp"
            defaultValue={initialValues?.contactWhatsapp}
            className="input"
          />
        </Field>
        <Field label="Email">
          <input
            name="contactEmail"
            type="email"
            defaultValue={initialValues?.contactEmail}
            className="input"
          />
        </Field>
        <Field label="Phone">
          <input
            name="contactPhone"
            defaultValue={initialValues?.contactPhone}
            className="input"
          />
        </Field>
      </fieldset>

      {existingPhotoCount > 0 && initialValues && (
        <Field label="Current photos">
          <div className="grid grid-cols-3 gap-2">
            {initialValues.existingPhotoUrls.map((url) => (
              <Image
                key={url}
                src={url}
                alt=""
                width={120}
                height={90}
                className="aspect-[4/3] rounded-lg border border-border object-cover"
              />
            ))}
          </div>
        </Field>
      )}

      {remainingPhotoSlots > 0 ? (
        <Field
          label={
            mode === "create"
              ? `Photos (optional, up to ${MAX_PHOTOS_PER_LISTING})`
              : `Add more photos (optional, up to ${remainingPhotoSlots} more)`
          }
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(e) => setPhotos(Array.from(e.target.files ?? []))}
            className="input"
          />
        </Field>
      ) : (
        <p className="text-xs text-ink-soft">
          You&apos;ve reached the {MAX_PHOTOS_PER_LISTING}-photo limit for this listing.
        </p>
      )}

      {error && (
        <p className="rounded-lg border border-danger/30 bg-danger-soft px-4 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? "Saving…" : mode === "create" ? "Submit listing" : "Save changes"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}

function Checkbox({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="checkbox-pill w-fit">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} />
      {label}
    </label>
  );
}
