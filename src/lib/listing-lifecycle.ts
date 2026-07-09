import "server-only";
import { prisma } from "./db";
import { ACTIVE_LISTING_EXPIRY_DAYS, INACTIVE_LISTING_DELETION_DAYS } from "./constants";
import { del } from "@vercel/blob";

const DAY_MS = 24 * 60 * 60 * 1000;

/** R19 — pure threshold check, kept separate from I/O so it's unit-testable. */
export function shouldExpireToInactive(activatedAt: Date, now: Date): boolean {
  return now.getTime() - activatedAt.getTime() > ACTIVE_LISTING_EXPIRY_DAYS * DAY_MS;
}

/** R21 — pure threshold check. A listing with no `inactivatedAt` is still Active. */
export function shouldPermanentlyDelete(inactivatedAt: Date | null, now: Date): boolean {
  if (!inactivatedAt) return false;
  return now.getTime() - inactivatedAt.getTime() > INACTIVE_LISTING_DELETION_DAYS * DAY_MS;
}

export type LifecycleRunResult = {
  expiredCount: number;
  deletedCount: number;
};

/**
 * R19, R21 — daily batch job (KTD4): move stale Active listings to Inactive,
 * and permanently delete long-Inactive listings (including their Blob photos).
 */
export async function runListingLifecycleJob(now: Date = new Date()): Promise<LifecycleRunResult> {
  const expireCutoff = new Date(now.getTime() - ACTIVE_LISTING_EXPIRY_DAYS * DAY_MS);
  const expired = await prisma.listing.updateMany({
    where: { status: "Active", activatedAt: { lt: expireCutoff } },
    data: { status: "Inactive", inactivatedAt: now },
  });

  const deleteCutoff = new Date(now.getTime() - INACTIVE_LISTING_DELETION_DAYS * DAY_MS);
  const toDelete = await prisma.listing.findMany({
    where: { status: "Inactive", inactivatedAt: { lt: deleteCutoff } },
    include: { photos: true },
  });

  for (const listing of toDelete) {
    await Promise.all(
      listing.photos.map((photo) => del(photo.url).catch(() => undefined))
    );
  }

  const deleted = await prisma.listing.deleteMany({
    where: { id: { in: toDelete.map((l) => l.id) } },
  });

  return { expiredCount: expired.count, deletedCount: deleted.count };
}
