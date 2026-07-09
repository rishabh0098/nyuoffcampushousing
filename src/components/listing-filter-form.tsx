"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  CAMPUS_OPTIONS,
  GENDER_PREFERENCE_OPTIONS,
  LEASE_TYPE_OPTIONS,
} from "@/lib/constants";

// R7 — the eight filter dimensions for Available listings.
export function ListingFilterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    for (const [key, value] of form.entries()) {
      if (typeof value === "string" && value !== "") params.set(key, value);
    }
    router.push(`/listings?${params.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} className="mb-6 flex flex-wrap gap-3 text-sm">
      <input
        name="minRentCents"
        type="number"
        placeholder="Min rent ($)"
        defaultValue={searchParams.get("minRentCents") ?? ""}
        className="input w-32"
        onChange={() => {}}
      />
      <input
        name="maxRentCents"
        type="number"
        placeholder="Max rent ($)"
        defaultValue={searchParams.get("maxRentCents") ?? ""}
        className="input w-32"
      />
      <select name="campus" defaultValue={searchParams.get("campus") ?? ""} className="input">
        <option value="">Any campus</option>
        {CAMPUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <input
        name="minBedrooms"
        type="number"
        placeholder="Min bedrooms"
        defaultValue={searchParams.get("minBedrooms") ?? ""}
        className="input w-32"
      />
      <input
        name="moveInBy"
        type="date"
        defaultValue={searchParams.get("moveInBy") ?? ""}
        className="input"
      />
      <select
        name="leaseType"
        defaultValue={searchParams.get("leaseType") ?? ""}
        className="input"
      >
        <option value="">Any lease type</option>
        {LEASE_TYPE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <select
        name="genderPref"
        defaultValue={searchParams.get("genderPref") ?? ""}
        className="input"
      >
        <option value="">Any gender preference</option>
        {GENDER_PREFERENCE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <label className="flex items-center gap-1">
        <input
          type="checkbox"
          name="utilitiesIncl"
          value="true"
          defaultChecked={searchParams.get("utilitiesIncl") === "true"}
        />
        Utilities incl.
      </label>
      <label className="flex items-center gap-1">
        <input
          type="checkbox"
          name="vegPreferred"
          value="true"
          defaultChecked={searchParams.get("vegPreferred") === "true"}
        />
        Vegetarian preferred
      </label>
      <button type="submit" className="rounded bg-black px-3 py-2 text-white">
        Apply filters
      </button>
    </form>
  );
}
