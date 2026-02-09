# Bermy Banana Persistence Features API

This document describes the backend APIs implemented for the Bermy Banana persistence features on the `feature/tier-based-access` branch.

## Overview

The persistence features allow users to:
- Mark outputs as persistent with optional expiry dates
- Soft delete outputs instead of hard deletion
- Save image outputs as avatars/reference images
- Manage their reference images
- View dashboard analytics (admin only)

## API Endpoints

### 1. Persistence APIs

#### POST `/api/outputs/persist`
Mark an output as persistent.

**Request Body:**
```json
{
  "outputId": "uuid-string",
  "persistUntil": "2024-12-31T23:59:59.000Z" // optional ISO datetime
}
```

**Response:**
```json
{
  "success": true,
  "output": {
    "id": "uuid-string",
    "jobId": "uuid-string",
    "type": "IMAGE" | "VIDEO",
    "url": "https://...",
    "thumbnailUrl": "https://...",
    "durationSeconds": 6,
    "metadata": {...},
    "persistUntil": "2024-12-31T23:59:59.000Z",
    "isRemoved": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "sceneId": "uuid-string"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid request data
- `401` - Unauthorized
- `404` - Output not found or access denied
- `500` - Internal server error

#### DELETE `/api/outputs/:id`
Soft delete an output (sets `is_removed = true`).

**Response:**
```json
{
  "success": true,
  "message": "Output deleted successfully"
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `404` - Output not found or access denied
- `500` - Internal server error

#### GET `/api/outputs/persistent`
Get user's persistent outputs with pagination.

**Query Parameters:**
- `limit` (number, default: 50, max: 100)
- `offset` (number, default: 0)

**Response:**
```json
{
  "outputs": [
    {
      "id": "uuid-string",
      "type": "IMAGE" | "VIDEO",
      "url": "https://...",
      "thumbnailUrl": "https://...",
      "durationSeconds": 6,
      "metadata": {...},
      "persistUntil": "2024-12-31T23:59:59.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "jobId": "uuid-string",
      "jobMode": "MODE_A" | "MODE_B" | "MODE_C",
      "jobTitle": "Optional title"
    }
  ],
  "totalCount": 100,
  "limit": 50,
  "offset": 0,
  "hasMore": true
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `500` - Internal server error

### 2. Avatar/Reference Image APIs

#### POST `/api/outputs/:id/save-as-avatar`
Save an image output as an avatar/reference image.

**Response:**
```json
{
  "success": true,
  "referenceImage": {
    "id": "uuid-string",
    "userId": "user-id",
    "outputId": "uuid-string",
    "imageUrl": "https://...",
    "isAvatar": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Only image outputs can be saved as avatars
- `401` - Unauthorized
- `404` - Output not found or access denied
- `500` - Internal server error

#### GET `/api/users/:userId/reference-images`
Get user's reference images.

**Query Parameters:**
- `isAvatar` (boolean, optional) - Filter by avatar images only
- `limit` (number, default: 50, max: 100)
- `offset` (number, default: 0)

**Response:**
```json
{
  "images": [
    {
      "id": "uuid-string",
      "imageUrl": "https://...",
      "isAvatar": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "outputId": "uuid-string",
      "outputType": "IMAGE" | "VIDEO",
      "jobId": "uuid-string",
      "jobMode": "MODE_A" | "MODE_B" | "MODE_C",
      "jobTitle": "Optional title"
    }
  ],
  "totalCount": 25,
  "limit": 50,
  "offset": 0,
  "hasMore": false
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `403` - Access denied (non-admin trying to access other user's data)
- `500` - Internal server error

#### DELETE `/api/reference-images/:id`
Remove a reference image.

**Response:**
```json
{
  "success": true,
  "message": "Reference image deleted successfully"
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `403` - Access denied (non-admin trying to delete other user's data)
- `404` - Reference image not found
- `500` - Internal server error

### 3. Dashboard API (Admin Only)

#### GET `/api/dashboard/recent-outputs`
Get recent outputs with pagination and filters (admin only).

**Query Parameters:**
- `limit` (number, default: 50, max: 100)
- `offset` (number, default: 0)
- `startDate` (ISO datetime, optional) - Filter by start date
- `endDate` (ISO datetime, optional) - Filter by end date
- `modelType` (`MODE_A` | `MODE_B` | `MODE_C`, optional) - Filter by generation mode
- `userEmail` (string, optional) - Filter by user email

**Response:**
```json
{
  "outputs": [
    {
      "id": "uuid-string",
      "type": "IMAGE" | "VIDEO",
      "url": "https://...",
      "thumbnailUrl": "https://...",
      "durationSeconds": 6,
      "metadata": {...},
      "persistUntil": "2024-12-31T23:59:59.000Z",
      "isRemoved": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "jobId": "uuid-string",
      "jobMode": "MODE_A" | "MODE_B" | "MODE_C",
      "jobTitle": "Optional title",
      "userId": "user-id",
      "userEmail": "user@example.com",
      "userName": "User Name"
    }
  ],
  "totalCount": 150,
  "limit": 50,
  "offset": 0,
  "hasMore": true,
  "filters": {
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.000Z",
    "modelType": "MODE_A",
    "userEmail": "user@example.com"
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `403` - Access denied (non-admin users)
- `400` - Invalid query parameters
- `500` - Internal server error

## Database Schema Changes

The following database changes were made to support persistence features:

### New Tables

#### `reference_images` (from migration 0008)
- `id` (uuid, primary key)
- `user_id` (text, foreign key to user)
- `output_id` (uuid, foreign key to output_asset)
- `image_url` (text)
- `created_at` (timestamp)
- `is_avatar` (boolean, default false)

### Modified Tables

#### `output_asset` (from migration 0008)
- Added `persist_until` (timestamp, nullable)
- Added `is_removed` (boolean, default false)

## Key Features

### 1. Atomic Database Transactions
All persistence operations use database transactions to ensure data integrity:
- `persistOutput()` - Atomic operation to mark output as persistent
- `saveOutputAsAvatar()` - Atomic operation to save output as avatar
- `softDeleteOutput()` - Atomic operation to soft delete output

### 2. Comprehensive Error Handling
- Input validation using Zod schemas
- Proper HTTP status codes for different error scenarios
- Detailed error messages for debugging
- Transaction rollback on errors

### 3. Security & Access Control
- Authentication required for all endpoints
- Users can only access their own data
- Admin-only access for dashboard endpoints
- Proper role-based access control

### 4. Pagination Support
- All list endpoints support `limit` and `offset` parameters
- Consistent pagination response format
- `hasMore` flag for easy client-side implementation

### 5. TypeScript Integration
- Full TypeScript support with proper type definitions
- Comprehensive type definitions in `/lib/types/persistence.ts`
- Type-safe database queries using Drizzle ORM

## Implementation Details

### Database Service
The `PersistenceTransaction` class in `/lib/services/db-transaction.ts` provides atomic operations:

```typescript
export class PersistenceTransaction {
  static async persistOutput(tx: typeof db, outputId: string, userId: string, persistUntil?: string)
  static async saveOutputAsAvatar(tx: typeof db, outputId: string, userId: string)
  static async softDeleteOutput(tx: typeof db, outputId: string, userId: string)
}
```

### Error Handling Pattern
All endpoints follow a consistent error handling pattern:

```typescript
try {
  // Business logic with transactions
} catch (error) {
  console.error('Error description:', error);
  
  if (error instanceof Error) {
    if (error.message.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    // Handle other specific error types
  }
  
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
```

### Input Validation Pattern
All endpoints use Zod schemas for input validation:

```typescript
const schema = z.object({
  field: z.string().uuid(),
  optionalField: z.string().datetime().optional(),
});

const validation = schema.safeParse(body);
if (!validation.success) {
  return NextResponse.json(
    { error: 'Invalid request', details: validation.error.errors },
    { status: 400 }
  );
}
```

## Files Created

### API Routes
- `/src/app/api/outputs/persist/route.ts` - POST endpoint for marking outputs persistent
- `/src/app/api/outputs/[id]/route.ts` - DELETE endpoint for soft deleting outputs
- `/src/app/api/outputs/persistent/route.ts` - GET endpoint for user's persistent outputs
- `/src/app/api/outputs/[id]/save-as-avatar/route.ts` - POST endpoint for saving output as avatar
- `/src/app/api/users/[userId]/reference-images/route.ts` - GET endpoint for user's reference images
- `/src/app/api/reference-images/[id]/route.ts` - DELETE endpoint for removing reference images
- `/src/app/api/dashboard/recent-outputs/route.ts` - GET endpoint for dashboard analytics

### Supporting Files
- `/src/lib/services/db-transaction.ts` - Database transaction service with atomic operations
- `/src/lib/types/persistence.ts` - TypeScript type definitions for all API responses

## Testing

All endpoints include proper error handling and can be tested using standard HTTP clients. Example test cases:

### Test Persistence
```bash
curl -X POST /api/outputs/persist \
  -H "Content-Type: application/json" \
  -d '{"outputId": "uuid", "persistUntil": "2024-12-31T23:59:59.000Z"}'
```

### Test Get Persistent Outputs
```bash
curl -X GET "/api/outputs/persistent?limit=10&offset=0"
```

### Test Save as Avatar
```bash
curl -X POST /api/outputs/uuid/save-as-avatar
```

## Notes

- All timestamps are in ISO 8601 format (UTC)
- UUIDs are used for all primary keys
- Database operations use Drizzle ORM with PostgreSQL
- Authentication is handled by BetterAuth
- All responses follow consistent JSON structure
- Pagination is zero-indexed (offset starts from 0)
- Soft deletion preserves data integrity while allowing recovery if needed