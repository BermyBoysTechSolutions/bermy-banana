import { Resend } from 'resend';

/**
 * Resend Email Client
 * 
 * Initialize Resend with API key from environment variables.
 * This client is used for all email operations in the application.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@bermybanana.com';

// Initialize Resend client only if API key is available
export const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

/**
 * Check if Resend is properly configured
 */
export function isResendConfigured(): boolean {
  return !!resend && !!RESEND_API_KEY;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

export interface SendEmailResult {
  success: boolean;
  data?: { id: string };
  error?: string;
}

/**
 * Send an email using Resend
 * 
 * @param options - Email sending options
 * @returns Result of the email send operation
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  // Check if Resend is configured
  if (!isResendConfigured()) {
    console.warn('[Email] Resend not configured - skipping email send');
    console.warn('[Email] To enable emails, set RESEND_API_KEY in your environment');
    return {
      success: false,
      error: 'Resend not configured',
    };
  }

  try {
    const { to, subject, html, text, from, replyTo, tags } = options;

    // Build email options object with only defined fields
    // Using type assertion due to exactOptionalPropertyTypes in tsconfig
    const emailOptions = {
      from: from || RESEND_FROM_EMAIL,
      to,
      subject,
      html,
      ...(text && { text }),
      ...(replyTo && { replyTo }),
      ...(tags && { tags }),
    } as const;

    const { data, error } = await resend!.emails.send(emailOptions);

    if (error) {
      console.error('[Email] Failed to send email:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log('[Email] Email sent successfully:', {
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      id: data?.id,
    });

    return {
      success: true,
      ...(data?.id ? { data: { id: data.id } } : {}),
    };
  } catch (error) {
    console.error('[Email] Unexpected error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get the configured from email address
 */
export function getFromEmail(): string {
  return RESEND_FROM_EMAIL;
}
