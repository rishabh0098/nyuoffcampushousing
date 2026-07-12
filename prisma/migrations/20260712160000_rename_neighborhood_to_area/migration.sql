-- Rename Neighborhood → Area (enum type + Listing column).
ALTER TYPE "Neighborhood" RENAME TO "Area";
ALTER TABLE "Listing" RENAME COLUMN "neighborhood" TO "area";
