-- Adds a self-reported distance-from-campus field (paired with the existing
-- `campus` enum, so "which area" and "how far" are both filterable) and an
-- optional lease end date (null = open-ended/new lease).
ALTER TABLE "Listing" ADD COLUMN "distanceFromCampusMiles" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Listing" ADD COLUMN "leaseEndDate" TIMESTAMP(3);
