import { Campus, GenderPreference, LeaseType } from "@prisma/client";

// KTD5 — preset campus/neighborhood enum, not geocoding.
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
export const INACTIVE_LISTING_DELETION_DAYS = 90; // ~3 months

// KTD2 — session cookie sliding-expiry window.
export const SESSION_EXPIRY_DAYS = 5;

// KTD6 — photo upload caps.
export const MAX_PHOTOS_PER_LISTING = 6;
export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

// KTD3 — OTP rate limits.
export const OTP_CODE_LENGTH = 6;
export const OTP_EXPIRY_MINUTES = 10;
export const OTP_RESEND_COOLDOWN_SECONDS = 30;
export const OTP_MAX_VERIFY_ATTEMPTS = 5;
export const OTP_MAX_REQUESTS_PER_HOUR = 5;
