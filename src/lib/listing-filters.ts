import type { Prisma, Campus, GenderPreference, LeaseType } from "@prisma/client";

export type ListingFilters = {
  minRentCents?: number;
  maxRentCents?: number;
  neighborhood?: string;
  campus?: Campus;
  minBedrooms?: number;
  moveInBy?: Date;
  leaseType?: LeaseType;
  guarantorReq?: boolean;
  utilitiesIncl?: boolean;
  wifiIncl?: boolean;
  vegPreferred?: boolean;
  genderPref?: GenderPreference;
};

/**
 * R7 — every provided filter is AND-ed together against Active listings
 * only (R8). Pure function so the AND-combination logic (the part most
 * likely to regress silently) is unit-testable without a database.
 */
export function buildListingWhereClause(filters: ListingFilters): Prisma.ListingWhereInput {
  const where: Prisma.ListingWhereInput = { status: "Active" };

  if (filters.minRentCents !== undefined || filters.maxRentCents !== undefined) {
    where.rentCents = {
      ...(filters.minRentCents !== undefined ? { gte: filters.minRentCents } : {}),
      ...(filters.maxRentCents !== undefined ? { lte: filters.maxRentCents } : {}),
    };
  }
  if (filters.neighborhood) {
    where.neighborhood = { contains: filters.neighborhood, mode: "insensitive" };
  }
  if (filters.campus) {
    where.campus = filters.campus;
  }
  if (filters.minBedrooms !== undefined) {
    where.bedrooms = { gte: filters.minBedrooms };
  }
  if (filters.moveInBy) {
    where.moveInDate = { lte: filters.moveInBy };
  }
  if (filters.leaseType) {
    where.leaseType = filters.leaseType;
  }
  if (filters.guarantorReq !== undefined) {
    where.guarantorReq = filters.guarantorReq;
  }
  if (filters.utilitiesIncl !== undefined) {
    where.utilitiesIncl = filters.utilitiesIncl;
  }
  if (filters.wifiIncl !== undefined) {
    where.wifiIncl = filters.wifiIncl;
  }
  if (filters.vegPreferred !== undefined) {
    where.vegPreferred = filters.vegPreferred;
  }
  if (filters.genderPref) {
    where.genderPref = filters.genderPref;
  }

  return where;
}

const BOOLEAN_KEYS = [
  "guarantorReq",
  "utilitiesIncl",
  "wifiIncl",
  "vegPreferred",
] as const satisfies readonly (keyof ListingFilters)[];

/** Parses the R7 filter set out of a query-string, ignoring anything unrecognized. */
export function parseListingFilters(params: URLSearchParams): ListingFilters {
  const filters: ListingFilters = {};

  const minRentCents = params.get("minRentCents");
  if (minRentCents) filters.minRentCents = Number(minRentCents);

  const maxRentCents = params.get("maxRentCents");
  if (maxRentCents) filters.maxRentCents = Number(maxRentCents);

  const neighborhood = params.get("neighborhood");
  if (neighborhood) filters.neighborhood = neighborhood;

  const campus = params.get("campus");
  if (campus) filters.campus = campus as Campus;

  const minBedrooms = params.get("minBedrooms");
  if (minBedrooms) filters.minBedrooms = Number(minBedrooms);

  const moveInBy = params.get("moveInBy");
  if (moveInBy) filters.moveInBy = new Date(moveInBy);

  const leaseType = params.get("leaseType");
  if (leaseType) filters.leaseType = leaseType as LeaseType;

  const genderPref = params.get("genderPref");
  if (genderPref) filters.genderPref = genderPref as GenderPreference;

  for (const key of BOOLEAN_KEYS) {
    const value = params.get(key);
    if (value !== null) filters[key] = value === "true";
  }

  return filters;
}
