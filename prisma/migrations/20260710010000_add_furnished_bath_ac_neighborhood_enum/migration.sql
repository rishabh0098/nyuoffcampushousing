-- CreateEnum
CREATE TYPE "FurnishedStatus" AS ENUM ('Furnished', 'PartiallyFurnished', 'Unfurnished');

-- CreateEnum
CREATE TYPE "Neighborhood" AS ENUM (
  'GreenwichVillage', 'EastVillage', 'WestVillage', 'Soho', 'Noho', 'UnionSquare',
  'Gramercy', 'Chelsea', 'LowerEastSide', 'Chinatown', 'MurrayHill', 'KipsBay',
  'UpperEastSide', 'BrooklynHeights', 'Dumbo', 'DowntownBrooklyn', 'Williamsburg',
  'Bushwick', 'FortGreene', 'ClintonHill', 'JerseyCityDowntown', 'JerseyCityHeights',
  'JournalSquare', 'Hoboken', 'Other'
);

-- AlterEnum — new campus option (Stern School of Business).
ALTER TYPE "Campus" ADD VALUE IF NOT EXISTS 'Stern';

-- AlterTable — new structured attributes.
ALTER TABLE "Listing" ADD COLUMN "bathrooms" DOUBLE PRECISION NOT NULL DEFAULT 1;
ALTER TABLE "Listing" ADD COLUMN "furnishedStatus" "FurnishedStatus" NOT NULL DEFAULT 'Unfurnished';
ALTER TABLE "Listing" ADD COLUMN "acIncl" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Listing" ADD COLUMN "privateBathroom" BOOLEAN NOT NULL DEFAULT false;

-- `neighborhood` moves from free text to the preset enum above (KTD5, same
-- rationale as `campus`). Existing free-text values can't be reliably mapped
-- to the new preset list, so they collapse to 'Other'; posters can re-enter
-- an exact match next time they edit/repost.
ALTER TABLE "Listing" ADD COLUMN "neighborhood_new" "Neighborhood";
UPDATE "Listing" SET "neighborhood_new" = 'Other';
ALTER TABLE "Listing" ALTER COLUMN "neighborhood_new" SET NOT NULL;
ALTER TABLE "Listing" DROP COLUMN "neighborhood";
ALTER TABLE "Listing" RENAME COLUMN "neighborhood_new" TO "neighborhood";
