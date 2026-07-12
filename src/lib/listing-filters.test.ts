import { describe, expect, it } from "vitest";
import { buildListingWhereClause, parseListingFilters } from "./listing-filters";

describe("buildListingWhereClause", () => {
  it("always scopes to Active listings (R8)", () => {
    const where = buildListingWhereClause({});
    expect(where.status).toBe("Active");
  });

  it("applies a rent range filter", () => {
    const where = buildListingWhereClause({ minRentCents: 100000, maxRentCents: 200000 });
    expect(where.rentCents).toEqual({ gte: 100000, lte: 200000 });
  });

  it("applies campus, bedrooms, and lease type filters", () => {
    const where = buildListingWhereClause({
      campus: "Brooklyn",
      minBedrooms: 2,
      leaseType: "Sublet",
    });
    expect(where.campus).toBe("Brooklyn");
    expect(where.bedrooms).toEqual({ gte: 2 });
    expect(where.leaseType).toBe("Sublet");
  });

  it("applies boolean filters only when explicitly requested", () => {
    const withVeg = buildListingWhereClause({ vegPreferred: true });
    expect(withVeg.vegPreferred).toBe(true);

    const withoutVeg = buildListingWhereClause({});
    expect(withoutVeg.vegPreferred).toBeUndefined();
  });

  it("applies a move-in-by filter", () => {
    const where = buildListingWhereClause({ moveInBy: new Date("2026-09-01") });
    expect(where.moveInDate).toEqual({ lte: new Date("2026-09-01") });
  });

  it("applies a max-distance-from-campus filter", () => {
    const where = buildListingWhereClause({ campus: "Tandon", maxDistanceMiles: 2 });
    expect(where.campus).toBe("Tandon");
    expect(where.distanceFromCampusMiles).toEqual({ lte: 2 });
  });

  it("applies a lease-must-run-until filter, treating open-ended leases as satisfying it", () => {
    const where = buildListingWhereClause({ leaseEndAfter: new Date("2026-12-01") });
    expect(where.OR).toEqual([
      { leaseEndDate: null },
      { leaseEndDate: { gte: new Date("2026-12-01") } },
    ]);
  });

  it("applies gender preference and guarantor/utilities/wifi/ac/private-bathroom/laundry filters", () => {
    const where = buildListingWhereClause({
      genderPref: "FemaleOnly",
      guarantorReq: false,
      utilitiesIncl: true,
      wifiIncl: true,
      acIncl: true,
      privateBathroom: true,
      laundryIncl: true,
    });
    expect(where.genderPref).toBe("FemaleOnly");
    expect(where.guarantorReq).toBe(false);
    expect(where.utilitiesIncl).toBe(true);
    expect(where.wifiIncl).toBe(true);
    expect(where.acIncl).toBe(true);
    expect(where.privateBathroom).toBe(true);
    expect(where.laundryIncl).toBe(true);
  });

  it("applies a minimum-bathrooms and furnished-status filter", () => {
    const where = buildListingWhereClause({ minBathrooms: 1.5, furnishedStatus: "Furnished" });
    expect(where.bathrooms).toEqual({ gte: 1.5 });
    expect(where.furnishedStatus).toBe("Furnished");
  });

  it("applies an exact area filter", () => {
    const where = buildListingWhereClause({ neighborhood: "Manhattan" });
    expect(where.neighborhood).toBe("Manhattan");
  });

  it("combines all provided filters with AND semantics (all must match)", () => {
    const where = buildListingWhereClause({
      minRentCents: 100000,
      campus: "WashingtonSquare",
      vegPreferred: true,
      genderPref: "NoPreference",
    });
    expect(where).toMatchObject({
      status: "Active",
      rentCents: { gte: 100000 },
      campus: "WashingtonSquare",
      vegPreferred: true,
      genderPref: "NoPreference",
    });
  });
});

describe("parseListingFilters", () => {
  it("parses filters from URLSearchParams, ignoring unknown/empty values", () => {
    const params = new URLSearchParams({
      minRentCents: "50000",
      campus: "Brooklyn",
      vegPreferred: "true",
      unknownParam: "x",
    });
    const filters = parseListingFilters(params);
    expect(filters).toEqual({
      minRentCents: 50000,
      campus: "Brooklyn",
      vegPreferred: true,
    });
  });

  it("parses the distance and lease-end filters", () => {
    const params = new URLSearchParams({
      maxDistanceMiles: "1.5",
      leaseEndAfter: "2026-12-01",
    });
    const filters = parseListingFilters(params);
    expect(filters.maxDistanceMiles).toBe(1.5);
    expect(filters.leaseEndAfter).toEqual(new Date("2026-12-01"));
  });

  it("parses bathrooms, furnished status, ac, private-bathroom, and laundry filters", () => {
    const params = new URLSearchParams({
      minBathrooms: "1.5",
      furnishedStatus: "Furnished",
      acIncl: "true",
      privateBathroom: "true",
      laundryIncl: "true",
    });
    const filters = parseListingFilters(params);
    expect(filters.minBathrooms).toBe(1.5);
    expect(filters.furnishedStatus).toBe("Furnished");
    expect(filters.acIncl).toBe(true);
    expect(filters.privateBathroom).toBe(true);
    expect(filters.laundryIncl).toBe(true);
  });

  it("returns an empty object for no params", () => {
    expect(parseListingFilters(new URLSearchParams())).toEqual({});
  });
});
