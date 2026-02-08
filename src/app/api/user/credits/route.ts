import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getUserCredits, deductCredits } from '@/lib/polar'

// GET /api/user/credits - Get user's credit balance
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const creditInfo = await getUserCredits(session.user.id)
    
    if (!creditInfo) {
      return NextResponse.json({ error: 'No credit information found' }, { status: 404 })
    }
    
    // Check affordability for each video type
    const canGenerate = {
      veo: creditInfo.current >= 100,
      klingStandard: creditInfo.current >= 150,
      klingPro: creditInfo.current >= 200
    }
    
    return NextResponse.json({
      current: creditInfo.current,
      total: creditInfo.total,
      resetDate: creditInfo.resetDate,
      canGenerate
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
    const user = await auth.api.getSession({ headers: req.headers })
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const { credits } = await req.json()
    
    if (!credits || credits <= 0) {
      return NextResponse.json(
        { error: 'Invalid credit amount' },
        { status: 400 }
      )
    }
    
    const result = await deductCredits(user.user.id, credits)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        remainingCredits: result.remainingCredits
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to deduct credits' },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('Error deducting credits:', error)
    return NextResponse.json(
      { error: 'Failed to deduct credits' },
      { status: 500 }
    )
  }
}