CREATE TABLE "promo_code" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"credits" integer NOT NULL,
	"max_uses" integer NOT NULL,
	"used_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "promo_code_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "redeemed_promo_code" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"promo_code_id" uuid NOT NULL,
	"redeemed_at" timestamp DEFAULT now() NOT NULL,
	"credits_awarded" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reference_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"output_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_avatar" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "output_asset" ADD COLUMN "persist_until" timestamp;--> statement-breakpoint
ALTER TABLE "output_asset" ADD COLUMN "is_removed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "subscription_tier" text DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "subscription_status" text DEFAULT 'inactive' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "credits_remaining" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "credits_total" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "polar_customer_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "polar_subscription_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "admin_tier" text;--> statement-breakpoint
ALTER TABLE "redeemed_promo_code" ADD CONSTRAINT "redeemed_promo_code_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redeemed_promo_code" ADD CONSTRAINT "redeemed_promo_code_promo_code_id_promo_code_id_fk" FOREIGN KEY ("promo_code_id") REFERENCES "public"."promo_code"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reference_images" ADD CONSTRAINT "reference_images_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reference_images" ADD CONSTRAINT "reference_images_output_id_output_asset_id_fk" FOREIGN KEY ("output_id") REFERENCES "public"."output_asset"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "promo_code_code_idx" ON "promo_code" USING btree ("code");--> statement-breakpoint
CREATE INDEX "redeemed_promo_user_idx" ON "redeemed_promo_code" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "redeemed_promo_code_idx" ON "redeemed_promo_code" USING btree ("promo_code_id");--> statement-breakpoint
CREATE INDEX "reference_images_user_id_idx" ON "reference_images" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reference_images_output_id_idx" ON "reference_images" USING btree ("output_id");--> statement-breakpoint
CREATE INDEX "reference_images_is_avatar_idx" ON "reference_images" USING btree ("is_avatar");--> statement-breakpoint
CREATE INDEX "output_asset_created_at_idx" ON "output_asset" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "output_asset_persist_until_idx" ON "output_asset" USING btree ("persist_until");--> statement-breakpoint
CREATE INDEX "output_asset_is_removed_idx" ON "output_asset" USING btree ("is_removed");