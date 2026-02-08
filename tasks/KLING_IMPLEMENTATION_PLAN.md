# Claude Code: Kling AI Implementation - URGENT
## Bermy Banana — AI Video Generation

**Priority:** CRITICAL
**Deadline:** TODAY (February 7, 2026)
**Execution:** Agent Teams (Parallel)
**From:** Sultan Yahya (CEO)
**Via:** CSO (Ibrahim Paşa)

---

## Organizational Context

```
CEO: Sultan Yahya
     │
     ▼
CSO: Ibrahim Paşa (Kimi K2)
     │
     ▼
You: Claude (Opus 4.6) ← Execute this task TODAY
     │
     ▼
Agent Team ← Spawn sub-agents for parallel execution
```

---

## ⚡ SPEED TO MARKET PRIORITY

**Complete by end of day. Use agent teams for parallel execution.**

---

## What We Need

### Feature Summary
- Add Kling AI as **two options** within Mode A and Mode C
- Users choose: **Veo OR Kling Standard OR Kling Pro**
- Credit costs:
  - **Veo:** 100 credits
  - **Kling Standard:** 150 credits  
  - **Kling Pro:** 300 credits
- **Dynamic credit display** showing cost of current selection

### Credit Pricing
| Provider | Mode | Credits |
|----------|------|---------|
| Veo | Standard | 100 |
| Kling | Standard | 150 |
| Kling | Pro | 300 |

### UI Pattern
```
[Mode A: Talking Head Video]

┌─────────────────────────────────────┐
│ Script Input                        │
│ [_________________________]        │
├─────────────────────────────────────┤
│ Video Provider:                     │
│ ○ Veo     ● Kling Standard    ○ Kling Pro
│                                      │
│ 💰 Cost: 150 credits                  │
├─────────────────────────────────────┤
│ [Generate Video Button]             │
│                    Cost: 150 credits│
└─────────────────────────────────────┘
```

---

## Your Decision Authority

| Action | Authority |
|--------|-----------|
| Implement Kling provider | ✅ Autonomous |
| Add 3-option toggle to Mode A/C | ✅ Autonomous |
| Update credit system (100/150/300) | ✅ Autonomous |
| Deploy to production | ❌ Requires CEO approval |

---

## Execution: Agent Teams (Parallel)

**Spawn sub-agents immediately. Divide and conquer.**

### Team Structure
```
Claude (Lead Engineer)
    │
    ├── Backend Agent 1 ───┬── Kling Provider
    │                      └── API Routes
    │
    ├── Backend Agent 2 ───┬── Credit System Update
    │                      └── Credit Display
    │
    └── Frontend Agent ────┬── Mode A Integration
                           ├── Mode C Integration
                           └── 3-Option Provider Toggle
```

### Instructions for Sub-Agents

**Backend Agent 1 (Kling Provider + API):**
```
Implement Kling AI video generation provider.

1. Create src/lib/providers/kling.ts following veo.ts pattern
2. Implement generate() with async polling
3. Create src/app/api/generate/kling/route.ts
4. Test with actual API call
5. Return task_id for polling

Requirements:
- Async video generation with polling
- Support Standard (150 credits) and Pro (300 credits)
- Support 5-10 second videos
- 9:16 and 16:9 aspect ratios
- Error handling like Veo
```

**Backend Agent 2 (Credit System):**
```
Update Bermy Banana credit system for Kling.

1. Add credit constants:
   - KLING_STANDARD_COST = 150
   - KLING_PRO_COST = 300
2. Update credit deduction logic for both tiers
3. Update credit usage display to show Kling tiers
4. Add Kling tiers to credit breakdown charts
5. Verify Veo still works

Requirements:
- 150 credits (Kling Standard)
- 300 credits (Kling Pro)
- Same credit flow as Veo
- Display tier-specific usage in dashboard
```

**Frontend Agent (Mode A + Mode C + Toggle):**
```
Add Kling provider toggle to Mode A and Mode C.

Mode A (Talking Head Video):
1. Add 3-option toggle: Veo ○ Kling Standard ● Kling Pro ○
2. Store selected provider + tier in form state
3. Pass provider to API (veo, kling-standard, kling-pro)
4. Show dynamic credit cost (100 / 150 / 300)
5. Display video preview when ready

Mode C (Video + Image):
1. Add same 3-option toggle
2. Update form submission
3. Show selected provider badge + tier
4. Dynamic credit display based on selection

Requirements:
- 3-way toggle (Veo, Kling Standard, Kling Pro)
- Visual indicator of selected provider
- Dynamic credit cost display
- Works exactly like Veo flow
```

---

## Technical Requirements

### Kling Provider (`src/lib/providers/kling.ts`)

**Configuration (from `.env.local`):**
```typescript
// Use these env vars:
process.env.KLING_ACCESS_KEY
process.env.KLING_SECRET_KEY
process.env.KLING_API_URL  // https://api.kling.ai/v1
```

