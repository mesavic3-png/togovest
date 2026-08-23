-- Extend transaction types
ALTER TYPE "TransactionType" ADD VALUE IF NOT EXISTS 'SHORT_TERM';

-- Booking lifecycle
DO $$ BEGIN
  CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELED', 'COMPLETED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Short-term rental pricing and stay rules
ALTER TABLE "Property"
  ADD COLUMN IF NOT EXISTS "nightlyPrice" DECIMAL(18,2),
  ADD COLUMN IF NOT EXISTS "weeklyPrice" DECIMAL(18,2),
  ADD COLUMN IF NOT EXISTS "monthlyPrice" DECIMAL(18,2),
  ADD COLUMN IF NOT EXISTS "cleaningFee" DECIMAL(18,2),
  ADD COLUMN IF NOT EXISTS "securityDeposit" DECIMAL(18,2),
  ADD COLUMN IF NOT EXISTS "minNights" INTEGER,
  ADD COLUMN IF NOT EXISTS "maxGuests" INTEGER,
  ADD COLUMN IF NOT EXISTS "checkInTime" TEXT,
  ADD COLUMN IF NOT EXISTS "checkOutTime" TEXT;

CREATE TABLE IF NOT EXISTS "Booking" (
  "id" TEXT NOT NULL,
  "propertyId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "checkIn" TIMESTAMP(3) NOT NULL,
  "checkOut" TIMESTAMP(3) NOT NULL,
  "guests" INTEGER NOT NULL,
  "nights" INTEGER NOT NULL,
  "totalAmount" DECIMAL(18,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'XOF',
  "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
  "guestName" TEXT,
  "guestPhone" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Booking_propertyId_checkIn_checkOut_idx" ON "Booking"("propertyId", "checkIn", "checkOut");
CREATE INDEX IF NOT EXISTS "Booking_userId_createdAt_idx" ON "Booking"("userId", "createdAt");

DO $$ BEGIN
  ALTER TABLE "Booking" ADD CONSTRAINT "Booking_propertyId_fkey"
    FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
