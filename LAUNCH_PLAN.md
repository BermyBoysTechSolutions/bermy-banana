# Bermy Banana — Full Implementation to Launch Plan

**Goal:** Production-ready UGC generation platform with payments, legal compliance, and scalable infrastructure.

---

## Phase 1: Critical Fixes (Week 1)

### 1.1 Avatar Edit Button Fix
**Current Issue:** Edit button only allows editing description, not name or image
**Fix:**
- Update `/app/avatars/page.tsx` edit modal
- Add name input field (pre-populated with current name)
- Add image replacement upload (optional — keep current if not changed)
- Update PATCH handler to support image replacement if new file provided
- Test both name-only edits and full image replacement

**Files to modify:**
- `src/app/avatars/page.tsx` (UI modal)
- `src/app/api/avatars/[id]/route.ts` (add image update support)
- `src/lib/storage.ts` (delete old image on replacement)

---

## Phase 2: Landing Page Polish (Week 1-2)

### 2.1 Examples Carousel
**Location:** Homepage below the fold
**Implementation:**
- Create `/public/examples/` directory
- Add 6-8 sample outputs (3 photos, 3-5 video GIFs)
- Install `embla-carousel-react`
- Build auto-scrolling carousel component
- Categories: UGC Videos, Influencer Photos, Product Demos
- Responsive: 3 items desktop, 2 tablet, 1 mobile
- Pause on hover, touch swipe support

**Assets needed from you:**
- High-quality example outputs (or I can generate them)
- Short 3-5 second video clips converted to GIFs

---

## Phase 3: Payments Integration (Week 2-3)

### 3.1 Polar Setup
**Prerequisites:**
- Polar account (sandbox first, then production)
- Create 3 products matching pricing tiers

### 3.2 Subscription Tiers (From Notion)

| Tier | Price | Credits | Ads Equivalent | API Cost | Profit |
|------|-------|---------|----------------|----------|--------|
| **Starter** | $25/mo | 1,000 | ~3 Full Ads | $5-7 | $18-20 |
| **Pro** | $59/mo | 3,000 | ~10 Full Ads | $15-18 | $41-44 |
| **Agency** | $129/mo | 8,000 | ~26 Full Ads | $40-45 | $84-89 |

**Credit System:**
- Video generation (Mode A/C): 100 credits per scene
- Image generation (Mode B): 50 credits per image
- Free tier: 200 credits (no card required)

### 3.3 Implementation
- [ ] Create `/app/pricing/page.tsx`
- [ ] Build pricing cards with feature comparison
- [ ] Integrate Polar checkout (`@polar-sh/checkout`)
- [ ] Create `/app/settings/billing/page.tsx` (manage subscription)
- [ ] Webhook handlers (`/api/webhooks/polar`):
  - `subscription.created` — activate paid tier
  - `subscription.cancelled` — revert to free
  - `subscription.past_due` — grace period handling
- [ ] Update quota system to check subscription tier
- [ ] Add "upgrade" modal when quota exceeded

### 3.4 Database Updates
```sql
-- Add to user table
ALTER TABLE "user" ADD COLUMN subscription_tier TEXT DEFAULT 'free';
ALTER TABLE "user" ADD COLUMN subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE "user" ADD COLUMN polar_subscription_id TEXT;
ALTER TABLE "user" ADD COLUMN credits_remaining INTEGER DEFAULT 200;
ALTER TABLE "user" ADD COLUMN credits_reset_at TIMESTAMP;
```

---

## Phase 4: Legal Compliance (Week 3)

### 4.1 Required Pages
- [ ] `/terms` — Terms of Service
  - User responsibilities
  - Content ownership (users own outputs)
  - Prohibited content policy
  - Refund policy (7-day for unused credits)
  - Account termination conditions
- [ ] `/privacy` — Privacy Policy
  - Data collected (email, usage, generated content)
  - Third-party services (Google, Veo, Polar)
  - Data retention (30 days for generated content)
  - GDPR/CCPA rights
- [ ] `/cookies` — Cookie Policy (if using analytics)

### 4.2 UI Updates
- [ ] Cookie consent banner (bottom of page)
- [ ] Footer with legal links on all pages
- [ ] Checkout acknowledgment of terms

---

## Phase 5: Email Infrastructure (Week 3-4)

### 5.1 Email Provider
**Options:**
- **Resend** (recommended) — free tier: 3,000 emails/mo
- **Postmark** — $15/mo for 10,000 emails

### 5.2 Required Emails
- [ ] Welcome email (after signup)
- [ ] Email verification
- [ ] Generation complete notification
- [ ] Quota warning (at 80% and 100%)
- [ ] Subscription confirmation
- [ ] Subscription cancellation confirmation
- [ ] Failed payment retry

### 5.3 Implementation
- [ ] Set up Resend account + domain verification
- [ ] Create email templates (React Email)
- [ ] Build `/api/email/send` utility
- [ ] Trigger emails at relevant events

