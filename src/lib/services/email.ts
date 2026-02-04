/**
 * Email Service
 * 
 * High-level email service functions that handle business logic:
 * - User email preferences checking
 * - Email queuing/deduplication
 * - Integration with user database
 * 
 * Integration Points:
 * - Call sendWelcomeEmail after successful signup (in auth callback)
 * - Call sendCreditLowEmail when credits drop below threshold (in credit deduction)
 */

import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { user } from '@/lib/schema';
import { isResendConfigured } from '@/lib/email/resend';
import { sendWelcomeEmail } from '@/lib/email/templates/welcome';
import {
  sendCreditLowEmail,
  shouldSendCreditLowEmail as checkShouldSendCreditLow,
} from '@/lib/email/templates/credit-low';

// In-memory queue to prevent duplicate emails during the same request
// In production, use Redis or a proper job queue like Bull/BullMQ
const emailQueue = new Map<string, Promise<unknown>>();

/**
 * Track when we last sent credit low notification to each user
 * In production, this should be stored in Redis or database
 */
const creditLowNotifications = new Map<string, Date>();

/**
 * Check if email service is available
 */
export function isEmailServiceAvailable(): boolean {
  return isResendConfigured();
}

/**
 * Deduplicate email sends within the same request cycle
 * Prevents sending the same email multiple times if called rapidly
 */
async function deduplicatedSend<T>(
  key: string,
  sendFn: () => Promise<T>
): Promise<T | { success: false; error: string }> {
  // Check if there's already a pending send for this key
  const pending = emailQueue.get(key);
  if (pending) {
    console.log(`[Email Service] Deduplicating email send: ${key}`);
    try {
      return (await pending) as T;
    } catch {
      // Previous attempt failed, continue to retry
    }
  }

  // Create new send promise
  const sendPromise = sendFn();
  emailQueue.set(key, sendPromise);

  try {
    const result = await sendPromise;
    return result;
  } finally {
    // Clean up after a delay to allow for deduplication
    setTimeout(() => {
      emailQueue.delete(key);
    }, 5000);
  }
}

/**
 * Send welcome email to a new user
 * 
 * INTEGRATION POINT:
 * Call this function in the auth callback after successful signup.
 * Example:
 *   // In src/app/api/auth/callback/route.ts or similar
 *   await sendWelcomeEmail(userId, user.email, user.name);
 * 
 * @param userId - The user's ID
 * @param email - The user's email address
 * @param name - The user's name
 * @returns Result of the email send operation
 */
export async function queueWelcomeEmail(
  userId: string,
  email: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  const dedupeKey = `welcome:${userId}`;

  return deduplicatedSend(dedupeKey, async () => {
    // Check if email service is configured
    if (!isResendConfigured()) {
      console.warn('[Email Service] Resend not configured - welcome email not sent');
      // Return success=true so the user flow isn't interrupted
      return { success: true };
    }

    console.log(`[Email Service] Sending welcome email to ${email}`);

    const result = await sendWelcomeEmail(email, { name });

    if (result.success) {
      console.log(`[Email Service] Welcome email sent to ${email}`);
    } else {
      console.error(`[Email Service] Failed to send welcome email: ${result.error}`);
    }

    return result;
  });
}

/**
 * Send low credits notification email
 * 
 * INTEGRATION POINT:
 * Call this function when credits are deducted and drop below 20% threshold.
 * Example in src/lib/services/credits.ts:
 *   // After successful credit deduction
 *   const remaining = updated.creditsRemaining;
 *   const total = userData.creditsTotal;
 *   if (remaining < total * 0.2) {
 *     await queueCreditLowEmail(userId, userData.email, remaining, total);
 *   }
 * 
 * @param userId - The user's ID
 * @param email - The user's email address  
 * @param creditsRemaining - Current credit balance
 * @param creditsTotal - Total credits for this billing period
 * @returns Result of the email send operation
 */
export async function queueCreditLowEmail(
  userId: string,
  email: string,
  creditsRemaining: number,
  creditsTotal: number
): Promise<{ success: boolean; error?: string; skipped?: boolean }> {
  const dedupeKey = `credit-low:${userId}`;

  return deduplicatedSend(dedupeKey, async () => {
    // Check if we should send this notification
    const lastNotified = creditLowNotifications.get(userId);
    const shouldSend = checkShouldSendCreditLow(
      creditsRemaining,
      creditsTotal,
      lastNotified
    );

    if (!shouldSend) {
      console.log(`[Email Service] Skipping credit low email for ${userId} - already notified recently`);
      return { success: true, skipped: true };
    }

    // Check if email service is configured
    if (!isResendConfigured()) {
      console.warn('[Email Service] Resend not configured - credit low email not sent');
      return { success: true, skipped: true };
    }

    // Fetch user name from database
    let userName = 'there';
    try {
      const [userData] = await db
        .select({ name: user.name })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);
      
      if (userData?.name) {
        userName = userData.name;
      }
    } catch (error) {
      console.warn('[Email Service] Could not fetch user name:', error);
    }

    console.log(`[Email Service] Sending credit low email to ${email}`);

    const result = await sendCreditLowEmail(email, {
      name: userName,
      creditsRemaining,
      creditsTotal,
    });

    if (result.success) {
      // Track that we sent this notification
      creditLowNotifications.set(userId, new Date());
      console.log(`[Email Service] Credit low email sent to ${email}`);
    } else {
      console.error(`[Email Service] Failed to send credit low email: ${result.error}`);
    }

    return result;
  });
}

/**
 * Send low credits notification using user ID only
 * Fetches user data from database
 * 
 * @param userId - The user's ID
 * @param creditsRemaining - Current credit balance (optional - will fetch if not provided)
 * @param creditsTotal - Total credits (optional - will fetch if not provided)
 * @returns Result of the email send operation
 */
export async function sendCreditLowEmailByUserId(
  userId: string,
  creditsRemaining?: number,
  creditsTotal?: number
): Promise<{ success: boolean; error?: string; skipped?: boolean }> {
  try {
    // Fetch user data
    const [userData] = await db
      .select({
        email: user.email,
        name: user.name,
        creditsRemaining: user.creditsRemaining,
        creditsTotal: user.creditsTotal,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!userData) {
      return { success: false, error: 'User not found' };
    }

    const remaining = creditsRemaining ?? userData.creditsRemaining;
    const total = creditsTotal ?? userData.creditsTotal;

    return queueCreditLowEmail(
      userId,
      userData.email,
      remaining,
      total
    );
  } catch (error) {
    console.error('[Email Service] Error sending credit low email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Clear the credit low notification history for a user
 * Call this when user upgrades their plan (resets the notification timer)
 * 
 * @param userId - The user's ID
 */
export function clearCreditLowNotification(userId: string): void {
  creditLowNotifications.delete(userId);
  console.log(`[Email Service] Cleared credit low notification history for ${userId}`);
}

/**
 * Get email service status
 * Returns information about the email service configuration
 */
export function getEmailServiceStatus(): {
  configured: boolean;
  resendConfigured: boolean;
  fromEmail: string;
  queuedEmails: number;
} {
  return {
    configured: isResendConfigured(),
    resendConfigured: isResendConfigured(),
    fromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@bermybanana.com',
    queuedEmails: emailQueue.size,
  };
}

// Export template functions for direct use if needed
export { sendWelcomeEmail, sendCreditLowEmail };
