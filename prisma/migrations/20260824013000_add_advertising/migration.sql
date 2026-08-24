DO $$ BEGIN
  CREATE TYPE "AdvertisementPlacement" AS ENUM ('HOME_BANNER', 'SEARCH_INLINE', 'PREMIUM');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "AdvertisementStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'ENDED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "AdvertisingRequestStatus" AS ENUM ('NEW', 'CONTACTED', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "Advertisement" (
  "id" TEXT NOT NULL,
  "advertiserName" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "imageUrl" TEXT,
  "destinationUrl" TEXT NOT NULL,
  "placement" "AdvertisementPlacement" NOT NULL,
  "status" "AdvertisementStatus" NOT NULL DEFAULT 'DRAFT',
  "startsAt" TIMESTAMP(3),
  "endsAt" TIMESTAMP(3),
  "impressions" INTEGER NOT NULL DEFAULT 0,
  "clicks" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Advertisement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AdvertisingRequest" (
  "id" TEXT NOT NULL,
  "companyName" TEXT NOT NULL,
  "contactName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "website" TEXT,
  "placement" "AdvertisementPlacement" NOT NULL,
  "durationWeeks" INTEGER NOT NULL DEFAULT 1,
  "message" TEXT,
  "status" "AdvertisingRequestStatus" NOT NULL DEFAULT 'NEW',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AdvertisingRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Advertisement_placement_status_startsAt_endsAt_idx" ON "Advertisement"("placement", "status", "startsAt", "endsAt");
CREATE INDEX IF NOT EXISTS "AdvertisingRequest_status_createdAt_idx" ON "AdvertisingRequest"("status", "createdAt");
