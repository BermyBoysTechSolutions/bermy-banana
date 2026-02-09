# Database Schema Changes for Bermy Banana Persistence Features

## Summary of Changes

This migration implements persistence features for the Bermy Banana application on the feature/tier-based-access branch.

### 1. Output Asset Table Updates
Added persistence columns to the `output_asset` table:
- `persist_until` TIMESTAMP - Optional field to set when an output should be automatically removed
- `is_removed` BOOLEAN DEFAULT FALSE - Flag to mark outputs as removed/soft-deleted
- `created_at` index - Index for efficient querying of recent outputs

### 2. New Reference Images Table
Created `reference_images` table with the following structure:
- `id` UUID PRIMARY KEY - Unique identifier
- `user_id` UUID REFERENCES users(id) - Links to the user who owns this reference
- `output_id` UUID REFERENCES outputs(id) - Links to the output this references
- `image_url` TEXT NOT NULL - URL to the reference image
- `created_at` TIMESTAMP DEFAULT NOW() - Creation timestamp
- `is_avatar` BOOLEAN DEFAULT FALSE - Flag to indicate if this is an avatar reference

### 3. Indexes Created
For performance optimization:
- `output_asset_created_at_idx` - For querying recent outputs
- `output_asset_persist_until_idx` - For finding expired outputs
- `output_asset_is_removed_idx` - For filtering removed outputs
- `reference_images_user_id_idx` - For user-specific queries
- `reference_images_output_id_idx` - For output-specific queries
- `reference_images_is_avatar_idx` - For avatar-specific queries

### 4. Migration Files
- **Up Migration**: `drizzle/migrations/0008_add_persistence_and_reference_images.sql`
- **Down Migration**: `drizzle/migrations/0008_add_persistence_and_reference_images_down.sql`

### 5. Schema Updates
Updated `src/lib/schema.ts` with:
- New columns in the `outputAsset` table definition
- New `referenceImages` table definition
- Updated relations for both tables
- Added TypeScript type exports

## Implementation Notes
- All migrations are reversible using the provided down migration
- Foreign key constraints ensure data integrity
- Indexes are strategically placed for common query patterns
- The schema follows the existing project conventions using Drizzle ORM