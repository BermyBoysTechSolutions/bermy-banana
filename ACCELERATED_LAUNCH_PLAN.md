# Bermy Banana — ACCELERATED Launch Plan
## Speed to Market: 2-Week Sprint to Production

**⚡ PRIORITY: Launch fast, iterate after.**

---

## Week 1: Core Functionality (Days 1-7)

### Day 1: Avatar Fix + Landing Page Carousel
**Avatar Edit Button Fix (2 hours)**
- Fix `/app/avatars/page.tsx` — add name editing + image replacement
- Update API route to handle image updates
- Deploy immediately

**Landing Page Carousel (4 hours)**
- Install `embla-carousel-react`
- Create carousel component with auto-scroll
- Add 6 placeholder slots for examples
- Deploy

**Deliverable:** Working avatar edit + carousel skeleton live

---

### Day 2-3: Payments Infrastructure
**Polar Setup (Day 2)**
- Create Polar sandbox account
- Create 3 products:
  - Starter: $25/mo, 1,000 credits
  - Pro: $59/mo, 3,000 credits  
  - Agency: $129/mo, 8,000 credits

**Pricing Page (Day 2-3)**
- Build `/pricing` with 3-tier cards
- Feature comparison table
- "Get Started" CTA buttons

**Checkout Integration (Day 3)**
- Integrate `@polar-sh/checkout`
- Test checkout flow in sandbox

**Deliverable:** Pricing page + working checkout (test mode)

---

### Day 4: Webhooks + Quota System
**Webhook Handlers**
- `/api/webhooks/polar` endpoint
- Handle: subscription.created, cancelled, past_due
- Update user tier in database

**Credit System**
- Replace daily quotas with credit system
- Video = 100 credits/scene
- Image = 50 credits
- Free tier = 200 credits (no signup required)

**Deliverable:** Payments fully functional end-to-end

---

### Day 5: Legal Pages (Use Templates)
**Terms of Service**
- Use https://www.termsofusegenerator.net/ or similar
- Customize for Bermy Banana
- Route: `/terms`

**Privacy Policy**
- Use https://www.privacypolicygenerator.info/
- Include: data collected, third parties, retention
- Route: `/privacy`

**Cookie Banner**
- Simple bottom banner
- "Accept" dismisses it

**Deliverable:** All legal pages live

---

### Day 6: Email Infrastructure
**Resend Setup**
- Create account, verify domain (use bermybanana.com or temp domain)
- Install `resend` package

**Essential Emails Only**
1. Welcome email (after signup)
2. Generation complete (with download link)
3. Quota exhausted (with upgrade CTA)

**Skip for now:** Subscription confirmations, marketing emails

**Deliverable:** 3 core emails working

---

### Day 7: Mid-Week Deploy + Test
**Deploy to Production**
- Set up Vercel production project
- Configure env vars
- Deploy main branch

**Testing**
- Sign up → Create avatar → Generate content
- Verify payments work (test mode)
- Check emails arrive

**Deliverable:** Live production URL with all Week 1 features

---

## Week 2: Launch Prep (Days 8-14)

### Day 8-9: Domain + Production Database
**Domain Setup**
- Purchase bermybanana.com (or chosen domain)
- Configure DNS with Vercel
- Enable SSL

**Production Database**
- Create Neon Postgres production instance
- Run migrations
- Copy dev data or start fresh

**Update Environment**
- Switch Polar to production keys
- Switch Resend to production
- Update `NEXT_PUBLIC_APP_URL`

**Deliverable:** Production site on custom domain

---

### Day 10: Generate Example Content
**Create Sample Outputs**
- Generate 3 influencer photos (Mode B)
- Generate 2 UGC videos (Mode A, 3 scenes each)
- Generate 1 product video (Mode C)
- Convert videos to GIFs for carousel

**Upload to Carousel**
- Add real examples to landing page
- Watermark with "Made with Bermy Banana"

**Deliverable:** Carousel populated with actual examples

---

