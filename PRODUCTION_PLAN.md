# Bermy Banana Production Plan

## 1. Critical Fixes

### Avatar Edit Button (URGENT)
**Issue:** Edit button only allows editing description, not name or image
**Fix needed:**
- [ ] Add name editing field in the edit modal
- [ ] Add image replacement upload option
- [ ] Ensure PATCH /api/avatars/[id] handles both name and image updates

---

## 2. Landing Page Carousel (Social Proof)

**Location:** Homepage (`/`) below the fold
**Design:**
- Auto-scrolling horizontal carousel
- Shows example outputs: AI-generated photos + short video GIFs
- Displays "Made with Bermy Banana" watermark on examples
- Categories: UGC Videos, Influencer Photos, Product Demos

**Implementation:**
- [ ] Create `/public/examples/` folder with sample outputs
- [ ] Add carousel component using embla-carousel or similar
- [ ] Responsive: 3 items desktop, 2 tablet, 1 mobile
- [ ] Pause on hover

---

## 3. Pre-Production Checklist

### Phase 1: Payments (Before launch)
- [ ] Pricing page (3 tiers: Free, Pro $49/mo, Enterprise)
- [ ] Polar checkout integration
- [ ] Subscription management page
- [ ] Webhook handlers for payment events
- [ ] Quota system tied to subscription tier

### Phase 2: Legal
- [ ] Terms of Service page
- [ ] Privacy Policy page
- [ ] Cookie consent banner

### Phase 3: Polish
- [ ] Email notifications (welcome, generation complete, quota warning)
- [ ] Video concatenation service (actual stitched video, not just FFmpeg script)
- [ ] Generation progress polling UI

### Phase 4: Infrastructure
- [ ] Rate limiting on API routes
- [ ] Monitoring/alerting

---

## 4. Current Status

**Working:**
- Authentication (Google OAuth)
- Avatar creation/management
- Product management
- All 3 generation modes
- Admin dashboard
- Quota system

**Broken:**
- Avatar edit (name/image)

**Missing:**
- Payments
- Legal pages
- Email notifications
- Video concatenation
- Landing page examples carousel
