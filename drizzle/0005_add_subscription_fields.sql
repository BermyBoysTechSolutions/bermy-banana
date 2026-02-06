-- Add subscription and credit fields to user table
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "subscription_tier" text DEFAULT 'free' NOT NULL;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "subscription_status" text DEFAULT 'inactive' NOT NULL;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "credits_remaining" integer DEFAULT 0 NOT NULL;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "credits_total" integer DEFAULT 0 NOT NULL;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "polar_customer_id" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "polar_subscription_id" text;

-- Create index for subscription lookups
CREATE INDEX IF NOT EXISTS "user_polar_customer_idx" ON "user" ("polar_customer_id");
CREATE INDEX IF NOT EXISTS "user_subscription_status_idx" ON "user" ("subscription_status");
