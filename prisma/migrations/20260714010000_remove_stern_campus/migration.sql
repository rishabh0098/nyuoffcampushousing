-- Remap any Stern listings to Other, then rebuild Campus without Stern.
-- Postgres cannot DROP an enum value in-place.

UPDATE "Listing" SET "campus" = 'Other' WHERE "campus" = 'Stern';

CREATE TYPE "Campus_new" AS ENUM (
  'WashingtonSquare',
  'Brooklyn',
  'Tandon',
  'UnionSquare',
  'UpperEastSide',
  'Other'
);

ALTER TABLE "Listing"
  ALTER COLUMN "campus" TYPE "Campus_new"
  USING ("campus"::text::"Campus_new");

DROP TYPE "Campus";
ALTER TYPE "Campus_new" RENAME TO "Campus";
