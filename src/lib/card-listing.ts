import type { Listing, ListingPhoto } from "@prisma/client";

/** Fields shown on listing cards across Available / My listings. */
export type CardListing = Pick<
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizePhotos(value: unknown): CardListing["photos"] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((photo) => {
    if (!isRecord(photo)) return [];
    const { id, url } = photo;
    return typeof id === "string" && typeof url === "string" ? [{ id, url }] : [];
  });
}

/** Drop malformed rows and ensure `photos` is always an array (never undefined). */
export function normalizeCardListings(value: unknown): CardListing[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((row) => {
    if (!isRecord(row)) return [];
    const {
      id,
      title,
      rentCents,
      campus,
      distanceFromCampusMiles,
      bedrooms,
      bathrooms,
      furnishedStatus,
      vegPreferred,
      photos,
    } = row;

    if (
      typeof id !== "string" ||
      typeof title !== "string" ||
      typeof rentCents !== "number" ||
      typeof campus !== "string" ||
      typeof distanceFromCampusMiles !== "number" ||
      typeof bedrooms !== "number" ||
      typeof bathrooms !== "number" ||
      typeof furnishedStatus !== "string" ||
      typeof vegPreferred !== "boolean"
    ) {
      return [];
    }

    return [
      {
        id,
        title,
        rentCents,
        campus,
        distanceFromCampusMiles,
        bedrooms,
        bathrooms,
        furnishedStatus,
        vegPreferred,
        photos: normalizePhotos(photos),
      } as CardListing,
    ];
  });
}

export function normalizeMinePayload(value: unknown): {
  active: CardListing[];
  inactive: CardListing[];
} {
  if (!isRecord(value)) {
    return { active: [], inactive: [] };
  }
  return {
    active: normalizeCardListings(value.active),
    inactive: normalizeCardListings(value.inactive),
  };
}

/** Returns null when nothing valid is cached (missing or wrong top-level shape). */
export function readCachedCardListings(raw: unknown): CardListing[] | null {
  if (raw === null || raw === undefined) return null;
  if (!Array.isArray(raw)) return null;
  return normalizeCardListings(raw);
}

/** Returns null when nothing valid is cached (missing or wrong top-level shape). */
export function readCachedMinePayload(raw: unknown): {
  active: CardListing[];
  inactive: CardListing[];
} | null {
  if (raw === null || raw === undefined) return null;
  if (!isRecord(raw)) return null;
  if (!Array.isArray(raw.active) || !Array.isArray(raw.inactive)) return null;
  return normalizeMinePayload(raw);
}
