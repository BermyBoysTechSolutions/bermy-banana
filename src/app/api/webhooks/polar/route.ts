import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { handlePolarWebhook } from '@/lib/polar'

// Verify webhook signature
function verifyWebhookSignature(payload: string, signature: string): boolean {
  const crypto = require('crypto')
  const secret = process.env.POLAR_WEBHOOK_SECRET!
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
    
  return signature === `sha256=${expectedSignature}`
}

export async function POST(req: NextRequest) {
  try {
    const headersList = await headers()
    const signature = headersList.get('polar-signature')
    const body = await req.text()
    
    // Verify webhook signature
    if (!signature || !verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
    
    const event = JSON.parse(body)
    console.log('📨 Processing Polar webhook:', event.type)
    
    // Handle the webhook event
    await handlePolarWebhook(event)
    
    return NextResponse.json({ received: true })
    
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// For Vercel edge config
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'