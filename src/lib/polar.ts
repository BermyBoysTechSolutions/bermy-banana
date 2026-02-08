import { PolarApi } from '@polar-sh/sdk'

// Polar configuration
const polar = new PolarApi({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  organizationId: process.env.POLAR_ORGANIZATION_ID!
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
    // Test connection
    const organization = await polar.organizations.get({
      id: process.env.POLAR_ORGANIZATION_ID!
    })
    
    console.log('✅ Polar connected:', organization.name)
    return true
  } catch (error) {
    console.error('❌ Polar connection failed:', error)
    return false
  }
}

// Get user subscription details
export async function getUserSubscription(userId: string) {
  try {
    const subscriptions = await polar.subscriptions.list({
      query: userId
    })
    
    return subscriptions.items?.[0] || null
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return null
  }
}

// Handle Polar webhook events
export async function handlePolarWebhook(event: any) {
  console.log('📨 Polar webhook received:', event.type)
  
  try {
    switch (event.type) {
      case 'subscription.created':
        await handleNewSubscription(event.data)
        break
        
      case 'subscription.updated':
        await handleSubscriptionUpdate(event.data)
        break
        
      case 'subscription.cancelled':
        await handleSubscriptionCancellation(event.data)
        break
        
      case 'subscription.revoked':
        await handleSubscriptionRevocation(event.data)
        break
        
      default:
        console.log('Unhandled event type:', event.type)
    }
    
    return { received: true }
  } catch (error) {
    console.error('Webhook handling error:', error)
    throw error
  }
}

// Handle new subscription
async function handleNewSubscription(data: any) {
  const { user_id, product_id, subscription_id } = data
  
  // Find the tier
  const tier = Object.values(SUBSCRIPTION_TIERS).find(t => t.id === product_id)
  if (!tier) {
    throw new Error(`Unknown product ID: ${product_id}`)
  }
  
  // Update user in database
  await updateUserSubscription(user_id, {
    polarSubscriptionId: subscription_id,
    tier: tier.name.toLowerCase(),
    credits: tier.credits,
    totalCredits: tier.credits,
    resetDate: getNextResetDate(),
    status: 'active'
  })
  
  console.log(`✅ New ${tier.name} subscription for user ${user_id}`)
}

// Handle subscription update
async function handleSubscriptionUpdate(data: any) {
  const { user_id, product_id, status } = data
  
  if (status === 'active') {
    // Check if they upgraded/downgraded
    const user = await getUserById(user_id)
    if (user?.polarProductId !== product_id) {
      // Tier changed - update credits
      const tier = Object.values(SUBSCRIPTION_TIERS).find(t => t.id === product_id)
      if (tier) {
        await updateUserCredits(user_id, tier.credits, tier.credits)
        console.log(`✅ User ${user_id} changed to ${tier.name} tier`)
      }
    }
  }
}

// Handle subscription cancellation
async function handleSubscriptionCancellation(data: any) {
  const { user_id } = data
  
  await updateUserSubscription(user_id, {
    status: 'cancelled',
    credits: 0
  })
  
  console.log(`⚠️ Subscription cancelled for user ${user_id}`)
}

// Handle subscription revocation
async function handleSubscriptionRevocation(data: any) {
  const { user_id } = data
  
  await updateUserSubscription(user_id, {
    status: 'revoked',
    credits: 0
  })
  
  console.log(`🚫 Subscription revoked for user ${user_id}`)
}

// Credit management
export async function deductCredits(userId: string, credits: number) {
  const user = await getUserById(userId)
  
  if (!user || user.credits < credits) {
    throw new Error('Insufficient credits')
  }
  
  await updateUserCredits(userId, user.credits - credits)
  
  // Log usage
  await logCreditUsage(userId, credits, 'video_generation')
  
  return {
    success: true,
    remainingCredits: user.credits - credits
  }
}

// Check if user can afford generation
export async function canAffordGeneration(userId: string, videoType: keyof typeof VIDEO_COSTS) {
  const user = await getUserById(userId)
  const cost = VIDEO_COSTS[videoType]
  
  return {
    canAfford: user?.credits >= cost,
    currentCredits: user?.credits || 0,
    requiredCredits: cost
  }
}

// Get credit usage analytics
export async function getCreditAnalytics(userId: string, days: number = 30) {
  const usage = await getCreditUsageHistory(userId, days)
  
  return {
    totalUsed: usage.reduce((sum, u) => sum + u.credits, 0),
    averageDaily: usage.length / days,
    byType: groupBy(usage, 'type'),
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

function groupBy(array: any[], key: string) {
  return array.reduce((groups, item) => {
    const group = groups[item[key]] || []
    group.push(item)
    groups[item[key]] = group
    return groups
  }, {})
}

// Database functions (implement these based on your schema)
async function updateUserSubscription(userId: string, data: any) {
  // Update user in your database
  // Implementation depends on your ORM (Prisma, Drizzle, etc.)
}

async function getUserById(userId: string) {
  // Fetch user from database
  // Should include: credits, subscription info, etc.
}

async function updateUserCredits(userId: string, credits: number) {
  // Update credit balance
}

async function logCreditUsage(userId: string, credits: number, type: string) {
  // Log credit usage for analytics
}

async function getCreditUsageHistory(userId: string, days: number) {
  // Get usage history for analytics
}

export default {
  initializePolar,
  getUserSubscription,
  handlePolarWebhook,
  deductCredits,
  canAffordGeneration,
  getCreditAnalytics
}