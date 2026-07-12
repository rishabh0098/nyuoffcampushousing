"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DateInput } from "@/components/date-input";
import {
  AREA_OPTIONS,
  CAMPUS_OPTIONS,
  FURNISHED_STATUS_OPTIONS,
  GENDER_PREFERENCE_OPTIONS,
  LEASE_TYPE_OPTIONS,
} from "@/lib/constants";

// R7 — the filter dimensions for Available listings, laid out as a sidebar
// since there are now too many to fit comfortably in a top bar.
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
    <form onSubmit={onSubmit} className="tile flex w-full flex-col gap-4 p-4 text-sm lg:w-72">
      <div className="grid grid-cols-2 gap-2">
        <input
          name="minRentCents"
          type="number"
          placeholder="Min rent ($)"
          defaultValue={searchParams.get("minRentCents") ?? ""}
          className="input"
        />
        <input
          name="maxRentCents"
          type="number"
          placeholder="Max rent ($)"
          defaultValue={searchParams.get("maxRentCents") ?? ""}
          className="input"
        />
      </div>

      <select
        name="neighborhood"
        defaultValue={searchParams.get("neighborhood") ?? ""}
        aria-label="Area"
        className="input"
      >
        <option value="">Any area</option>
        {AREA_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        name="campus"
        defaultValue={searchParams.get("campus") ?? ""}
        aria-label="Campus"
        className="input"
      >
        <option value="">Any campus</option>
        {CAMPUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <input
        name="maxDistanceMiles"
        type="number"
        min={0}
        step="0.1"
        placeholder="Max distance from campus (mi)"
        defaultValue={searchParams.get("maxDistanceMiles") ?? ""}
        className="input"
      />

      <div className="grid grid-cols-2 gap-2">
        <input
          name="minBedrooms"
          type="number"
          placeholder="Min bedrooms"
          defaultValue={searchParams.get("minBedrooms") ?? ""}
          className="input"
        />
        <input
          name="minBathrooms"
          type="number"
          step="0.5"
          placeholder="Min bathrooms"
          defaultValue={searchParams.get("minBathrooms") ?? ""}
          className="input"
        />
      </div>

      <select
        name="furnishedStatus"
        defaultValue={searchParams.get("furnishedStatus") ?? ""}
        aria-label="Furnished"
        className="input"
      >
        <option value="">Any furnished status</option>
        {FURNISHED_STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <DateInput
        name="moveInBy"
        placeholder="Lease begins mm/dd/yyyy"
        defaultValue={searchParams.get("moveInBy") ?? ""}
      />
      <DateInput
        name="leaseEndAfter"
        placeholder="Lease ends mm/dd/yyyy"
        defaultValue={searchParams.get("leaseEndAfter") ?? ""}
      />

      <select
        name="leaseType"
        defaultValue={searchParams.get("leaseType") ?? ""}
        aria-label="Lease type"
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
        aria-label="Gender preference"
        className="input"
      >
        <option value="">Any gender preference</option>
        {GENDER_PREFERENCE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <div className="flex flex-wrap gap-2">
        <label className="checkbox-pill">
          <input
            type="checkbox"
            name="utilitiesIncl"
            value="true"
            defaultChecked={searchParams.get("utilitiesIncl") === "true"}
          />
          Utilities incl.
        </label>
        <label className="checkbox-pill">
          <input
            type="checkbox"
            name="wifiIncl"
            value="true"
            defaultChecked={searchParams.get("wifiIncl") === "true"}
          />
          Wifi incl.
        </label>
        <label className="checkbox-pill">
          <input
            type="checkbox"
            name="acIncl"
            value="true"
            defaultChecked={searchParams.get("acIncl") === "true"}
          />
          AC in room
        </label>
        <label className="checkbox-pill">
          <input
            type="checkbox"
            name="privateBathroom"
            value="true"
            defaultChecked={searchParams.get("privateBathroom") === "true"}
          />
          Private bathroom
        </label>
        <label className="checkbox-pill">
          <input
            type="checkbox"
            name="laundryIncl"
            value="true"
            defaultChecked={searchParams.get("laundryIncl") === "true"}
          />
          In-unit laundry
        </label>
        <label className="checkbox-pill">
          <input
            type="checkbox"
            name="vegPreferred"
            value="true"
            defaultChecked={searchParams.get("vegPreferred") === "true"}
          />
          Vegetarian preferred
        </label>
      </div>

      <button type="submit" className="btn btn-primary">
        Apply filters
      </button>
    </form>
  );
}
