# Tier-Based Feature Access — Branch Summary

**Branch:** `feature/tier-based-access`
**Base:** `master` (commit `f074dee`)
**Status:** Pushed to GitHub, Vercel preview deploying automatically
**Preview URL:** https://bermy-banana-git-feature-60f6a2-bermyboystechsolutions-projects.vercel.app

---

## What Changed

### New Files

1. **`src/lib/features.ts`** — Feature flag system
   - `FEATURE_MAP` defines which tiers can access which video models
   - Free/Trial/Starter: Veo only
   - Pro/Agency: Veo + Kling Standard + Kling Pro
   - Exports: `hasFeatureAccess()`, `hasKlingAccess()`, `getLockedFeatures()`, `getFeatureMap()`

2. **`src/hooks/use-tier-features.ts`** — React hook for components
   - Fetches user's effective tier from `/api/user/credits`
   - Returns `hasAccess(feature)`, `hasKling`, `lockedFeatures`, `featureMap`, `loading`

3. **`drizzle/0007_add_admin_tier.sql`** — Database migration
   - Adds `admin_tier` nullable text column to `user` table
   - **MUST be run manually** — paste `ALTER TABLE "user" ADD COLUMN "admin_tier" text;` in Neon SQL console

### Modified Files

4. **`src/lib/schema.ts`** — Added `adminTier` column to user table definition

5. **`src/lib/credits.ts`** — Fixed `KLING_PRO` cost from 300 → 200 (was inconsistent with `polar.ts` and `mode-a.tsx`)

6. **`src/app/api/user/credits/route.ts`** — Credits API now:
   - Reads `adminTier` from DB
   - Resolves `effectiveTier = adminTier ?? subscriptionTier`
   - Returns `effectiveTier` and `features` map in response

7. **`src/components/generate/mode-a.tsx`** — Video model selector now:
   - Uses `useTierFeatures()` hook to check access
   - Kling Standard/Pro show lock overlay + "Upgrade to Pro" for restricted tiers
   - Clicking locked model redirects to `/pricing?upgrade=true`
   - "Recommended" badge moved from Veo → Kling Pro
   - Kling Pro cost displays as 200 (was showing 200 already, now consistent everywhere)

8. **`src/app/admin/page.tsx`** — Admin dashboard now:
   - Shows effective tier badge per user row
   - Shows orange "Test" badge when `adminTier` is set
   - Actions dropdown has "Tier Override" section: Trial/Starter/Pro/Agency/Clear Override
   - Calls PATCH `/api/admin/users/[id]` with `adminTier` field

9. **`src/app/api/admin/users/[id]/route.ts`** — PATCH endpoint now:
   - Accepts `adminTier` field (string | null)
   - Validates against allowed tiers
   - Logs `ADMIN_SET_TIER_OVERRIDE` audit action

10. **`src/app/pricing/page.tsx`** — Each tier card now shows "AI Video Models" section:
    - Trial/Starter: checkmark for Veo, X for "Kling Standard & Pro (Pro plan required)"
    - Pro/Agency: checkmark for both Veo and Kling

11. **`src/lib/auth.ts`** — Added `VERCEL_URL` and `VERCEL_BRANCH_URL` to `trustedOrigins` for preview deployments

12. **`src/lib/auth-client.ts`** — Client-side auth now uses `window.location.origin` so preview deployments don't send auth requests to the wrong URL

---

## Database Migration Required

The `adminTier` column must be added to the database before the admin tier override feature works. Run this in the **Neon SQL console**:

```sql
ALTER TABLE "user" ADD COLUMN "admin_tier" text;
```

The feature flag system and UI gating work without this migration (they just use `subscriptionTier`), but admin overrides won't persist until the column exists.

---

## What Still Needs Testing

- [ ] Sign in works on preview deployment (was getting "Invalid origin" — fix pushed)
- [ ] Trial/Starter user sees Kling models greyed out with lock icon + "Upgrade to Pro"
- [ ] Pro/Agency user sees all models accessible
- [ ] Admin sets user tier override → models unlock immediately for that user
- [ ] Pricing page shows video model access per tier correctly
- [ ] "Recommended" badge only appears on Kling Pro
- [ ] Clicking locked model redirects to `/pricing?upgrade=true`
- [ ] Admin "Clear Override" removes the test badge and reverts to subscription tier

---

## How to Merge

Once testing passes, merge to master via PR:
https://github.com/BermyBoysTechSolutions/bermy-banana/pull/new/feature/tier-based-access

Or from CLI:
```bash
gh pr create --base master --head feature/tier-based-access --title "Add tier-based feature access for video models"
```
