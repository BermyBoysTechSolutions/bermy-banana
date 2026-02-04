# Claude Code: Day 1 Implementation Prompt
## Bermy Banana — Avatar Fix + Landing Page Carousel

⚡ **SPEED TO MARKET PRIORITY**: Ship working features today. Perfect is the enemy of done.

---

## Task 1: Avatar Edit Button Fix (Priority: Critical)

### Problem
The avatar edit button only allows editing the description. Users cannot edit the avatar name or replace the reference image.

### Solution Required
Update the avatar edit functionality to support:
1. **Name editing** — Pre-populated text field with current name
2. **Image replacement** — Upload new image (optional; keep current if not changed)

### Files to Modify

#### 1. `/app/avatars/page.tsx`
**Current behavior:** Edit modal only shows description textarea
**Required changes:**
- Add name input field (editable, pre-filled with current name)
- Add image upload section (optional replacement)
- Show current image preview
- Add "Replace Image" button that triggers file picker
- Update save handler to send both name and optional new image

**UI Pattern:**
```
[Current Image Preview]
[Replace Image Button] → Opens file picker

Name: [__________] (pre-filled)
Description: [__________] (existing textarea)
[Cancel] [Save Changes]
```

#### 2. `/app/api/avatars/[id]/route.ts` (PATCH handler)
**Current:** Only handles description updates
**Required:** Handle multipart/form-data for image uploads
- Accept optional image file in request
- If new image provided:
  - Upload to storage (`/lib/storage`)
  - Delete old image using `deleteFile()`
- Update name if provided
- Return updated avatar object

### Success Criteria
- [ ] Can edit avatar name and save
- [ ] Can upload new image to replace existing
- [ ] If no new image selected, existing image preserved
- [ ] Old image deleted from storage when replaced
- [ ] Form validation (name required)

---

## Task 2: Landing Page Examples Carousel (Priority: High)

### Goal
Create an auto-scrolling carousel on the homepage showcasing example UGC content to establish social proof and demonstrate capabilities.

### Visual Inspiration (Competitor Analysis)

**Arcads.ai style:**
- Dark/black gradient backgrounds
- Large video thumbnails with play buttons
- Category labels ("UGC Video", "Product Demo")
- Smooth horizontal scroll
- Mobile-first responsive design

**HeyGen style:**
- Grid-like carousel with consistent card sizing
- Hover effects revealing CTA
- High-contrast text on dark backgrounds
- Professional, polished aesthetic

**Common patterns:**
- 16:9 or 9:16 aspect ratio cards
- Category badges/tags
- "Made with [Product]" watermarks
- Auto-scroll with pause on hover

### Implementation Requirements

#### 1. Install Dependency
```bash
pnpm add embla-carousel-react embla-carousel-autoplay
```

#### 2. Create `/components/landing/examples-carousel.tsx`
**Component specifications:**
- Full-width section with dark gradient background (`bg-gradient-to-b from-background to-muted`)
- Section heading: "See What You Can Create"
- Subheading: "AI-generated UGC content in minutes"

**Carousel features:**
- 6 placeholder cards (we'll populate with real content later)
- Card design:
  - Aspect ratio: 9:16 (portrait, typical for UGC)
  - Rounded corners (rounded-xl)
  - Shadow effect
  - Category badge (top-left): "UGC Video", "Influencer Photo", "Product Demo"
  - Placeholder gradient background with icon
  - "Coming Soon" or "Example" label
- Auto-scroll: 3 second interval
- Pause on hover
- Touch/drag support for mobile
- Navigation dots or arrows (optional)

**Card categories to show:**
1. UGC Video (talking head)
2. Influencer Photo (lifestyle)
3. Product Video (unboxing)
4. UGC Video (testimonial)
5. Influencer Photo (selfie style)
6. Product Video (demo)

#### 3. Update `/app/page.tsx`
- Import and add carousel component
- Place below the feature cards grid
- Add proper spacing (py-16 or similar)

### Styling Guidelines
- Use existing shadcn/ui color tokens
- Support dark mode automatically
- Match existing design language (rounded corners, subtle shadows)
- Responsive: 1 card mobile, 2 tablet, 3 desktop, 4+ large screens

### Success Criteria
- [ ] Carousel renders on homepage
- [ ] Auto-scrolls smoothly
- [ ] Pauses on hover
- [ ] Touch-friendly on mobile
- [ ] Consistent with site design

---

## Task 3: Testing & Validation

Before marking complete:
1. Run `pnpm run lint` — fix any issues
2. Run `pnpm run typecheck` — fix any type errors
3. Test avatar edit flow end-to-end
4. Verify carousel displays and scrolls
5. Check dark mode appearance

---

## Plan Mode Required

**STOP before coding.** 

1. Read the current avatar page implementation
2. Read the current API route
3. Write a brief implementation plan in a comment
4. Get confirmation on approach (if uncertain)
5. Then proceed with implementation

---

## Subagent Strategy (If Needed)

If stuck on either task for >20 minutes:
- Spawn a subagent for the carousel component
- Keep avatar fix in main context (touches multiple files)
- One task per subagent

---

## Definition of Done

- [ ] Avatar name can be edited
- [ ] Avatar image can be replaced  
- [ ] Carousel shows on homepage with 6 example slots
- [ ] All lint and typecheck pass
- [ ] Changes committed to git

**Estimated time:** 4-6 hours total
**Target:** Deploy by end of day

---

## Reference Files

- Current avatar page: `src/app/avatars/page.tsx`
- Current avatar API: `src/app/api/avatars/[id]/route.ts`
- Storage utilities: `src/lib/storage.ts`
- Homepage: `src/app/page.tsx`
