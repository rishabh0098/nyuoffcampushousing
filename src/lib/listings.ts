import "server-only";
import { z } from "zod";
import { Campus, GenderPreference, LeaseType, ListingStatus, type Listing } from "@prisma/client";
import { prisma } from "./db";
import { ACTIVE_LISTING_EXPIRY_DAYS } from "./constants";

export const ListingInputSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(4000),
    rentCents: z.number().int().nonnegative(),
    neighborhood: z.string().trim().min(1).max(120),
    campus: z.enum(Campus),
    bedrooms: z.number().int().nonnegative(),
    moveInDate: z.coerce.date(),
    leaseType: z.enum(LeaseType),
    guarantorReq: z.boolean().default(false),
    utilitiesIncl: z.boolean().default(false),
    wifiIncl: z.boolean().default(false),
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
 * (the OTP-verified session email, never a client-supplied value) as part of
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
