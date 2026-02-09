import { Polar } from '@polar-sh/sdk'

// Polar configuration
const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
})

// Credit allocation by subscription tier
export const SUBSCRIPTION_TIERS = {
  STARTER: {
    price: 2500, // $25 in cents
    credits: 1000,
    name: 'Starter',
    id: process.env.POLAR_STARTER_PRODUCT_ID!
  },
  PRO: {
    price: 5900, // $59 in cents
    credits: 3000,
    name: 'Pro',
    id: process.env.POLAR_PRO_PRODUCT_ID!
  },
  AGENCY: {
    price: 12900, // $129 in cents
    credits: 8000,
    name: 'Agency',
    id: process.env.POLAR_AGENCY_PRODUCT_ID!
  }
}

// Video generation costs
export const VIDEO_COSTS = {
  VEO: 100,
  KLING_STANDARD: 150,
  KLING_PRO: 200
}

// Initialize Polar with your auth key
export async function initializePolar() {
  try {
    const organization = await polar.organizations.get({
      id: process.env.POLAR_ORGANIZATION_ID!
    })

    console.log('Polar connected:', organization.name)
    return true
  } catch (error) {
    console.error('Polar connection failed:', error)
    return false
  }
}

// Get user subscription details
export async function getUserSubscription(userId: string) {
  try {
    const result = await polar.subscriptions.list({
      organizationId: process.env.POLAR_ORGANIZATION_ID!,
    })

    // Iterate through pages to find user's subscription by customer ID
    for await (const page of result) {
      const items = page.result?.items ?? []
      const match = items.find((sub) => sub.customerId === userId)
      if (match) return match
    }
    return null
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return null
  }
}

// Handle Polar webhook events
export async function handlePolarWebhook(event: Record<string, unknown>) {
  const eventType = event.type as string
  const eventData = event.data as Record<string, unknown>
  console.log('Polar webhook received:', eventType)

  try {
    switch (eventType) {
      case 'subscription.created':
        await handleNewSubscription(eventData)
        break

      case 'subscription.updated':
        await handleSubscriptionUpdate(eventData)
        break

      case 'subscription.cancelled':
        await handleSubscriptionCancellation(eventData)
        break

      case 'subscription.revoked':
        await handleSubscriptionRevocation(eventData)
        break

      default:
        console.log('Unhandled event type:', eventType)
    }

    return { received: true }
  } catch (error) {
    console.error('Webhook handling error:', error)
    throw error
  }
}

// Handle new subscription
export async function handleNewSubscription(data: Record<string, unknown>) {
  const { user_id, product_id, subscription_id } = data as {
    user_id: string; product_id: string; subscription_id: string
  }

  const tier = Object.values(SUBSCRIPTION_TIERS).find(t => t.id === product_id)
  if (!tier) {
    throw new Error(`Unknown product ID: ${product_id}`)
  }

  await updateUserSubscription(user_id, {
    polarSubscriptionId: subscription_id,
    tier: tier.name.toLowerCase(),
    credits: tier.credits,
    totalCredits: tier.credits,
    resetDate: getNextResetDate(),
    status: 'active'
  })

  console.log(`New ${tier.name} subscription for user ${user_id}`)
}

// Handle subscription update
export async function handleSubscriptionUpdate(data: Record<string, unknown>) {
  const { user_id, product_id, status } = data as {
    user_id: string; product_id: string; status: string
  }

  if (status === 'active') {
    const tier = Object.values(SUBSCRIPTION_TIERS).find(t => t.id === product_id)
    if (tier) {
      await updateUserCredits(user_id, tier.credits)
      console.log(`User ${user_id} changed to ${tier.name} tier`)
    }
  }
}

// Handle subscription cancellation
export async function handleSubscriptionCancellation(data: Record<string, unknown>) {
  const { user_id } = data as { user_id: string }

  await updateUserSubscription(user_id, {
    status: 'cancelled',
    credits: 0
  })

  console.log(`Subscription cancelled for user ${user_id}`)
}

// Handle subscription revocation
export async function handleSubscriptionRevocation(data: Record<string, unknown>) {
  const { user_id } = data as { user_id: string }

  await updateUserSubscription(user_id, {
    status: 'revoked',
    credits: 0
  })

  console.log(`Subscription revoked for user ${user_id}`)
}

// Credit management
export async function deductCredits(userId: string, credits: number) {
  const userRecord = await getUserById(userId)

  if (!userRecord || userRecord.credits < credits) {
    throw new Error('Insufficient credits')
  }

  await updateUserCredits(userId, userRecord.credits - credits)
  await logCreditUsage(userId, credits, 'video_generation')

  return {
    success: true,
    remainingCredits: userRecord.credits - credits
  }
}

// Check if user can afford generation
export async function canAffordGeneration(userId: string, videoType: keyof typeof VIDEO_COSTS) {
  const userRecord = await getUserById(userId)
  const cost = VIDEO_COSTS[videoType]

  return {
    canAfford: (userRecord?.credits ?? 0) >= cost,
    currentCredits: userRecord?.credits ?? 0,
    requiredCredits: cost
  }
}

// Get user's credit balance
export async function getUserCredits(userId: string): Promise<{
  current: number;
  total: number;
  resetDate: Date;
}> {
  const userRecord = await getUserById(userId)

  return {
    current: userRecord?.creditsRemaining ?? 0,
    total: userRecord?.creditsTotal ?? 0,
    resetDate: getNextResetDate()
  }
}

// Get credit usage analytics
export async function getCreditAnalytics(userId: string, days: number = 30) {
  const usage = await getCreditUsageHistory(userId, days)

  return {
    totalUsed: usage.reduce((sum: number, u: { credits: number }) => sum + u.credits, 0),
    averageDaily: usage.length / days,
    remaining: await getUserCredits(userId)
  }
}

// Helper functions
function getNextResetDate(): Date {
  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  nextMonth.setDate(1)
  return nextMonth
}

// Database functions (TODO: implement with Drizzle ORM)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function updateUserSubscription(_userId: string, _data: Record<string, unknown>) {
  // TODO: implement with Drizzle
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getUserById(_userId: string): Promise<{
  credits: number;
  creditsRemaining: number;
  creditsTotal: number;
  polarProductId?: string;
} | null> {
  // TODO: implement with Drizzle
  return null
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function updateUserCredits(_userId: string, _credits: number) {
  // TODO: implement with Drizzle
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function logCreditUsage(_userId: string, _credits: number, _type: string) {
  // TODO: implement with Drizzle
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getCreditUsageHistory(_userId: string, _days: number): Promise<Array<{ credits: number; type: string }>> {
  // TODO: implement with Drizzle
  return []
}

export default {
  initializePolar,
  getUserSubscription,
  handlePolarWebhook,
  deductCredits,
  canAffordGeneration,
  getCreditAnalytics,
  handleNewSubscription,
  handleSubscriptionUpdate,
  handleSubscriptionCancellation,
  handleSubscriptionRevocation
}
