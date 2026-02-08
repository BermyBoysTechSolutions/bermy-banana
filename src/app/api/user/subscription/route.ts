import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getUserSubscription } from '@/lib/polar'

// GET /api/user/subscription - Get user's subscription status
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const subscription = await getUserSubscription(session.user.id)
    
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