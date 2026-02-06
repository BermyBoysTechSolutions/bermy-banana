# Technical Specification: Product Selection & Reference Images

## Overview
This document outlines the implementation of two new features for Bermy Banana:
1. **Feature 1: Product Selection in Mode B (Influencer Photos)** - Allow users to include a product in influencer photo generation
2. **Feature 2: Reference Image Upload Section** - Allow users to upload and edit reference images for iterative content creation

---

## Feature 1: Product Selection in Mode B

### Changes Required

#### 1. Database Schema (src/lib/schema.ts)
**No changes needed** - The `scene` table already has a `productId` field that can be used for Mode B generation tracking.

#### 2. Generation Service (src/lib/services/generation.ts)
Modify `ModeBGenerationRequest` interface to include optional product fields:
```typescript
export interface ModeBGenerationRequest {
  avatarId: string;
  prompt: string;
  style?: "casual" | "professional" | "lifestyle" | "selfie" | undefined;
  aspectRatio?: "9:16" | "16:9" | "1:1" | undefined;
  title?: string | undefined;
  productId?: string | undefined; // NEW
}
```

Modify `generateInfluencerPhoto` function to:
1. Fetch product if `productId` is provided
2. Pass product reference image to the provider
3. Update scene record to include productId
4. Enhance prompt with product context

#### 3. API Route (src/app/api/generate/route.ts)
Modify Mode B handler to accept optional `productId` parameter:
- Extract `productId` from request body
- Pass to `generateInfluencerPhoto`

#### 4. Mode B Page (src/app/mode-b/page.tsx)
Add product selection UI section after avatar selection:
- Fetch user's products from `/api/products`
- Display product grid similar to avatar selection
- Add "None" option for no product
- Include product reference in generate request

#### 5. Nano Banana Provider (src/lib/providers/nano-banana.ts)
The `generateImage` function already supports multiple reference images, so no changes needed there.

Modify `buildInfluencerPhotoPrompt` to accept optional product information:
```typescript
export function buildInfluencerPhotoPrompt(options: {
  basePrompt: string;
  aspectRatio?: string;
  style?: "casual" | "professional" | "lifestyle" | "selfie";
  productName?: string; // NEW
  includeProduct?: boolean; // NEW
}): string
```

---

## Feature 2: Reference Image Upload Section

### Changes Required

#### 1. Database Schema (src/lib/schema.ts)
Create new `referenceImage` table:
```typescript
export const referenceImage = pgTable(
  "reference_image",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    imageUrl: text("image_url").notNull(),
    description: text("description"),
    metadata: jsonb("metadata").$type<{
      width?: number;
      height?: number;
      format?: string;
      sourceJobId?: string; // Link to original generation job if derived from output
    }>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("reference_image_user_id_idx").on(table.userId)]
);
```

Add relations:
```typescript
export const referenceImageRelations = relations(referenceImage, ({ one }) => ({
  user: one(user, {
    fields: [referenceImage.userId],
    references: [user.id],
  }),
}));
```

Add type exports:
```typescript
export type ReferenceImage = typeof referenceImage.$inferSelect;
export type NewReferenceImage = typeof referenceImage.$inferInsert;
```

#### 2. API Routes - Create New Routes
Create `src/app/api/reference-images/route.ts`:
- GET: List user's reference images
- POST: Create new reference image (upload to storage)

Create `src/app/api/reference-images/[id]/route.ts`:
- GET: Get specific reference image
- DELETE: Delete reference image
- PATCH: Update reference image metadata

#### 3. Dashboard Page (src/app/dashboard/page.tsx)
Add Reference Images section above Avatars in "Manage Assets":
- Grid display of uploaded reference images
- Upload button (opens dialog)
- Preview with click-to-enlarge
- Delete option
- Click to "Use in Editor" button

#### 4. Mode B Page Enhancement
Add "Use Reference Image" option:
- Allow users to select a reference image
- Use it as additional context for generation
- This enables iterative editing of existing content

---

## Implementation Order

1. **Database Schema Changes** - Add reference_image table
2. **API Routes** - Create reference-images API routes
3. **Dashboard UI** - Add Reference Images section to dashboard
4. **Mode B Product Selection** - Add product upload/selection to Mode B
5. **Mode B Reference Image** - Add reference image option to Mode B
6. **Generation Service Updates** - Update to handle product and reference images
7. **Testing** - Run lint and typecheck
8. **Database Migration** - Apply schema changes

---

## File Modification Summary

| File | Change Type | Description |
|------|-------------|-------------|
| src/lib/schema.ts | Modify | Add referenceImage table and types |
| src/lib/services/generation.ts | Modify | Add productId to ModeBGenerationRequest |
| src/app/api/generate/route.ts | Modify | Accept productId in Mode B handler |
| src/app/mode-b/page.tsx | Modify | Add product selection UI |
| src/lib/providers/nano-banana.ts | Modify | Enhance prompt with product context |
| src/app/dashboard/page.tsx | Modify | Add Reference Images section |
| src/app/api/reference-images/route.ts | Create | New API route for CRUD operations |
| src/app/api/reference-images/[id]/route.ts | Create | Individual resource operations |

---

## UI Mockup for Dashboard Reference Images Section

```
┌─────────────────────────────────────────────────────┐
│ Reference Images                     [+ Upload]     │
├─────────────────────────────────────────────────────┤
│ ┌─────────┐  ┌─────────┐  ┌─────────┐              │
│ │  IMG 1  │  │  IMG 2  │  │  IMG 3  │   [Upload]   │
│ │  [X]    │  │  [X]    │  │  [X]    │              │
│ └─────────┘  └─────────┘  └─────────┘              │
│                                                     │
│  Click an image to use as starting point for edits  │
└─────────────────────────────────────────────────────┘
```

## UI Mockup for Mode B Product Selection

```
┌─────────────────────────────────────────────────────┐
│ 2. Select Product (Optional)                        │
│ ─────────────────────────────                       │
│                                                     │
│  [None]  [Product 1]  [Product 2]  [+]              │
│                                                     │
│  Selected: Energy Drink                             │
└─────────────────────────────────────────────────────┘
```
