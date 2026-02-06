# Cleared Context - Bermy Banana Development Session

## Overview

This document captures all context from the development session covering Mode A/C video generation implementation, Veo API integration fixes, and avatar description + scene field enhancements.

---

## 1. Mode C (Product Video) Implementation

### Files Created/Modified:
- **`src/app/mode-c/page.tsx`** - Product video wizard UI with product selector, optional avatar presenter, 5 action types (hold, point, use, unbox, demo), scene builder with duration options (5, 6, 8 sec)
- **`src/lib/services/generation.ts`** - Added `ProductSceneConfig`, `ModeCGenerationRequest` interfaces and `generateProductVideo()` function
- **`src/app/api/generate/route.ts`** - Added MODE_C case with validation for product scenes
- **`src/app/dashboard/page.tsx`** - Enabled Mode C button linking to `/mode-c`

### Key Types:
```typescript
export interface ProductSceneConfig {
  action: ProductAction; // "hold" | "point" | "use" | "unbox" | "demo"
  script?: string | undefined;
  duration: 5 | 6 | 8;
  setting?: string | undefined;
}

export interface ModeCGenerationRequest {
  productId: string;
  avatarId?: string | undefined;
  scenes: ProductSceneConfig[];
  title?: string | undefined;
  audioEnabled?: boolean | undefined;
}
```

---

## 2. Veo API Integration Fixes

### Issue 1: File too large (5MB limit)
- **Fix**: Increased `maxSize` from 5MB to 100MB in `src/lib/storage.ts` (to accommodate videos)
- Also added video MIME types and extensions (.mp4, .webm, .mov)

### Issue 2: durationSeconds out of bound
- **Fix**: Changed duration types from `4 | 6 | 8` to `5 | 6 | 8` across all files
- Later discovered the API has inconsistent validation messages, so **removed `durationSeconds` entirely** from the Veo config to let the API use its default

### Issue 3: "Operation name is required" during polling
- **Fix**: Rewrote `src/lib/providers/veo.ts` to use `client.operations.getVideosOperation({ operation: operation })` instead of `client.operations.get({ operation: operationId })`
- Changed model from `veo-2.0-generate-001` to `veo-3.1-generate-preview`

### Issue 4: "allow_adult for personGeneration is currently not supported"
- **Fix**: Removed `personGeneration: "allow_adult"` from the Veo config

### Issue 5: Video download failing (authentication required)
- **Fix**: Added API key to the download URL: `${videoRef.uri}?key=${apiKey}`

### Issue 6: "File type not allowed" when saving generated video
- **Fix**: Added video extensions (.mp4, .webm, .mov) and MIME types (video/mp4, video/webm, video/quicktime) to `ALLOWED_EXTENSIONS` and `DEFAULT_CONFIG.allowedTypes` in `src/lib/storage.ts`

### Final Working Veo Config:
```typescript
const config: Record<string, unknown> = {
  aspectRatio: aspectRatio, // "9:16" or "16:9"
};
// No durationSeconds, no personGeneration
```

### Veo Polling Pattern:
```typescript
let operation = await client.models.generateVideos({
  model: "veo-3.1-generate-preview",
  prompt: request.prompt,
  config: config,
});

while (!operation.done && attempts < MAX_POLL_ATTEMPTS) {
  await new Promise((resolve) => setTimeout(resolve, 10000));
  operation = await client.operations.getVideosOperation({
    operation: operation,
  });
  attempts++;
}
```

### Video Download Pattern:
```typescript
if (videoRef.uri) {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  const downloadUrl = videoRef.uri.includes("?")
    ? `${videoRef.uri}&key=${apiKey}`
    : `${videoRef.uri}?key=${apiKey}`;
  const fetchResponse = await fetch(downloadUrl);
  // ... handle response
}
```

---

## 3. Avatar Description + Scene Fields Enhancement

### Problem
Video generation produced a random person instead of the selected avatar. The avatar's appearance wasn't being communicated to Veo (which is text-prompt-based, not image-reference-based for video).

### Solution
Added a `description` field to avatars so users can describe their avatar's appearance in detail, which gets included in the Veo prompt.

