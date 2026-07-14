import {
  Area,
  Campus,
  FurnishedStatus,
  GenderPreference,
  LeaseType,
} from "@prisma/client";

// KTD5 — preset campus enum, not geocoding.
export const CAMPUS_LABELS: Record<Campus, string> = {
  WashingtonSquare: "Washington Square",
  Brooklyn: "Brooklyn",
  Tandon: "Tandon (Brooklyn Engineering)",
  UnionSquare: "Union Square",
  UpperEastSide: "Upper East Side (NYU Langone)",
  Other: "Other / not listed",
};

export const CAMPUS_OPTIONS = Object.entries(CAMPUS_LABELS).map(([value, label]) => ({
  value: value as Campus,
  label,
}));

// NYC boroughs + five key Jersey City areas (KTD5) — exact-match filtering
// without geocoding.
export const AREA_LABELS: Record<Area, string> = {
  Manhattan: "Manhattan",
  Brooklyn: "Brooklyn",
  Queens: "Queens",
  TheBronx: "The Bronx",
  StatenIsland: "Staten Island",
  DowntownJerseyCity: "Jersey City — Downtown",
  Newport: "Jersey City — Newport",
  JournalSquare: "Jersey City — Journal Square",
  JerseyCityHeights: "Jersey City — Heights",
  GroveStreet: "Jersey City — Grove Street",
  Other: "Other / not listed",
};

export const AREA_OPTIONS = Object.entries(AREA_LABELS).map(([value, label]) => ({
  value: value as Area,
  label,
}));

export const FURNISHED_STATUS_LABELS: Record<FurnishedStatus, string> = {
  Furnished: "Furnished",
  PartiallyFurnished: "Partially furnished",
  Unfurnished: "Unfurnished",
};

export const FURNISHED_STATUS_OPTIONS = Object.entries(FURNISHED_STATUS_LABELS).map(
  ([value, label]) => ({ value: value as FurnishedStatus, label })
);

export const GENDER_PREFERENCE_LABELS: Record<GenderPreference, string> = {
  NoPreference: "No preference",
  FemaleOnly: "Female-only",
  MaleOnly: "Male-only",
};

export const GENDER_PREFERENCE_OPTIONS = Object.entries(GENDER_PREFERENCE_LABELS).map(
  ([value, label]) => ({ value: value as GenderPreference, label })
);

export const LEASE_TYPE_LABELS: Record<LeaseType, string> = {
  NewLease: "New lease",
  LeaseTakeover: "Lease takeover",
  Sublet: "Sublet",
};

export const LEASE_TYPE_OPTIONS = Object.entries(LEASE_TYPE_LABELS).map(([value, label]) => ({
  value: value as LeaseType,
  label,
}));

// R19 / R21 lifecycle thresholds.
export const ACTIVE_LISTING_EXPIRY_DAYS = 15;
export const INACTIVE_LISTING_DELETION_DAYS = 60; // ~2 months

// KTD2 — session cookie sliding-expiry window.
export const SESSION_EXPIRY_DAYS = 5;

// KTD6 — photo upload caps. Incoming files are also resized/compressed
// server-side before Blob storage (see compressListingPhoto).
export const MAX_PHOTOS_PER_LISTING = 6;
export const MAX_PHOTO_SIZE_BYTES = 2 * 1024 * 1024; // 2MB pre-compress upload cap
/** Longest edge after compress — enough for detail view, small for Blob. */
export const PHOTO_MAX_EDGE_PX = 1600;
export const PHOTO_WEBP_QUALITY = 80;
export const ALLOWED_PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

// KTD3 — Google OAuth, restricted to NYU's Google Workspace domain.
export const NYU_GOOGLE_WORKSPACE_DOMAIN = "nyu.edu";

// Side-by-side comparison modal — max listings comparable at once. Lives
// here (a plain shared module) rather than in the "use client" compare
// context, since a Route Handler (server-only code) importing a constant
// from a "use client" module doesn't reliably resolve to the real value —
// it gets wrapped in a client-reference boundary and can coerce to NaN,
// which silently broke Array.prototype.slice() in the compare API route.
export const MAX_COMPARE_LISTINGS = 3;

/** Neon-facing server cache TTL for Active listing reads (seconds). */
export const LISTINGS_SERVER_CACHE_SECONDS = 60;

/**
 * Client-side minimum gap between network fetches for the same data bucket
 * (Available listings / My listings). Survives reload via sessionStorage so
 * spam refresh/reload does not hammer APIs. Mutations bypass this.
 */
export const CLIENT_FETCH_MIN_INTERVAL_MS = 30_000;
