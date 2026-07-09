-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('Active', 'Inactive');

-- CreateEnum
CREATE TYPE "GenderPreference" AS ENUM ('NoPreference', 'FemaleOnly', 'MaleOnly');

-- CreateEnum
CREATE TYPE "LeaseType" AS ENUM ('NewLease', 'LeaseTakeover', 'Sublet');

-- CreateEnum
CREATE TYPE "Campus" AS ENUM ('WashingtonSquare', 'Brooklyn', 'Tandon', 'UnionSquare', 'UpperEastSide', 'Other');

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "posterEmail" TEXT NOT NULL,
    "status" "ListingStatus" NOT NULL DEFAULT 'Active',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rentCents" INTEGER NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "campus" "Campus" NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "moveInDate" TIMESTAMP(3) NOT NULL,
    "leaseType" "LeaseType" NOT NULL,
    "guarantorReq" BOOLEAN NOT NULL DEFAULT false,
    "utilitiesIncl" BOOLEAN NOT NULL DEFAULT false,
    "wifiIncl" BOOLEAN NOT NULL DEFAULT false,
    "vegPreferred" BOOLEAN NOT NULL DEFAULT false,
    "genderPref" "GenderPreference" NOT NULL DEFAULT 'NoPreference',
    "contactWhatsapp" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inactivatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingPhoto" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpCode" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Listing_status_idx" ON "Listing"("status");

-- CreateIndex
CREATE INDEX "Listing_posterEmail_idx" ON "Listing"("posterEmail");

-- CreateIndex
CREATE INDEX "Listing_status_activatedAt_idx" ON "Listing"("status", "activatedAt");

-- CreateIndex
CREATE INDEX "Listing_status_inactivatedAt_idx" ON "Listing"("status", "inactivatedAt");

-- CreateIndex
CREATE INDEX "ListingPhoto_listingId_idx" ON "ListingPhoto"("listingId");

-- CreateIndex
CREATE INDEX "OtpCode_email_idx" ON "OtpCode"("email");

-- CreateIndex
CREATE INDEX "OtpCode_email_createdAt_idx" ON "OtpCode"("email", "createdAt");

-- AddForeignKey
ALTER TABLE "ListingPhoto" ADD CONSTRAINT "ListingPhoto_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