```typescript
interface KlingConfig {
  accessKey: string  // From KLING_ACCESS_KEY
  secretKey: string  // From KLING_SECRET_KEY
  baseUrl: string    // From KLING_API_URL
}

interface KlingGenerateParams {
  prompt: string
  duration?: number  // 5-10 seconds
  aspectRatio?: '9:16' | '16:9'
  tier?: 'standard' | 'pro'  // NEW
}

class KlingProvider {
  // Generate video
  generate(params: KlingGenerateParams): Promise<{
    taskId: string
    creditsUsed: number  // 150 (standard) or 300 (pro)
  }>

  // Poll for completion
  poll(taskId: string): AsyncGenerator<{
    status: 'pending' | 'processing' | 'completed' | 'failed'
    progress?: number
    resultUrl?: string
    error?: string
  }>

  // Cancel
  cancel(taskId: string): Promise<void>
}
```

### Credit Cost
```typescript
const CREDIT_COSTS = {
  VEO: 100,
  KLING_STANDARD: 150,  // NEW
  KLING_PRO: 300,       // NEW
}
```

### Mode A Integration
```typescript
interface ModeAFormState {
  script: string
  avatarId: string
  provider: 'veo' | 'kling-standard' | 'kling-pro'  // NEW
  tier?: 'standard' | 'pro'  // For Kling
  referenceImage?: string
}
```

---

## File Changes Summary

### New Files
| File | Purpose |
|------|---------|
| `src/lib/providers/kling.ts` | Kling provider implementation |
| `src/app/api/generate/kling/route.ts` | Kling API endpoints |

### Modified Files
| File | Changes |
|------|---------|
| `src/lib/credits.ts` | Add Kling Standard (150) + Pro (300) |
| `src/components/generate/mode-a.tsx` | Add 3-option toggle + dynamic display |
| `src/components/generate/mode-c.tsx` | Add 3-option toggle + dynamic display |
| `src/app/page.tsx` | Update if needed |

### Test Files
| File | Purpose |
|------|---------|
| `src/lib/providers/__tests__/kling.test.ts` | Provider unit tests |
| `src/app/api/generate/__tests__/kling.test.ts` | API integration tests |

---

## Execution Steps

### Step 1: Spawn Agent Team (IMMEDIATE)
```
Spawn 3 sub-agents:
- Backend Agent 1: Kling Provider + API
- Backend Agent 2: Credit System (150/300)
- Frontend Agent: Mode A + Mode C + 3-option toggle

Use: Claude Code Agent Teams feature
Coordination: Shared task list
Deadline: End of TODAY
```

### Step 2: Provider Implementation
```
Backend Agent 1:
1. Create kling.ts provider
2. Follow veo.ts pattern exactly
3. Implement async polling
4. Support Standard + Pro tiers
5. Create API route
6. Test with real API
```

### Step 3: Credit Update
```
Backend Agent 2:
1. Add KLING_STANDARD_COST = 150
2. Add KLING_PRO_COST = 300
3. Update credit deduction logic
4. Update display components
5. Verify Veo still works
```

### Step 4: Frontend Integration
```
Frontend Agent:
1. Add 3-option toggle to Mode A
2. Add 3-option toggle to Mode C
3. Dynamic credit cost display
4. Update form submission
5. Test provider switching
6. Verify credit display updates
```

### Step 5: Verification (BEFORE DONE)
```
All agents:
1. Run: pnpm run lint && pnpm run typecheck
2. Test end-to-end flow
3. Verify credit deduction (100/150/300)
4. Check error handling
5. Report to Claude (Lead)
```

---

## Critical Rules

1. **WORK IN PARALLEL** — Spawn all agents NOW
2. **Veo must still work** — Don't break existing functionality
3. **Dynamic credit display** — Show cost based on selection
4. **3 options only** — Veo, Kling Standard, Kling Pro
5. **Done TODAY** — No delays, no scope creep

---

## Communication

### Sub-Agent Output → Claude (Lead)
```
Each agent returns:
- Files created/modified
- Test results
- Any blockers
- "Ready for review" status
```

### Claude → CSO
```
After all agents complete:
- Summarize changes
- Request deployment approval
- List files for git commit
```

---

## Success Criteria

- [ ] Kling provider implemented and tested
- [ ] Mode A has 3-option toggle (Veo, Kling Standard, Kling Pro)
- [ ] Mode C has 3-option toggle
- [ ] Dynamic credit display (100/150/300)
- [ ] Veo still works (no regression)
- [ ] All lint + typecheck pass
- [ ] Deployed to production (pending CEO approval)

---

## Questions? (Answered)

| Question | Answer |
|----------|--------|
| How many options? | 3: Veo, Kling Standard, Kling Pro |
| Credit costs? | Veo=100, Kling Standard=150, Kling Pro=300 |
| Display cost? | Yes, dynamic based on selection |
| Free trial for Kling? | No — $9 trial tier applies to all |
| Max concurrent? | No limit (credit-based only) |

---

## Before You Start

1. Read current Veo provider: `src/lib/providers/veo.ts`
2. Read Mode A component: `src/components/generate/mode-a.tsx`
3. Read credit system: `src/lib/credits.ts`
4. Spawn agent team NOW
5. Begin implementation

---

## After Completion

Report to CSO:
1. Files created/modified
2. Test results
3. Any issues found
4. Ready for deployment (pending CEO approval)

---

## Reference Files

- Provider pattern: `src/lib/providers/veo.ts`
- API pattern: `src/app/api/generate/veo/route.ts`
- Credit system: `src/lib/credits.ts`
- Mode A: `src/components/generate/mode-a.tsx`
- Mode C: `src/components/generate/mode-c.tsx`

---

**⚡ MOVE FAST. DONE TODAY.**
