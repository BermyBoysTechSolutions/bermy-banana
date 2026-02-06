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

-- Insert 50 unique promo codes (BERMY001 - BERM050) for social media launch promotion
-- Each code can only be used once to prevent abuse
INSERT INTO "promo_code" ("code", "credits", "max_uses", "description", "is_active")
VALUES 
    ('BERMY01', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY02', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY03', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY04', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY05', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY06', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY07', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY08', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY09', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY10', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY11', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY12', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY13', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY14', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY15', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY16', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY17', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY18', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY19', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY20', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY21', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY22', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY23', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY24', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY25', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY26', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY27', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY28', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY29', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY30', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY31', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY32', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY33', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY34', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY35', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY36', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY37', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY38', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY39', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY40', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY41', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY42', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY43', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY44', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY45', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY46', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY47', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY48', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY49', 500, 1, 'Launch promotion - social media exclusive', true),
    ('BERMY50', 500, 1, 'Launch promotion - social media exclusive', true)
ON CONFLICT ("code") DO NOTHING;