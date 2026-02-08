import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getUserSubscription, getCreditAnalytics, canAffordGeneration } from '@/lib/polar'

// GET /api/user/subscription - Get user's subscription status
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const subscription = await getUserSubscription(user.id)
    
    return NextResponse.json({
      subscription,
      hasActiveSubscription: subscription?.status === 'active'
    })
    
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}