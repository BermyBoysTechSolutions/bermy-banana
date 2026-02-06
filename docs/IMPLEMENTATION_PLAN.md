# Bermy Banana - MVP Implementation Plan

## Overview
AI UGC image/video generation app that improves on Arcads and Speel with:
- **Multi-scene workflow** (key differentiator - neither competitor has this)
- **Better product interaction** via Veo 3.1 reference images
- **Scene-by-scene script generation**
- **Template system** (hook → demo → CTA)

## User Decisions Summary
| Decision | Choice |
|----------|--------|
| Video Engine | Veo 3.1 via Gemini API |
| Image Engine | Nano Banana Pro (Gemini 3 Pro Image) |
| Multi-scene output | Clips only + FFmpeg concat script (no server stitching) |
| Avatar refs | Single ref MVP, schema ready for multi-ref |
| Quotas | 50 videos/day, 200 images/day per approved user |
| Storage | Vercel Blob |
| Product interaction | Best effort prompting |
| Video params | 9:16 vertical, 4-8s, audio toggle |
| Cost tracking | Basic audit MVP |

---

## Three Generation Modes

### Mode A: UGC Talking Video
- Avatar + optional product + script → Veo video
- Multi-scene support (hook → demo → CTA)
- Script Assistant for hooks/CTAs

### Mode B: Influencer Photo
- Avatar + prompt → Nano Banana image
- Realistic "phone-captured" style
- Prompt Optimizer for realism

### Mode C: Product/TikTok Affiliate Video
- Product + optional avatar + action → Veo video
- Action types: hold/point/use/unbox/demo
- Multi-scene support

---

## Database Schema Changes

### Extend User Table
Add to existing `user` table:
- `status`: PENDING | APPROVED | DENIED | SUSPENDED (default: PENDING)
- `role`: USER | ADMIN
- `dailyVideoQuota`, `dailyImageQuota` (defaults: 50, 200)
- `videosGeneratedToday`, `imagesGeneratedToday`
- `quotaResetAt`

### New Tables
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `avatar` | User's AI personas | name, referenceImageUrl, userId, metadata |
| `product_asset` | Products for demos | name, imageUrl, brand, category, userId |
| `scene_template` | Pre-built templates | name, sceneCount, defaultScenes JSON |
| `generation_job` | Master job record | mode, status, userId, config JSON |
| `scene` | Scenes within job | jobId, order, avatarId, productId, prompt, duration |
| `output_asset` | Generated outputs | jobId, sceneId, type, url, metadata |
| `audit_log` | Activity tracking | userId, action, mode, metadata, timestamp |

---

## Provider Layer

### `src/lib/providers/veo.ts`
```typescript
// Veo 3.1 via Gemini API
const VEO_MODEL = "models/veo-3.1-generate-preview";
// Async: initiate → poll → download
// Up to 3 reference images
// Duration: 4, 6, 8 seconds
// Aspect: 9:16, 16:9
```

### `src/lib/providers/nano-banana.ts`
```typescript
// Gemini 3 Pro Image
const NANO_BANANA_MODEL = "models/gemini-3-pro-image-preview";
// Up to 14 reference images (6 objects, 5 humans)
// Resolutions: 1K, 2K, 4K
```

### Environment Variable
```
GOOGLE_AI_API_KEY=your-gemini-api-key
```

---

## API Routes

### Asset Management
- `POST/GET /api/avatars` - Create/list avatars
- `DELETE /api/avatars/[id]` - Delete avatar
- `POST/GET /api/products` - Create/list products
- `DELETE /api/products/[id]` - Delete product

### Generation
- `POST /api/generate` - Create job (validates quota, user status)
- `GET /api/jobs` - List user's jobs
- `GET /api/jobs/[id]` - Job status + outputs + concat script

### AI Helpers
- `POST /api/ai/script` - Generate script variants (hooks, scenes, CTAs)
- `POST /api/ai/prompt` - Optimize prompt for model

### Admin
- `GET /api/admin/users` - List users with status
- `PATCH /api/admin/users/[id]` - Approve/deny/suspend
- `GET /api/admin/audit` - View audit logs

---

## UI Screens

### Route Structure
```
src/app/
├── (waitlist)/pending/     # Pending user dashboard
├── (app)/
│   ├── dashboard/          # Mode selection
│   ├── mode-a/             # UGC Video wizard
│   ├── mode-b/             # Influencer Photo wizard
│   ├── mode-c/             # Product Video wizard
│   ├── avatars/            # Avatar library
│   ├── products/           # Product library
│   └── outputs/            # Generated outputs
├── (admin)/admin/          # Admin dashboard
```

### Key Components
- `scene-builder.tsx` - Add/remove/reorder scenes, per-scene config
- `script-assistant.tsx` - Hook generator, talking points, CTAs
- `avatar-selector.tsx` - Grid picker for generation wizards
- `product-selector.tsx` - Grid picker for generation wizards
- `generation-progress.tsx` - Job status with polling

---

## Job Processing Flow

1. Client POSTs to `/api/generate` with mode, scenes config
2. Server validates user status (must be APPROVED)
3. Server checks and decrements quota
4. Server creates `generation_job` + `scene` records
5. Server initiates Veo/Nano Banana requests per scene
6. Client polls `GET /api/jobs/[id]` for status
7. When all scenes complete:
   - Job marked COMPLETED
   - Outputs stored in Vercel Blob
   - Concat script generated for multi-scene videos
