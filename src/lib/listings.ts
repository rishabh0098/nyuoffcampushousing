import "server-only";
import { z } from "zod";
import {
  Campus,
  FurnishedStatus,
  GenderPreference,
  LeaseType,
  ListingStatus,
  Neighborhood,
  type Listing,
} from "@prisma/client";
import { prisma } from "./db";
import { ACTIVE_LISTING_EXPIRY_DAYS } from "./constants";

export const ListingInputSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(4000),
    rentCents: z.number().int().nonnegative(),
    neighborhood: z.enum(Neighborhood),
    campus: z.enum(Campus),
    distanceFromCampusMiles: z.number().nonnegative(),
    bedrooms: z.number().int().nonnegative(),
    bathrooms: z.number().positive(),
    furnishedStatus: z.enum(FurnishedStatus),
    moveInDate: z.coerce.date(),
    leaseEndDate: z.coerce.date().optional(),
    leaseType: z.enum(LeaseType),
    guarantorReq: z.boolean().default(false),
    utilitiesIncl: z.boolean().default(false),
    wifiIncl: z.boolean().default(false),
    acIncl: z.boolean().default(false),
    privateBathroom: z.boolean().default(false),
    laundryIncl: z.boolean().default(false),
    vegPreferred: z.boolean().default(false),
    genderPref: z.enum(GenderPreference).default("NoPreference"),
    contactWhatsapp: z.string().trim().max(40).optional().or(z.literal("")),
    contactEmail: z.email().optional().or(z.literal("")),
    contactPhone: z.string().trim().max(40).optional().or(z.literal("")),
    photoUrls: z.array(z.url()).max(6).default([]),
  })
  // R12 — at least one contact method is required.
  .refine(
    (data) => Boolean(data.contactWhatsapp || data.contactEmail || data.contactPhone),
    { message: "Provide at least one contact method: WhatsApp, email, or phone.", path: ["contactWhatsapp"] }
  )
  // A defined lease end can't be before the move-in date.
  .refine(
    (data) => !data.leaseEndDate || data.leaseEndDate >= data.moveInDate,
    { message: "Lease end date must be on or after the move-in date.", path: ["leaseEndDate"] }
  );

export type ListingInput = z.infer<typeof ListingInputSchema>;

/** R13 — new listings are tied to the poster's verified email. */
export async function createListing(posterEmail: string, input: ListingInput): Promise<Listing> {
  const { photoUrls, ...fields } = input;
  return prisma.listing.create({
    data: {
      ...fields,
      posterEmail,
      contactWhatsapp: fields.contactWhatsapp || null,
      contactEmail: fields.contactEmail || null,
      contactPhone: fields.contactPhone || null,
      photos: { create: photoUrls.map((url) => ({ url })) },
    },
  });
}

/**
 * Fetches a listing for editing — scoped to the caller's own *Active*
 * listings only (editing an Inactive listing doesn't make sense; reactivate
 * it first). Throws the same OwnershipError as the other mutators so a
 * mismatched owner or wrong status looks like "not found", not "forbidden".
 */
export async function getEditableListing(id: string, callerEmail: string) {
  const listing = await prisma.listing.findFirst({
    where: { id, posterEmail: callerEmail, status: "Active" },
    include: { photos: true },
  });
  if (!listing) {
    throw new OwnershipError();
  }
  return listing;
}

/**
 * Edits an Active listing's fields. Photos are additive-only here (existing
 * photos are kept, any newly uploaded ones are appended) — there's no
 * "remove a photo" flow yet, so this never deletes a `ListingPhoto` row.
 */
export async function updateListing(
  id: string,
  callerEmail: string,
  input: ListingInput
): Promise<Listing> {
  const { photoUrls, ...fields } = input;
  const result = await prisma.listing.updateMany({
    where: { id, posterEmail: callerEmail, status: "Active" },
    data: {
      ...fields,
      contactWhatsapp: fields.contactWhatsapp || null,
      contactEmail: fields.contactEmail || null,
      contactPhone: fields.contactPhone || null,
    },
  });
  if (result.count === 0) {
    throw new OwnershipError();
  }
  if (photoUrls.length > 0) {
    await prisma.listingPhoto.createMany({
      data: photoUrls.map((url) => ({ listingId: id, url })),
    });
  }
  return prisma.listing.findUniqueOrThrow({ where: { id } });
}

/** R9 — the poster's own listings, split into Active and Inactive sections. */
export async function getMyListings(posterEmail: string) {
  const listings = await prisma.listing.findMany({
    where: { posterEmail },
    include: { photos: true },
    orderBy: { updatedAt: "desc" },
  });
  return {
    active: listings.filter((l) => l.status === "Active"),
    inactive: listings.filter((l) => l.status === "Inactive"),
  };
}

export class OwnershipError extends Error {
  constructor() {
    super("Listing not found or not owned by the caller.");
  }
}

/**
 * R14, R23 — remove a listing. Ownership is checked against `callerEmail`
 * (the Google-verified session email, never a client-supplied value) as part of
 * the `where` clause itself: a mismatched owner makes the row invisible to
 * `updateMany`, which reports 0 affected rows rather than leaking whether the
 * listing exists under someone else's email.
 */
export async function removeListing(id: string, callerEmail: string): Promise<void> {
  const result = await prisma.listing.updateMany({
    where: { id, posterEmail: callerEmail, status: "Active" },
    data: { status: "Inactive", inactivatedAt: new Date() },
  });
  if (result.count === 0) {
    throw new OwnershipError();
  }
}

/** R20, R23 — reactivate a listing, resetting its 15-day expiry clock. */
export async function reactivateListing(id: string, callerEmail: string): Promise<void> {
  const result = await prisma.listing.updateMany({
    where: { id, posterEmail: callerEmail, status: "Inactive" },
    data: { status: "Active", activatedAt: new Date(), inactivatedAt: null },
  });
  if (result.count === 0) {
    throw new OwnershipError();
  }
}

export function activeExpiryCutoff(now: Date): Date {
  return new Date(now.getTime() - ACTIVE_LISTING_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
}

export { ListingStatus };