### Schema Changes (migration `0003_boring_black_tom.sql`):

**Avatar table** - added:
- `description` (text, nullable) - Detailed description of avatar's appearance for video generation

**Scene table** - added:
- `setting` (text, nullable) - Where the scene takes place
- Note: `action` field already existed on the scene table

### Files Modified:

#### `src/lib/schema.ts`
- Added `description` field to `avatar` table
- Added `setting` field to `scene` table
- Reordered scene fields: prompt, script, action, setting, duration

#### `src/app/api/avatars/route.ts`
- POST now accepts `description` field from form data
- Stores description when creating avatar

#### `src/app/api/avatars/[id]/route.ts`
- Added `PATCH` endpoint to update avatar name and/or description

#### `src/app/avatars/page.tsx`
- Added `description` field to Avatar interface
- Added description textarea in create dialog with helper text
- Added inline edit functionality (pencil icon on hover) to update description on existing avatars
- Grid changed from 4-col to 3-col to accommodate description display
- Shows description or "No description — click edit to add one" on avatar cards

#### `src/app/mode-a/page.tsx`
- Added `action` and `setting` fields to `SceneConfig` interface
- Default scenes now include action defaults:
  - Hook: "talking to camera energetically"
  - Demo: "holding and showing the product"
  - CTA: "talking to camera with a smile"
- Added Action input field ("what the avatar does")
- Added Setting input field ("where")
- Script label changed to "Script (what they say)"
- Scenes sent to API now include action and setting

#### `src/lib/providers/veo.ts` - `buildUGCVideoPrompt()`
- Added `action` parameter
- Avatar description now placed prominently: "The person in the video must look exactly like this: {description}"
- Action included as: "What they are doing: {action}"
- Setting included as: "Setting/Location: {setting}"
- Updated function signature to use `| undefined` for exactOptionalPropertyTypes compatibility

#### `src/lib/services/generation.ts`
- `SceneConfig` interface now includes `action` and `setting` fields
- `generateUGCVideo()`:
  - Fetches product description if product selected
  - Scene records now store action and setting
  - Passes `avatarDescription`, `action`, `productDescription`, and `setting` to `buildUGCVideoPrompt()`
  - Removed `referenceImages` from generateVideo call (Veo uses text prompts, not image references for video)
- `generateProductVideo()`:
  - Avatar data type now includes `description` field
  - Passes `avatarData?.description ?? avatarData?.name` as avatar description

---

## 4. Storage Configuration (Final State)

**`src/lib/storage.ts`**:
```typescript
const DEFAULT_CONFIG: Required<StorageConfig> = {
  maxSize: 100 * 1024 * 1024, // 100MB (to accommodate videos)
  allowedTypes: [
    "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
    "video/mp4", "video/webm", "video/quicktime",
    "application/pdf", "text/plain", "text/csv", "application/json",
  ],
};

const ALLOWED_EXTENSIONS = new Set([
  ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg",
  ".mp4", ".webm", ".mov",
  ".pdf", ".txt", ".csv", ".json",
]);
```

---

## 5. Key Architecture Notes

- **Veo 3.1** (`veo-3.1-generate-preview`) is the video generation model
- **Nano Banana** is the image generation provider (Mode B)
- **Google GenAI SDK** (`@google/genai`) is used for Veo integration
- Video generation is async: initiate -> poll every 10s -> download when done
- Polling timeout: 60 attempts * 10s = 10 minutes max
- Videos are downloaded with API key authentication appended to the URI
- Avatar consistency relies on detailed text descriptions (Veo doesn't use reference images for video)
- Multi-scene videos generate a FFmpeg concat script for joining

---

## 6. Database Migrations Applied
1. `0000_chilly_the_phantom.sql` - Initial schema
2. `0001_last_warpath.sql` - Previous migration
3. `0003_boring_black_tom.sql` - Added avatar.description, scene.setting

---

## 7. Environment Variables Required
```
GOOGLE_AI_API_KEY=  # Required for Veo video generation
POSTGRES_URL=       # Database connection
BETTER_AUTH_SECRET=  # Auth
NEXT_PUBLIC_APP_URL= # App URL
```
