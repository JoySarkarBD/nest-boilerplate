-- Migration: add_phone_unique_sms_queue
-- 
-- Changes:
--   1. Add UNIQUE constraint on "User"."phone" — phone numbers are login
--      identifiers (email XOR phone) and must be globally unique.
--   2. Add a B-tree index on "phone" for fast single-column lookups used by
--      phone-based auth flows (login, OTP verification, password reset).
--
-- The column already exists (from migration 20260504053451_user); only the
-- constraint and index are new.

-- 1. Unique constraint (also creates an implicit unique index in PostgreSQL)
ALTER TABLE "User"
  ADD CONSTRAINT "User_phone_key" UNIQUE ("phone");

-- 2. Explicit named index for query planning clarity
CREATE INDEX IF NOT EXISTS "User_phone_idx" ON "User" ("phone");
