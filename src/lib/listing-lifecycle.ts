import "server-only";
import { ACTIVE_LISTING_EXPIRY_DAYS, INACTIVE_LISTING_DELETION_DAYS } from "./constants";
import { withServiceRls } from "./rls";

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
 * and permanently delete long-Inactive listings. Runs under service RLS.
 */
export async function runListingLifecycleJob(now: Date = new Date()): Promise<LifecycleRunResult> {
  return withServiceRls(async (tx) => {
    const expireCutoff = new Date(now.getTime() - ACTIVE_LISTING_EXPIRY_DAYS * DAY_MS);
    const expired = await tx.listing.updateMany({
      where: { status: "Active", activatedAt: { lt: expireCutoff } },
      data: { status: "Inactive", inactivatedAt: now },
    });

    const deleteCutoff = new Date(now.getTime() - INACTIVE_LISTING_DELETION_DAYS * DAY_MS);
    const deleted = await tx.listing.deleteMany({
      where: { status: "Inactive", inactivatedAt: { lt: deleteCutoff } },
    });

    return { expiredCount: expired.count, deletedCount: deleted.count };
  });
}
