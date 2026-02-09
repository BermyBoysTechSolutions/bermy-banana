-- Down migration for 0008_add_persistence_and_reference_images.sql

-- Drop indexes
DROP INDEX IF EXISTS "output_asset_is_removed_idx";
DROP INDEX IF EXISTS "output_asset_persist_until_idx";
DROP INDEX IF EXISTS "output_asset_created_at_idx";
DROP INDEX IF EXISTS "reference_images_is_avatar_idx";
DROP INDEX IF EXISTS "reference_images_output_id_idx";
DROP INDEX IF EXISTS "reference_images_user_id_idx";

-- Drop foreign key constraints
ALTER TABLE "reference_images" DROP CONSTRAINT IF EXISTS "reference_images_output_id_output_asset_id_fk";
ALTER TABLE "reference_images" DROP CONSTRAINT IF EXISTS "reference_images_user_id_user_id_fk";

-- Drop table
DROP TABLE IF EXISTS "reference_images";

-- Remove columns from output_asset
ALTER TABLE "output_asset" DROP COLUMN IF EXISTS "is_removed";
ALTER TABLE "output_asset" DROP COLUMN IF EXISTS "persist_until";