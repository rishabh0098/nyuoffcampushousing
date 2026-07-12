import "server-only";
import { revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "./db";
import { LISTINGS_SERVER_CACHE_SECONDS } from "./constants";
import {
  buildListingWhereClause,
  type ListingFilters,
} from "./listing-filters";
import { getMyListings } from "./listings";

export const LISTINGS_CACHE_TAG = "listings";
export const MY_LISTINGS_CACHE_TAG = "listings-mine";

function serializeFilters(filters: ListingFilters): string {
  return JSON.stringify({
    minRentCents: filters.minRentCents ?? null,
    maxRentCents: filters.maxRentCents ?? null,
    area: filters.area ?? null,
    campus: filters.campus ?? null,
    maxDistanceMiles: filters.maxDistanceMiles ?? null,
    minBedrooms: filters.minBedrooms ?? null,
    minBathrooms: filters.minBathrooms ?? null,
    furnishedStatus: filters.furnishedStatus ?? null,
    moveInBy: filters.moveInBy?.toISOString() ?? null,
    leaseEndAfter: filters.leaseEndAfter?.toISOString() ?? null,
    leaseType: filters.leaseType ?? null,
    guarantorReq: filters.guarantorReq ?? null,
    utilitiesIncl: filters.utilitiesIncl ?? null,
    wifiIncl: filters.wifiIncl ?? null,
    acIncl: filters.acIncl ?? null,
    privateBathroom: filters.privateBathroom ?? null,
    laundryIncl: filters.laundryIncl ?? null,
    vegPreferred: filters.vegPreferred ?? null,
    genderPref: filters.genderPref ?? null,
  });
}

/** Cached Active-listings query — cuts repeat Neon load for identical filters. */
export function getCachedActiveListings(filters: ListingFilters) {
  const key = serializeFilters(filters);
  return unstable_cache(
    async () =>
      prisma.listing.findMany({
        where: buildListingWhereClause(filters),
        include: { photos: true },
        orderBy: { createdAt: "desc" },
      }),
    ["active-listings", key],
    { revalidate: LISTINGS_SERVER_CACHE_SECONDS, tags: [LISTINGS_CACHE_TAG] }
  )();
}

/** Per-email My listings cache — short TTL; invalidated on listing mutations. */
export function getCachedMyListings(posterEmail: string) {
  return unstable_cache(
    async () => getMyListings(posterEmail),
    ["my-listings", posterEmail],
    { revalidate: LISTINGS_SERVER_CACHE_SECONDS, tags: [MY_LISTINGS_CACHE_TAG] }
  )();
}

export function invalidateListingsCaches() {
  revalidateTag(LISTINGS_CACHE_TAG, "max");
  revalidateTag(MY_LISTINGS_CACHE_TAG, "max");
}
