import { z } from "zod";
import type { Prisma } from "@prisma/client";
import {
  Area,
  Campus,
  FurnishedStatus,
  GenderPreference,
  LeaseType,
} from "@prisma/client";

export type ListingFilters = {
  minRentCents?: number;
  maxRentCents?: number;
  area?: Area;
  campus?: Campus;
  maxDistanceMiles?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  furnishedStatus?: FurnishedStatus;
  moveInBy?: Date;
  leaseEndAfter?: Date;
  leaseType?: LeaseType;
  guarantorReq?: boolean;
  utilitiesIncl?: boolean;
  wifiIncl?: boolean;
  acIncl?: boolean;
  privateBathroom?: boolean;
  laundryIncl?: boolean;
  vegPreferred?: boolean;
  genderPref?: GenderPreference;
};

const optionalQueryBoolean = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

/** Zod schema for R7 filter query params — enums validated like ListingInputSchema. */
export const ListingFiltersQuerySchema = z.object({
  minRentCents: z.coerce.number().int().nonnegative().optional(),
  maxRentCents: z.coerce.number().int().nonnegative().optional(),
  area: z.enum(Area).optional(),
  campus: z.enum(Campus).optional(),
  maxDistanceMiles: z.coerce.number().nonnegative().optional(),
  minBedrooms: z.coerce.number().int().nonnegative().optional(),
  minBathrooms: z.coerce.number().nonnegative().optional(),
  furnishedStatus: z.enum(FurnishedStatus).optional(),
  moveInBy: z.coerce.date().optional(),
  leaseEndAfter: z.coerce.date().optional(),
  leaseType: z.enum(LeaseType).optional(),
  guarantorReq: optionalQueryBoolean.optional(),
  utilitiesIncl: optionalQueryBoolean.optional(),
  wifiIncl: optionalQueryBoolean.optional(),
  acIncl: optionalQueryBoolean.optional(),
  privateBathroom: optionalQueryBoolean.optional(),
  laundryIncl: optionalQueryBoolean.optional(),
  vegPreferred: optionalQueryBoolean.optional(),
  genderPref: z.enum(GenderPreference).optional(),
});

const FILTER_QUERY_KEYS = [
  "minRentCents",
  "maxRentCents",
  "area",
  "campus",
  "maxDistanceMiles",
  "minBedrooms",
  "minBathrooms",
  "furnishedStatus",
  "moveInBy",
  "leaseEndAfter",
  "leaseType",
  "guarantorReq",
  "utilitiesIncl",
  "wifiIncl",
  "acIncl",
  "privateBathroom",
  "laundryIncl",
  "vegPreferred",
  "genderPref",
] as const satisfies readonly (keyof ListingFilters)[];

export class ListingFiltersValidationError extends Error {
  readonly issues: z.ZodError["issues"];

  constructor(error: z.ZodError) {
    super("Invalid listing filters.");
    this.issues = error.issues;
  }
}

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
  if (filters.area) {
    where.area = filters.area;
  }
  if (filters.campus) {
    where.campus = filters.campus;
  }
  if (filters.maxDistanceMiles !== undefined) {
    where.distanceFromCampusMiles = { lte: filters.maxDistanceMiles };
  }
  if (filters.minBedrooms !== undefined) {
    where.bedrooms = { gte: filters.minBedrooms };
  }
  if (filters.minBathrooms !== undefined) {
    where.bathrooms = { gte: filters.minBathrooms };
  }
  if (filters.furnishedStatus) {
    where.furnishedStatus = filters.furnishedStatus;
  }
  if (filters.moveInBy) {
    where.moveInDate = { lte: filters.moveInBy };
  }
  if (filters.leaseEndAfter) {
    // A listing with no defined lease end (open-ended/new lease) is treated
    // as satisfying any "must run until at least X" requirement.
    where.OR = [{ leaseEndDate: null }, { leaseEndDate: { gte: filters.leaseEndAfter } }];
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
  if (filters.acIncl !== undefined) {
    where.acIncl = filters.acIncl;
  }
  if (filters.privateBathroom !== undefined) {
    where.privateBathroom = filters.privateBathroom;
  }
  if (filters.laundryIncl !== undefined) {
    where.laundryIncl = filters.laundryIncl;
  }
  if (filters.vegPreferred !== undefined) {
    where.vegPreferred = filters.vegPreferred;
  }
  if (filters.genderPref) {
    where.genderPref = filters.genderPref;
  }

  return where;
}

/**
 * Parses the R7 filter set out of a query-string, ignoring unrecognized keys.
 * Invalid enum/number values throw ListingFiltersValidationError (map to 400).
 */
export function parseListingFilters(params: URLSearchParams): ListingFilters {
  const raw: Record<string, string> = {};
  for (const key of FILTER_QUERY_KEYS) {
    const value = params.get(key);
    if (value !== null && value !== "") {
      raw[key] = value;
    }
  }

  const parsed = ListingFiltersQuerySchema.safeParse(raw);
  if (!parsed.success) {
    throw new ListingFiltersValidationError(parsed.error);
  }
  return parsed.data;
}
