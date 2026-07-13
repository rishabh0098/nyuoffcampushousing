-- Replace Vercel Blob photo rows with a single cloud media link on Listing.
-- Enable Row Level Security with session GUCs (app.current_user_email / app.is_service).

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN "mediaLink" TEXT;

-- DropTable
DROP TABLE IF EXISTS "ListingPhoto";

-- ---------------------------------------------------------------------------
-- RLS helpers (transaction-local GUCs via set_config(..., true) from Prisma)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION app_current_user_email() RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.current_user_email', true), '');
$$;

CREATE OR REPLACE FUNCTION app_is_service() RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(current_setting('app.is_service', true), '') = 'on';
$$;

ALTER TABLE "Listing" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Listing" FORCE ROW LEVEL SECURITY;

-- Active listings are readable without a user GUC (browse/search/compare).
-- Own rows (any status) require app.current_user_email. Cron uses app.is_service.
DROP POLICY IF EXISTS listing_select ON "Listing";
CREATE POLICY listing_select ON "Listing"
  FOR SELECT
  USING (
    app_is_service()
    OR status = 'Active'
    OR "posterEmail" = app_current_user_email()
  );

DROP POLICY IF EXISTS listing_insert ON "Listing";
CREATE POLICY listing_insert ON "Listing"
  FOR INSERT
  WITH CHECK (
    app_is_service()
    OR "posterEmail" = app_current_user_email()
  );

DROP POLICY IF EXISTS listing_update ON "Listing";
CREATE POLICY listing_update ON "Listing"
  FOR UPDATE
  USING (
    app_is_service()
    OR "posterEmail" = app_current_user_email()
  )
  WITH CHECK (
    app_is_service()
    OR "posterEmail" = app_current_user_email()
  );

DROP POLICY IF EXISTS listing_delete ON "Listing";
CREATE POLICY listing_delete ON "Listing"
  FOR DELETE
  USING (
    app_is_service()
    OR "posterEmail" = app_current_user_email()
  );