### Day 11: Soft Launch
**Invite-Only Beta**
- Share with 5-10 friends/family
- Collect feedback via Telegram/Discord
- Fix critical bugs immediately

**Monitor**
- Check error logs (Sentry)
- Track conversion funnel

**Deliverable:** Real users testing the product

---

### Day 12-13: Polish + Fixes
**Quick Wins from Feedback**
- Fix any broken flows
- Improve error messages
- Add loading states if missing

**Marketing Prep**
- Write Twitter/X launch thread
- Prepare Product Hunt listing
- Create demo video/GIF (30 seconds)

---

### Day 14: PUBLIC LAUNCH 🚀

**Launch Day Checklist**
- [ ] Final smoke test (signup → payment → generate)
- [ ] Enable Polar live mode
- [ ] Post on Twitter/X
- [ ] Post on Reddit (r/SaaS, r/InternetIsBeautiful)
- [ ] Share with personal network
- [ ] Submit to Product Hunt (if ready)

**Post-Launch**
- Monitor for 24 hours
- Respond to all feedback
- Fix critical issues immediately

---

## Cut Scope to Accelerate

### What's IN (Launch Critical)
✅ Avatar create/edit/delete
✅ Product upload
✅ All 3 generation modes
✅ Payments (Polar)
✅ Credit system
✅ Pricing page
✅ Legal pages (TOS, Privacy)
✅ Welcome + generation emails
✅ Landing page carousel
✅ Domain + SSL

### What's OUT (Post-Launch)
❌ Video concatenation (users get separate clips + script)
❌ Progress tracking (show "processing..." only)
❌ Subscription management page (use Polar customer portal)
❌ Advanced email sequences
❌ Rate limiting (add if abuse occurs)
❌ Admin dashboard polish
❌ FAQ page
❌ Testimonials (use example outputs instead)

---

## Tech Stack Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Payments** | Polar | Fastest integration, built for SaaS |
| **Domain** | Vercel | One-click SSL, instant deploys |
| **Database** | Neon | Serverless Postgres, $0 to start |
| **Email** | Resend | Free tier, simple API |
| **Storage** | Vercel Blob | Already configured |
| **Monitoring** | Vercel Analytics | Built-in, free |

---

## Daily Operating Cost (Post-Launch)

| Service | Cost |
|---------|------|
| Vercel Pro | $20/mo |
| Neon Postgres | $0 (free tier) |
| Vercel Blob | $0 (free tier) |
| Resend | $0 (3K emails) |
| Polar | $0 + 0.5% fee |
| Domain | $12/year |
| **Total** | **~$21/mo** |

**Break-even:** 1 Starter subscriber ($25/mo) covers all costs.

---

## Success Metrics (Week 2)

| Metric | Target |
|--------|--------|
| Signups | 50+ |
| Paying Customers | 5+ |
| Content Generated | 100+ videos/images |
| MRR | $125+ |

---

## Daily Schedule

**Week 1:** Build mode — 6-8 hours/day coding
**Week 2:** Launch mode — 4 hours coding, 2 hours marketing/feedback

---

## Contingency Plans

**If payments are complex:**
- Use Stripe instead (more docs, longer setup)
- OR: Launch with free tier only, add payments in Week 3

**If generation is buggy:**
- Limit to 3 scenes max per video
- Disable audio generation initially

**If no domain ready:**
- Launch on Vercel subdomain (bermy-banana.vercel.app)
- Migrate to custom domain later

---

## Post-Launch Roadmap (Weeks 3-6)

| Week | Focus |
|------|-------|
| Week 3 | Video concatenation, customer feedback |
| Week 4 | Product Hunt launch, marketing |
| Week 5 | Feature requests, retention |
| Week 6 | Scale infrastructure if needed |

---

## Bottom Line

**Launch date:** February 18, 2026 (2 weeks from now)
**Motto:** Ship it, then fix it.
**Goal:** First paying customer by Day 10.

---

*Generated: 2026-02-04*
*Strategy: Speed to Market #1 Priority*
