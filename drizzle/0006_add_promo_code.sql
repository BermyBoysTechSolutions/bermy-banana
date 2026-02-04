-- Create promo_code table
CREATE TABLE IF NOT EXISTS "promo_code" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "code" text NOT NULL UNIQUE,
    "credits" integer NOT NULL,
    "max_uses" integer NOT NULL,
    "used_count" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "expires_at" timestamp,
    "description" text,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create index on code for fast lookups
CREATE INDEX IF NOT EXISTS "promo_code_code_idx" ON "promo_code" ("code");

-- Create redeemed_promo_code table to track redemptions
CREATE TABLE IF NOT EXISTS "redeemed_promo_code" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "promo_code_id" uuid NOT NULL REFERENCES "promo_code"("id") ON DELETE CASCADE,
    "redeemed_at" timestamp DEFAULT now() NOT NULL,
    "credits_awarded" integer NOT NULL
);

-- Create indexes for redeemed promo codes
CREATE INDEX IF NOT EXISTS "redeemed_promo_user_idx" ON "redeemed_promo_code" ("user_id");
CREATE INDEX IF NOT EXISTS "redeemed_promo_code_idx" ON "redeemed_promo_code" ("promo_code_id");

-- Insert the BERM100 promo code (first 100 users get 500 free credits)
INSERT INTO "promo_code" ("code", "credits", "max_uses", "description", "is_active")
VALUES ('BERMY100', 500, 100, 'Launch promotion - first 100 users', true)
ON CONFLICT ("code") DO NOTHING;