---

## Phase 6: Infrastructure & Hosting (Week 4)

### 6.1 Domain Setup
**Domain:** bermybanana.com (or your choice)

**Steps:**
1. Purchase domain (Namecheap, Cloudflare)
2. Add to Vercel project settings
3. Configure DNS:
   - A record: `76.76.21.21` (Vercel)
   - CNAME: `www` → `cname.vercel-dns.com`
4. Enable HTTPS (auto-provisioned by Vercel)

### 6.2 Production Environment
**Vercel Setup:**
- [ ] Create production project (separate from dev)
- [ ] Connect GitHub repo
- [ ] Configure environment variables:
  ```
  POSTGRES_URL=(production Neon/Supabase)
  BETTER_AUTH_SECRET=(generate new)
  POLAR_ACCESS_TOKEN=(production)
  POLAR_WEBHOOK_SECRET=(production)
  RESEND_API_KEY=(production)
  NEXT_PUBLIC_APP_URL=https://bermybanana.com
  ```

### 6.3 Database
**Options:**
- **Neon** (recommended) — serverless Postgres, $0-19/mo
- **Supabase** — $25/mo for 8GB

**Migration:**
- [ ] Create production database
- [ ] Run `drizzle-kit migrate`
- [ ] Seed with scene templates
- [ ] Set up automated backups (daily)

### 6.4 Storage
**Vercel Blob** (already configured)
- Check usage limits ($9/mo for 250GB)
- Alternative: Cloudflare R2 ($0.015/GB)

### 6.5 Monitoring
- [ ] Vercel Analytics (included)
- [ ] Sentry for error tracking (free tier)
- [ ] Polar dashboard for revenue

---

## Phase 7: Pre-Launch Testing (Week 4)

### 7.1 Functional Testing
- [ ] Sign up flow end-to-end
- [ ] Avatar create/edit/delete
- [ ] Product upload
- [ ] All 3 generation modes
- [ ] Quota enforcement
- [ ] Subscription upgrade/downgrade
- [ ] Webhook handling

### 7.2 Security Audit
- [ ] API rate limiting (Upstash Redis)
- [ ] Input validation on all routes
- [ ] File upload restrictions (size, type)
- [ ] SQL injection tests (Drizzle ORM protects this)

### 7.3 Performance
- [ ] Lighthouse score >90
- [ ] Image optimization (Next.js Image)
- [ ] Database query optimization

### 7.4 Soft Launch
- [ ] Invite-only beta (friends/family)
- [ ] Collect feedback for 1 week
- [ ] Fix critical issues

---

## Phase 8: Launch (Week 5)

### 8.1 Launch Day Checklist
- [ ] Final database backup
- [ ] Deploy to production
- [ ] Verify domain SSL
- [ ] Test payments in live mode (small amount)
- [ ] Send welcome email to yourself
- [ ] Post on social media
- [ ] Submit to relevant directories (from your Notion links)

### 8.2 Launch Marketing
- [ ] Twitter/X announcement thread
- [ ] Reddit posts (r/SaaS, r/InternetIsBeautiful)
- [ ] Product Hunt launch (prepare 2 weeks ahead)
- [ ] LinkedIn post

---

## Cost Breakdown

### Monthly Operating Costs (Post-Launch)

| Service | Cost |
|---------|------|
| Vercel Pro | $20/mo |
| Neon Postgres | $19/mo |
| Vercel Blob | $9/mo |
| Resend | $0 (3K emails free) |
| Polar | $0 + 0.5% transaction fee |
| Domain | $1/mo |
| Sentry | $0 (free tier) |
| **Total** | **~$50/mo** |

### Break-Even Analysis

| Tier | Profit/User | Users Needed to Cover $50/mo |
|------|-------------|------------------------------|
| Starter | $19 | 3 users |
| Pro | $42 | 2 users |
| Agency | $86 | 1 user |

**Target:** 10 paying users = $420-860/mo profit (after API costs)

---

## Timeline Summary

| Week | Phase | Key Deliverables |
|------|-------|------------------|
| Week 1 | Fixes + Landing | Avatar edit, examples carousel |
| Week 2 | Payments Start | Pricing page, Polar integration |
| Week 3 | Payments Complete + Legal | Webhooks, TOS, Privacy Policy |
| Week 4 | Infrastructure | Domain, prod DB, monitoring |
| Week 5 | Testing + Launch | Beta testing, public launch |

---

## Next Steps

1. **Tomorrow:** Fix avatar edit button
2. **This week:** Generate example outputs for carousel
3. **Week 2:** Set up Polar sandbox, build pricing page
4. **Parallel:** Purchase domain (bermybanana.com?)

**Decision needed:**
- Domain name confirmation
- Do you want me to start with avatar fix + example generation now?
