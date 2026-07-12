import { describe, expect, it } from "vitest";
import { shouldExpireToInactive, shouldPermanentlyDelete } from "./listing-lifecycle";

const now = new Date("2026-01-16T00:00:00Z");
const DAY_MS = 24 * 60 * 60 * 1000;

describe("shouldExpireToInactive (R19)", () => {
  it("expires a listing activated exactly 16 days ago", () => {
    const activatedAt = new Date(now.getTime() - 16 * DAY_MS);
    expect(shouldExpireToInactive(activatedAt, now)).toBe(true);
  });

  it("does not expire a listing activated 14 days ago (reactivated recently, R20)", () => {
    const activatedAt = new Date(now.getTime() - 14 * DAY_MS);
    expect(shouldExpireToInactive(activatedAt, now)).toBe(false);
  });

  it("does not expire a listing exactly at the 15-day boundary", () => {
    const activatedAt = new Date(now.getTime() - 15 * DAY_MS);
    expect(shouldExpireToInactive(activatedAt, now)).toBe(false);
  });

  it("expires a listing just past the 15-day boundary", () => {
    const activatedAt = new Date(now.getTime() - 15 * DAY_MS - 1000);
    expect(shouldExpireToInactive(activatedAt, now)).toBe(true);
  });
});

describe("shouldPermanentlyDelete (R21)", () => {
  it("deletes a listing inactivated 2 months and 1 day ago", () => {
    const inactivatedAt = new Date(now.getTime() - 61 * DAY_MS);
    expect(shouldPermanentlyDelete(inactivatedAt, now)).toBe(true);
  });

  it("does not delete a listing inactivated within the 2-month window", () => {
    const inactivatedAt = new Date(now.getTime() - 59 * DAY_MS);
    expect(shouldPermanentlyDelete(inactivatedAt, now)).toBe(false);
  });

  it("returns false for a listing with no inactivatedAt (still Active)", () => {
    expect(shouldPermanentlyDelete(null, now)).toBe(false);
  });
});
