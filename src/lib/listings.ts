import "server-only";
import { z } from "zod";
import {
  Area,
  Campus,
  FurnishedStatus,
  GenderPreference,
  LeaseType,
  type Listing,
} from "@prisma/client";
import { encryptContactFields, decryptContactFields } from "./contact-crypto";
import { isAllowedListingMediaUrl } from "./listing-media-url";
import { withUserRls } from "./rls";

export const ListingInputSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(4000),
    rentCents: z.number().int().nonnegative(),
    area: z.enum(Area),
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
    mediaLink: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine((value) => !value || isAllowedListingMediaUrl(value), {
        message:
          "Media link must be HTTPS on an allowlisted host (Google Drive, Dropbox, Box, OneDrive, or iCloud).",
      }),
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

function normalizeMediaLink(mediaLink: string | undefined): string | null {
  return mediaLink?.trim() ? mediaLink.trim() : null;
}

/** R13 — new listings are tied to the poster's verified email. */
export async function createListing(posterEmail: string, input: ListingInput): Promise<Listing> {
  const contacts = encryptContactFields({
    contactWhatsapp: input.contactWhatsapp || null,
    contactEmail: input.contactEmail || null,
    contactPhone: input.contactPhone || null,
  });

  const listing = await withUserRls(posterEmail, (tx) =>
    tx.listing.create({
      data: {
        title: input.title,
        description: input.description,
        rentCents: input.rentCents,
        area: input.area,
        campus: input.campus,
        distanceFromCampusMiles: input.distanceFromCampusMiles,
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms,
        furnishedStatus: input.furnishedStatus,
        moveInDate: input.moveInDate,
        leaseEndDate: input.leaseEndDate,
        leaseType: input.leaseType,
        guarantorReq: input.guarantorReq,
        utilitiesIncl: input.utilitiesIncl,
        wifiIncl: input.wifiIncl,
        acIncl: input.acIncl,
        privateBathroom: input.privateBathroom,
        laundryIncl: input.laundryIncl,
        vegPreferred: input.vegPreferred,
        genderPref: input.genderPref,
        posterEmail,
        mediaLink: normalizeMediaLink(input.mediaLink),
        ...contacts,
      },
    })
  );

  return decryptContactFields(listing);
}

/** Edits an Active listing's fields. Ownership is enforced in the WHERE clause + RLS. */
export async function updateListing(
  id: string,
  callerEmail: string,
  input: ListingInput
): Promise<Listing> {
  const contacts = encryptContactFields({
    contactWhatsapp: input.contactWhatsapp || null,
    contactEmail: input.contactEmail || null,
    contactPhone: input.contactPhone || null,
  });

  return withUserRls(callerEmail, async (tx) => {
    const result = await tx.listing.updateMany({
      where: { id, posterEmail: callerEmail, status: "Active" },
      data: {
        title: input.title,
        description: input.description,
        rentCents: input.rentCents,
        area: input.area,
        campus: input.campus,
        distanceFromCampusMiles: input.distanceFromCampusMiles,
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms,
        furnishedStatus: input.furnishedStatus,
        moveInDate: input.moveInDate,
        leaseEndDate: input.leaseEndDate ?? null,
        leaseType: input.leaseType,
        guarantorReq: input.guarantorReq,
        utilitiesIncl: input.utilitiesIncl,
        wifiIncl: input.wifiIncl,
        acIncl: input.acIncl,
        privateBathroom: input.privateBathroom,
        laundryIncl: input.laundryIncl,
        vegPreferred: input.vegPreferred,
        genderPref: input.genderPref,
        mediaLink: normalizeMediaLink(input.mediaLink),
        ...contacts,
      },
    });
    if (result.count === 0) {
      throw new OwnershipError();
    }
    const listing = await tx.listing.findUniqueOrThrow({ where: { id } });
    return decryptContactFields(listing);
  });
}

/** R9 — the poster's own listings, split into Active and Inactive sections. */
export async function getMyListings(posterEmail: string) {
  const listings = await withUserRls(posterEmail, (tx) =>
    tx.listing.findMany({
      where: { posterEmail },
      orderBy: { updatedAt: "desc" },
    })
  );
  const decrypted = listings.map(decryptContactFields);
  return {
    active: decrypted.filter((l) => l.status === "Active"),
    inactive: decrypted.filter((l) => l.status === "Inactive"),
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
  await withUserRls(callerEmail, async (tx) => {
    const result = await tx.listing.updateMany({
      where: { id, posterEmail: callerEmail, status: "Active" },
      data: { status: "Inactive", inactivatedAt: new Date() },
    });
    if (result.count === 0) {
      throw new OwnershipError();
    }
  });
}

/** R20, R23 — reactivate a listing, resetting its 15-day expiry clock. */
export async function reactivateListing(id: string, callerEmail: string): Promise<void> {
  await withUserRls(callerEmail, async (tx) => {
    const result = await tx.listing.updateMany({
      where: { id, posterEmail: callerEmail, status: "Inactive" },
      data: { status: "Active", activatedAt: new Date(), inactivatedAt: null },
    });
    if (result.count === 0) {
      throw new OwnershipError();
    }
  });
}