8. Client downloads clips + runs concat script locally

---

## Approval Gate (Critical)

### Middleware Pattern
Every generation endpoint must:
1. Check session exists → 401 if not
2. Check `user.status === "APPROVED"` → 403 if not
3. Check quota remaining → 429 if exceeded

### Default User Flow
1. User registers → status = PENDING
2. User sees waitlist screen
3. Admin approves → status = APPROVED
4. User can now generate

---

## Implementation Phases

### Phase 1: Foundation ✅ COMPLETED
- [x] Extend user schema with status/role/quotas
- [x] Add all new database tables
- [x] Run migrations
- [x] Create provider layer stubs
- [x] Build approval gate middleware
- [x] Add GOOGLE_AI_API_KEY env var

### Phase 2: Asset Management ✅ COMPLETED
- [x] Avatar library UI + API
- [x] Product library UI + API
- [x] Image upload with preview
- [x] Storage integration

### Phase 3: Mode B (Simplest) ✅ COMPLETED
- [x] Nano Banana provider implementation
- [x] Influencer Photo wizard UI
- [x] Prompt Optimizer
- [x] Output display + download

### Phase 4: Scene Builder Core ✅ COMPLETED
- [x] Scene Builder UI (integrated into Mode A page)
- [x] Script Assistant API (using OpenRouter)
- [ ] Scene template system (deferred - not critical for MVP)
- [ ] Template selector (deferred - not critical for MVP)

### Phase 5: Mode A ✅ COMPLETED
- [x] Veo provider implementation (async polling)
- [x] UGC Video wizard UI with scene builder
- [x] Multi-scene job processing
- [x] Video player + download
- [x] Concat script generation

### Phase 6: Mode C ✅ COMPLETED
- [x] Product Video wizard UI
- [x] Action picker (hold/point/use/unbox/demo)
- [x] Product-focused prompting
- [x] Optional avatar presenter support
- [x] Multi-scene support with concat script

### Phase 7: Admin ✅ COMPLETED
- [x] Admin dashboard
- [x] User approval workflow
- [x] Audit log viewer
- [x] Usage statistics (basic)

---

## Critical Files to Modify/Create

### Modify
- `src/lib/schema.ts` - Add all new tables + extend user ✅ DONE
- `src/lib/env.ts` - Add GOOGLE_AI_API_KEY validation ✅ DONE

### Create
- `src/lib/providers/types.ts` - Shared types ✅ DONE
- `src/lib/providers/veo.ts` - Veo 3.1 integration ✅ DONE
- `src/lib/providers/nano-banana.ts` - Nano Banana integration ✅ DONE
- `src/lib/services/generation.ts` - Job orchestration ✅ DONE
- `src/lib/services/quota.ts` - Quota management ✅ DONE
- `src/lib/services/audit.ts` - Audit logging ✅ DONE
- `src/app/api/generate/route.ts` - Main generation endpoint ✅ DONE
- `src/app/api/jobs/[id]/route.ts` - Job status + outputs ✅ DONE
- `src/app/api/ai/script/route.ts` - Script Assistant API ✅ DONE
- `src/app/mode-a/page.tsx` - UGC Video wizard with scene builder ✅ DONE
- `src/app/mode-c/page.tsx` - Product Video wizard with action picker ✅ DONE

---

## Verification Plan

### After Phase 1
- Run `npm run db:generate && npm run db:migrate`
- Verify new tables exist in `npm run db:studio`
- Test user status field works

### After Phase 3 (Mode B)
- Create test avatar
- Generate test image with Nano Banana
- Verify output saves to Vercel Blob
- Check quota decremented

### After Phase 5 (Mode A)
- Create multi-scene video job
- Watch polling complete all scenes
- Download clips
- Run concat script locally
- Verify final video works

### After Phase 7 (Admin)
- Create new user
- Verify shows waitlist
- Admin approves user
- User can now generate

---

## Progress Summary

**Completed:**
- Boilerplate cleanup (removed chat, diagnostics, starter kit branding)
- Updated branding to Bermy Banana with custom logo
- Database schema with all new tables + migrations run
- Extended user table with status/role/quotas
- GOOGLE_AI_API_KEY added to env.ts
- Avatar library UI + API (CRUD with image upload)
- Product library UI + API (CRUD with image upload)
- Nano Banana provider for image generation
- Mode B (Influencer Photo) - complete wizard UI
- Quota service with daily reset
- Generation service with job orchestration
- Audit logging service
- Admin dashboard with user approval workflow
- Admin API routes (users, audit logs)
- Veo 3.1 provider for video generation
- Script Assistant API using OpenRouter
- Mode A (UGC Video) wizard with scene builder
- Multi-scene job processing with concat script generation
- Mode C (Product Video) wizard with action picker
- Product-focused video prompting
- Optional avatar presenter support for product videos

**MVP Complete!**

All three generation modes are now implemented:
- **Mode A**: UGC Talking Videos (avatar + script + multi-scene)
- **Mode B**: Influencer Photos (avatar + prompt)
- **Mode C**: Product Videos (product + action + optional avatar)

**Potential Future Enhancements:**
- Scene template system (pre-built hook → demo → CTA templates)
- Template selector UI
- Outputs gallery page
- Usage analytics dashboard
- Batch generation support
