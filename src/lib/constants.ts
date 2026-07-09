import {
  Campus,
  FurnishedStatus,
  GenderPreference,
  LeaseType,
  Neighborhood,
} from "@prisma/client";

// KTD5 — preset campus/neighborhood enum, not geocoding.
export const CAMPUS_LABELS: Record<Campus, string> = {
  WashingtonSquare: "Washington Square",
  Brooklyn: "Brooklyn",
  Tandon: "Tandon (Brooklyn Engineering)",
  Stern: "Stern School of Business",
  UnionSquare: "Union Square",
  UpperEastSide: "Upper East Side (NYU Langone)",
  Other: "Other / not listed",
};

export const CAMPUS_OPTIONS = Object.entries(CAMPUS_LABELS).map(([value, label]) => ({
  value: value as Campus,
  label,
}));

// KTD5 — preset list of popular NYC / Jersey City neighborhoods near NYU
// campuses, same exact-match-without-geocoding rationale as `Campus`.
export const NEIGHBORHOOD_LABELS: Record<Neighborhood, string> = {
  GreenwichVillage: "Greenwich Village",
  EastVillage: "East Village",
  WestVillage: "West Village",
  Soho: "SoHo",
  Noho: "NoHo",
  UnionSquare: "Union Square",
  Gramercy: "Gramercy",
  Chelsea: "Chelsea",
  LowerEastSide: "Lower East Side",
  Chinatown: "Chinatown",
  MurrayHill: "Murray Hill",
  KipsBay: "Kips Bay",
  UpperEastSide: "Upper East Side",
  BrooklynHeights: "Brooklyn Heights",
  Dumbo: "DUMBO",
  DowntownBrooklyn: "Downtown Brooklyn",
  Williamsburg: "Williamsburg",
  Bushwick: "Bushwick",
  FortGreene: "Fort Greene",
  ClintonHill: "Clinton Hill",
  JerseyCityDowntown: "Jersey City — Downtown",
  JerseyCityHeights: "Jersey City — Heights",
  JournalSquare: "Journal Square",
  Hoboken: "Hoboken",
  Other: "Other / not listed",
};

export const NEIGHBORHOOD_OPTIONS = Object.entries(NEIGHBORHOOD_LABELS).map(
  ([value, label]) => ({ value: value as Neighborhood, label })
);

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
export const INACTIVE_LISTING_DELETION_DAYS = 90; // ~3 months

// KTD2 — session cookie sliding-expiry window.
export const SESSION_EXPIRY_DAYS = 5;

// KTD6 — photo upload caps.
export const MAX_PHOTOS_PER_LISTING = 6;
export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

// KTD3 — Google OAuth, restricted to NYU's Google Workspace domain.
export const NYU_GOOGLE_WORKSPACE_DOMAIN = "nyu.edu";
