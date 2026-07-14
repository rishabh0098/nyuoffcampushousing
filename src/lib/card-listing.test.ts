import { describe, expect, it } from "vitest";
import { normalizeCardListings, readCachedCardListings } from "./card-listing";

describe("normalizeCardListings", () => {
  it("fills in missing photos from legacy cached rows", () => {
    const rows = normalizeCardListings([
      {
        id: "abc",
        title: "Room near Washington Square",
        rentCents: 250000,
        campus: "WashingtonSquare",
        distanceFromCampusMiles: 0.5,
        bedrooms: 1,
        bathrooms: 1,
        furnishedStatus: "Furnished",
        vegPreferred: false,
        mediaLink: "https://example.com/photos",
      },
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0]?.photos).toEqual([]);
  });

  it("rejects non-array cache payloads", () => {
    expect(readCachedCardListings(null)).toBeNull();
    expect(readCachedCardListings({ listings: [] })).toBeNull();
  });

  it("accepts valid empty cache arrays", () => {
    expect(readCachedCardListings([])).toEqual([]);
  });
});
