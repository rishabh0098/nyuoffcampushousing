"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CAMPUS_OPTIONS,
  GENDER_PREFERENCE_OPTIONS,
  LEASE_TYPE_OPTIONS,
  MAX_PHOTOS_PER_LISTING,
} from "@/lib/constants";

// R10–R13 — add a listing: structured fields, optional photos, at least one
// contact method (enforced by ListingInputSchema server-side).
export default function NewListingPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    try {
      const form = new FormData(e.currentTarget);

      const photoUrls: string[] = [];
      for (const file of photos.slice(0, MAX_PHOTOS_PER_LISTING)) {
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
        bedrooms: Number(form.get("bedrooms")),
        moveInDate: form.get("moveInDate"),
        leaseType: form.get("leaseType"),
        guarantorReq: form.get("guarantorReq") === "on",
        utilitiesIncl: form.get("utilitiesIncl") === "on",
        wifiIncl: form.get("wifiIncl") === "on",
        vegPreferred: form.get("vegPreferred") === "on",
        genderPref: form.get("genderPref"),
        contactWhatsapp: form.get("contactWhatsapp") || "",
        contactEmail: form.get("contactEmail") || "",
        contactPhone: form.get("contactPhone") || "",
        photoUrls,
      };

      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not create listing.");
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
      <h1 className="text-lg font-semibold">Add a listing</h1>

      <Field label="Title">
        <input name="title" required className="input" />
      </Field>
      <Field label="Description">
        <textarea name="description" required rows={4} className="input" />
      </Field>
      <Field label="Rent (USD/month)">
        <input name="rent" type="number" min={0} step="1" required className="input" />
      </Field>
      <Field label="Neighborhood / area">
        <input name="neighborhood" required className="input" />
      </Field>
      <Field label="Campus / distance">
        <select name="campus" required className="input">
          {CAMPUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Bedrooms">
        <input name="bedrooms" type="number" min={0} required className="input" />
      </Field>
      <Field label="Move-in date">
        <input name="moveInDate" type="date" required className="input" />
      </Field>
      <Field label="Lease type">
        <select name="leaseType" required className="input">
          {LEASE_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>
      <Checkbox name="guarantorReq" label="Guarantor required" />
      <Checkbox name="utilitiesIncl" label="Utilities included" />
      <Checkbox name="wifiIncl" label="Wifi included" />
      <Checkbox name="vegPreferred" label="Vegetarian preferred" />
      <Field label="Gender preference">
        <select name="genderPref" defaultValue="NoPreference" className="input">
          {GENDER_PREFERENCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      <fieldset className="rounded border border-gray-200 p-3">
        <legend className="text-sm font-medium">
          Contact (at least one required)
        </legend>
        <Field label="WhatsApp">
          <input name="contactWhatsapp" className="input" />
        </Field>
        <Field label="Email">
          <input name="contactEmail" type="email" className="input" />
        </Field>
        <Field label="Phone">
          <input name="contactPhone" className="input" />
        </Field>
      </fieldset>

      <Field label={`Photos (optional, up to ${MAX_PHOTOS_PER_LISTING})`}>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => setPhotos(Array.from(e.target.files ?? []))}
          className="input"
        />
      </Field>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
      >
        {pending ? "Submitting…" : "Submit listing"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}

function Checkbox({ name, label }: { name: string; label: string }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name={name} />
      {label}
    </label>
  );
}
