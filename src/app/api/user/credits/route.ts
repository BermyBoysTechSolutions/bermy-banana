import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/schema'
import { eq } from 'drizzle-orm'

// GET /api/user/credits - Get user's credit balance
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const [userRecord] = await db
      .select({
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus,
        creditsRemaining: user.creditsRemaining,
        creditsTotal: user.creditsTotal,
      })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1)

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      subscriptionTier: userRecord.subscriptionTier,
      subscriptionStatus: userRecord.subscriptionStatus,
      creditsRemaining: userRecord.creditsRemaining,
      creditsTotal: userRecord.creditsTotal,
      canGenerate: {
        veo: userRecord.creditsRemaining >= 100,
        klingStandard: userRecord.creditsRemaining >= 150,
        klingPro: userRecord.creditsRemaining >= 200,
      },
    })

  } catch (error) {
    console.error('Error fetching credits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch credits' },
      { status: 500 }
    )
  }
}

// POST /api/user/credits/deduct - Deduct credits for generation
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { credits } = await req.json()

    if (!credits || credits <= 0) {
      return NextResponse.json(
        { error: 'Invalid credit amount' },
        { status: 400 }
      )
    }

    const [userRecord] = await db
      .select({ creditsRemaining: user.creditsRemaining })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1)

    if (!userRecord || userRecord.creditsRemaining < credits) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 402 }
      )
    }

    await db
      .update(user)
      .set({ creditsRemaining: userRecord.creditsRemaining - credits })
      .where(eq(user.id, session.user.id))

    return NextResponse.json({
      success: true,
      remainingCredits: userRecord.creditsRemaining - credits,
    })

  } catch (error) {
    console.error('Error deducting credits:', error)
    return NextResponse.json(
      { error: 'Failed to deduct credits' },
      { status: 500 }
    )
  }
}
