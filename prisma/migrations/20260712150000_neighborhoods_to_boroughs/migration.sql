-- Replace fine-grained NYC neighborhoods with the five boroughs.
-- Postgres can't drop enum labels in-place, so recreate the type.

CREATE TYPE "Neighborhood_new" AS ENUM (
  'Manhattan',
  'Brooklyn',
  'Queens',
  'TheBronx',
  'StatenIsland',
  'Other'
);

ALTER TABLE "Listing" ADD COLUMN "neighborhood_new" "Neighborhood_new";

UPDATE "Listing" SET "neighborhood_new" = CASE "neighborhood"::text
  -- Manhattan
  WHEN 'GreenwichVillage' THEN 'Manhattan'::"Neighborhood_new"
  WHEN 'EastVillage' THEN 'Manhattan'::"Neighborhood_new"
  WHEN 'WestVillage' THEN 'Manhattan'::"Neighborhood_new"
  WHEN 'Soho' THEN 'Manhattan'::"Neighborhood_new"
  WHEN 'Noho' THEN 'Manhattan'::"Neighborhood_new"
  WHEN 'Nolita' THEN 'Manhattan'::"Neighborhood_new"
  WHEN 'LittleItaly' THEN 'Manhattan'::"Neighborhood_new"
  WHEN 'Tribeca' THEN 'Manhattan'::"Neighborhood_new"
  WHEN 'FinancialDistrict' THEN 'Manhattan'::"Neighborhood_new"
  WHEN 'BatteryParkCity' THEN 'Manhattan'::"Neighborhood_new"
  WHEN 'UnionSquare' THEN 'Manhattan'::"Neighborhood_new"
  WHEN 'Gramercy' THEN 'Manhattan'::"Neighborhood_new"
  WHEN 'Flatiron' THEN 'Manhattan'::"Neighborhood_new"
  WHEN 'Chelsea' THEN 'Manhattan'::"Neighborhood_new"
  WHEN 'HellKitchen' THEN 'Manhattan'::"Neighborhood_new"
  WHEN 'MidtownEast' THEN 'Manhattan'::"Neighborhood_new"
  WHEN 'MidtownWest' THEN 'Manhattan'::"Neighborhood_new"
  WHEN 'LowerEastSide' THEN 'Manhattan'::"Neighborhood_new"
  WHEN 'Chinatown' THEN 'Manhattan'::"Neighborhood_new"
  WHEN 'MurrayHill' THEN 'Manhattan'::"Neighborhood_new"
  WHEN 'KipsBay' THEN 'Manhattan'::"Neighborhood_new"
  WHEN 'UpperEastSide' THEN 'Manhattan'::"Neighborhood_new"
  WHEN 'UpperWestSide' THEN 'Manhattan'::"Neighborhood_new"
  WHEN 'Harlem' THEN 'Manhattan'::"Neighborhood_new"
  -- Brooklyn
  WHEN 'BrooklynHeights' THEN 'Brooklyn'::"Neighborhood_new"
  WHEN 'Dumbo' THEN 'Brooklyn'::"Neighborhood_new"
  WHEN 'DowntownBrooklyn' THEN 'Brooklyn'::"Neighborhood_new"
  WHEN 'BoerumHill' THEN 'Brooklyn'::"Neighborhood_new"
  WHEN 'CobbleHill' THEN 'Brooklyn'::"Neighborhood_new"
  WHEN 'CarrollGardens' THEN 'Brooklyn'::"Neighborhood_new"
  WHEN 'ParkSlope' THEN 'Brooklyn'::"Neighborhood_new"
  WHEN 'ProspectHeights' THEN 'Brooklyn'::"Neighborhood_new"
  WHEN 'BedfordStuyvesant' THEN 'Brooklyn'::"Neighborhood_new"
  WHEN 'CrownHeights' THEN 'Brooklyn'::"Neighborhood_new"
  WHEN 'Bushwick' THEN 'Brooklyn'::"Neighborhood_new"
  WHEN 'Williamsburg' THEN 'Brooklyn'::"Neighborhood_new"
  WHEN 'Greenpoint' THEN 'Brooklyn'::"Neighborhood_new"
  WHEN 'FortGreene' THEN 'Brooklyn'::"Neighborhood_new"
  WHEN 'ClintonHill' THEN 'Brooklyn'::"Neighborhood_new"
  WHEN 'Gowanus' THEN 'Brooklyn'::"Neighborhood_new"
  WHEN 'RedHook' THEN 'Brooklyn'::"Neighborhood_new"
  -- Queens
  WHEN 'Astoria' THEN 'Queens'::"Neighborhood_new"
  WHEN 'LongIslandCity' THEN 'Queens'::"Neighborhood_new"
  WHEN 'Sunnyside' THEN 'Queens'::"Neighborhood_new"
  WHEN 'Ridgewood' THEN 'Queens'::"Neighborhood_new"
  -- Already borough-named if any were added early (no-op safety)
  WHEN 'Manhattan' THEN 'Manhattan'::"Neighborhood_new"
  WHEN 'Brooklyn' THEN 'Brooklyn'::"Neighborhood_new"
  WHEN 'Queens' THEN 'Queens'::"Neighborhood_new"
  WHEN 'TheBronx' THEN 'TheBronx'::"Neighborhood_new"
  WHEN 'StatenIsland' THEN 'StatenIsland'::"Neighborhood_new"
  -- NJ / unknown → Other
  ELSE 'Other'::"Neighborhood_new"
END;

ALTER TABLE "Listing" ALTER COLUMN "neighborhood_new" SET NOT NULL;
ALTER TABLE "Listing" DROP COLUMN "neighborhood";
ALTER TABLE "Listing" RENAME COLUMN "neighborhood_new" TO "neighborhood";

DROP TYPE "Neighborhood";
ALTER TYPE "Neighborhood_new" RENAME TO "Neighborhood";
