# Vercel Build Fix Report — February 8, 2026

**Project:** Bermy Banana (AI-Powered UGC Generation Platform)
**Issue:** Vercel builds failing for 17+ hours across 20+ deployments
**Resolution:** 3 commits across 4 key issues
**Result:** Build succeeds, dashboard functional, Kling AI selector working

---

## Commits

1. `7fad395` — Fix Vercel build: resolve TypeScript and SDK compatibility errors
2. `8b1803b` — Remove unused use-polar.ts hook breaking Vercel build
3. `5f5d9d4` — Fix dashboard crash: query credits directly from DB instead of stubs

---

## Issue 1: Unused `p-timeout` import in Kling provider

**File:** `src/lib/providers/kling.ts`
**Problem:** `import poll from 'p-timeout'` — the package was never added to `package.json` and the import was unused (the class has its own `poll` method).
**Fix:** Removed the import line.

## Issue 2: Deprecated Next.js 16 config option

**File:** `next.config.ts`
**Problem:** `experimental.serverComponentsExternalPackages` was renamed to top-level `serverExternalPackages` in Next.js 16. The old key caused Turbopack to emit `serverExternalPackages: invalid type: map, expected a sequence`.
**Fix:** Moved `['@polar-sh/sdk']` to `serverExternalPackages` at the config root and removed the `experimental` block.

## Issue 3: Polar SDK API mismatches

**File:** `src/lib/polar.ts`
**Problem:** Multiple issues:
- Imported `PolarApi` which doesn't exist in `@polar-sh/sdk` v0.42 — the class is `Polar`
- Constructor passed `organizationId` which isn't a valid option
- `subscriptions.list()` was called with `{ query: userId }` — the correct parameter is `{ organizationId }`
- The page iterator was used incorrectly (iterating items directly instead of pages)
- `userId` field doesn't exist on the `Subscription` type — it's `customerId`
- All database helper functions (`getUserById`, `updateUserSubscription`, etc.) were unimplemented stubs returning `undefined`/`null`, causing downstream type errors and runtime failures

**Fix:** Rewrote `polar.ts` with correct SDK usage, proper types, and properly typed stub functions that return safe defaults.

## Issue 4: Unused `use-polar.ts` hook

**File:** `src/hooks/use-polar.ts`
**Problem:** This file imported `@polar-sh/checkout` and `@stripe/stripe-js`, neither of which are in `package.json`. The file was deleted locally during a previous fix attempt but the deletion was never committed, so Vercel still had the file.
**Fix:** `git rm` to remove from the repository.

## Issue 5: Miscellaneous TypeScript strict mode failures

**Files:** `src/lib/credits.ts`, `src/lib/services/generation.ts`
**Problem:**
- `getCreditCost()` had an unused `tier` parameter
- `generation.ts` had an unused `generateVideo` import and unused `videoGenerator` parameter
**Fix:** Removed unused import, removed unused parameter from `getCreditCost`, prefixed `_videoGenerator` in `canUserGenerate`.

## Issue 6: Dashboard runtime crash (post-build)

**File:** `src/app/api/user/credits/route.ts`
**Problem:** The API route called `getUserCredits()` from `polar.ts`, which used the stubbed `getUserById()` that always returned `null`. The API responded with `{ current: 0, total: 0, resetDate }` but the dashboard component expected `{ creditsRemaining, creditsTotal, subscriptionTier, subscriptionStatus }`. Accessing `.creditsRemaining.toLocaleString()` on `undefined` threw a runtime error caught by the error boundary.
**Fix:** Rewrote the credits API route to query the `user` table directly via Drizzle ORM, returning the exact field names the dashboard expects.

---

## Pre-existing changes included

The first commit also included fixes from earlier attempts that were unstaged:
- Removed duplicate `import { createKlingProvider }` in `src/app/api/generate/kling/route.ts`
- Fixed `users` → `user` schema references and `credits` → `creditsRemaining` field names
- Added null safety checks for polling status in the Kling GET endpoint
- Added `axios` to `package.json` dependencies (used by Kling provider)
- Minor fixes in `mode-a.tsx`, `mode-c.tsx`, `webhooks/polar/route.ts`, `subscription/route.ts`

---

## Files changed (total across all commits)

- `next.config.ts` — Config migration for Next.js 16
- `package.json` — Added axios dependency
- `src/lib/providers/kling.ts` — Removed bad import
- `src/lib/polar.ts` — Full rewrite with correct SDK usage
- `src/lib/credits.ts` — Removed unused parameter
- `src/lib/services/generation.ts` — Removed unused imports/params
- `src/app/api/user/credits/route.ts` — Direct DB query instead of stubs
- `src/app/api/user/subscription/route.ts` — Schema reference fixes
- `src/app/api/generate/kling/route.ts` — Duplicate import, schema fixes
- `src/app/api/webhooks/polar/route.ts` — Minor fixes
- `src/components/generate/mode-a.tsx` — Minor fixes
- `src/components/generate/mode-c.tsx` — Minor fixes
- `src/hooks/use-polar.ts` — Deleted (unused, missing dependencies)

---

## Outstanding items

- `polar.ts` database helper functions are still stubs (TODO: implement with Drizzle)
- The `getUserSubscription()` function matches by `customerId` but the app may need a mapping from app user IDs to Polar customer IDs
- 2 pre-existing lint errors remain (HTML `<a>` tag instead of `<Link>`, React setState in effect) — not related to these changes
- `use-polar.ts.disabled` file exists locally and should be cleaned up
