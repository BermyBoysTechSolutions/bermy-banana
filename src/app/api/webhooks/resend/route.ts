/**
 * Resend Webhook Handler
 * 
 * Handles email status events from Resend:
 * - email.delivered: Email successfully delivered
 * - email.bounced: Email bounced
 * - email.complained: User marked as spam
 * - email.opened: Email was opened (if open tracking enabled)
 * - email.clicked: Link was clicked (if click tracking enabled)
 * 
 * Documentation: https://resend.com/docs/dashboard/webhooks
 */

import { NextRequest, NextResponse } from 'next/server';

// Resend webhook signing secret for verification
const RESEND_WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET;

interface ResendWebhookPayload {
  type: 'email.delivered' | 'email.bounced' | 'email.complained' | 'email.opened' | 'email.clicked';
  created_at: string;
  data: {
    id: string;
    to: string | string[];
    from: string;
    subject: string;
    created_at: string;
    // For delivered/bounced/complained
    delivered_at?: string;
    // For bounced
    bounce_type?: 'hard' | 'soft';
    bounce_message?: string;
    // For opened/clicked
    clicked_at?: string;
    open_count?: number;
    last_opened_at?: string;
    // Additional metadata
    tags?: { name: string; value: string }[];
  };
}

/**
 * Verify webhook signature from Resend
 * 
 * Note: Resend uses a signing secret to verify webhooks.
 * The signature is sent in the 'svix-signature' header.
 * For now, we do basic validation. Full signature verification
 * can be added when Resend provides more documentation.
 */
function verifyWebhookSignature(
  _payload: string,
  signature: string | null,
  secret: string
): boolean {
  try {
    // If no secret configured, skip verification in development
    if (!secret) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Resend Webhook] Skipping signature verification in development');
        return true;
      }
      return false;
    }

    // If no signature provided, reject
    if (!signature) {
      console.error('[Resend Webhook] No signature provided');
      return false;
    }

    // TODO: Implement full signature verification when Resend provides
    // more detailed documentation on their webhook signing method
    // For now, we check if the secret matches our expected format
    if (secret.startsWith('whsec_')) {
      // Svix-style webhook verification would go here
      // This requires the svix library or custom HMAC verification
      console.warn('[Resend Webhook] Full signature verification not yet implemented');
      return true; // Allow through for now
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Handle email delivered event
 */
async function handleEmailDelivered(payload: ResendWebhookPayload): Promise<void> {
  console.log('[Resend Webhook] Email delivered:', {
    id: payload.data.id,
    to: payload.data.to,
    subject: payload.data.subject,
    deliveredAt: payload.data.delivered_at,
  });

  // TODO: Update email status in database if tracking emails
  // await updateEmailStatus(payload.data.id, 'delivered', {
  //   deliveredAt: payload.data.delivered_at,
  // });
}

/**
 * Handle email bounced event
 */
async function handleEmailBounced(payload: ResendWebhookPayload): Promise<void> {
  console.warn('[Resend Webhook] Email bounced:', {
    id: payload.data.id,
    to: payload.data.to,
    bounceType: payload.data.bounce_type,
    bounceMessage: payload.data.bounce_message,
  });

  // TODO: Handle bounce appropriately
  // - Mark email as bounced in database
  // - Potentially mark user email as invalid if hard bounce
  // - Alert admin if bounce rate is high

  if (payload.data.bounce_type === 'hard') {
    console.error('[Resend Webhook] Hard bounce - email address likely invalid');
    // TODO: Mark email address as invalid in user record
  }
}

/**
 * Handle email complained event (marked as spam)
 */
async function handleEmailComplained(payload: ResendWebhookPayload): Promise<void> {
  console.warn('[Resend Webhook] Email marked as spam:', {
    id: payload.data.id,
    to: payload.data.to,
    subject: payload.data.subject,
  });

  // TODO: Handle complaint appropriately
  // - Unsubscribe user from non-essential emails
  // - Log complaint for reputation monitoring
  // - Consider suppressing future emails to this address
}

/**
 * Handle email opened event
 */
async function handleEmailOpened(payload: ResendWebhookPayload): Promise<void> {
  console.log('[Resend Webhook] Email opened:', {
    id: payload.data.id,
    to: payload.data.to,
    openCount: payload.data.open_count,
    lastOpenedAt: payload.data.last_opened_at,
  });

  // TODO: Track email opens for analytics
  // await updateEmailStatus(payload.data.id, 'opened', {
  //   openCount: payload.data.open_count,
  //   lastOpenedAt: payload.data.last_opened_at,
  // });
}

/**
 * Handle email clicked event
 */
async function handleEmailClicked(payload: ResendWebhookPayload): Promise<void> {
  console.log('[Resend Webhook] Email link clicked:', {
    id: payload.data.id,
    to: payload.data.to,
    clickedAt: payload.data.clicked_at,
  });

  // TODO: Track link clicks for analytics
  // await updateEmailStatus(payload.data.id, 'clicked', {
  //   clickedAt: payload.data.clicked_at,
  // });
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();

    // Verify webhook signature
    const signature = request.headers.get('svix-signature');
    
    if (RESEND_WEBHOOK_SECRET) {
      const isValid = verifyWebhookSignature(rawBody, signature, RESEND_WEBHOOK_SECRET);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid webhook signature' },
          { status: 401 }
        );
      }
    } else {
      console.warn('[Resend Webhook] RESEND_WEBHOOK_SECRET not configured');
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: 'Webhook secret not configured' },
          { status: 500 }
        );
      }
    }

    // Parse payload
    let payload: ResendWebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    const eventType = payload.type;

    console.log(`[Resend Webhook] Received event: ${eventType}`, {
      emailId: payload.data.id,
      to: payload.data.to,
    });

    // Handle different event types
    switch (eventType) {
      case 'email.delivered':
        await handleEmailDelivered(payload);
        break;

      case 'email.bounced':
        await handleEmailBounced(payload);
        break;

      case 'email.complained':
        await handleEmailComplained(payload);
        break;

      case 'email.opened':
        await handleEmailOpened(payload);
        break;

      case 'email.clicked':
        await handleEmailClicked(payload);
        break;

      default:
        console.warn(`[Resend Webhook] Unknown event type: ${eventType}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Resend Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * GET handler for webhook verification
 * Some services ping the endpoint to verify it's accessible
 */
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Resend webhook endpoint is active',
  });
}
