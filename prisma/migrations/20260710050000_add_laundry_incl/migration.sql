-- AlterTable — new "in-unit laundry" filter dimension, same shape as the
-- existing acIncl/privateBathroom boolean amenity flags.
ALTER TABLE "Listing" ADD COLUMN "laundryIncl" BOOLEAN NOT NULL DEFAULT false;
