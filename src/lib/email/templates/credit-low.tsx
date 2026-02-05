import { sendEmail, type SendEmailResult } from '../resend';

/**
 * Low Credits Email Template
 * 
 * Sends a notification when user's credits fall below 20%.
 * Dark-themed with yellow accents matching Bermy Banana's brand.
 */

export interface CreditLowEmailProps {
  name: string;
  creditsRemaining: number;
  creditsTotal: number;
  pricingUrl?: string;
}

/**
 * Generate the HTML content for the low credits email
 */
function generateCreditLowHtml({
  name,
  creditsRemaining,
  creditsTotal,
  pricingUrl,
}: CreditLowEmailProps): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bermybanana.com';
  const pricingLink = pricingUrl || `${appUrl}/pricing`;
  const percentage = Math.round((creditsRemaining / creditsTotal) * 100);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>Low Credits Alert - Bermy Banana</title>
  <style>
    /* Reset styles */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      outline: none;
      text-decoration: none;
    }
    
    /* Dark theme colors */
    :root {
      color-scheme: dark;
      supported-color-schemes: dark;
    }
    
    body {
      margin: 0 !important;
      padding: 0 !important;
      background-color: #0a0a0a;
    }
    
    .email-wrapper {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #0a0a0a;
    }
    
    .email-content {
      background-color: #141414;
      border-radius: 12px;
      margin: 20px;
      padding: 40px 32px;
      border: 1px solid #262626;
    }
    
    .logo {
      text-align: center;
      margin-bottom: 32px;
    }
    
    .logo-text {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 28px;
      font-weight: 700;
      color: #fbbf24;
      letter-spacing: -0.5px;
    }
    
    .alert-banner {
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      border-radius: 8px;
      padding: 16px 24px;
      margin-bottom: 32px;
      text-align: center;
    }
    
    .alert-text {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 16px;
      font-weight: 600;
      color: #0a0a0a;
      margin: 0;
    }
    
    .heading {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 24px;
      font-weight: 700;
      color: #fafafa;
      margin: 0 0 16px 0;
      line-height: 1.3;
    }
    
    .paragraph {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 16px;
      color: #a3a3a3;
      line-height: 1.6;
      margin: 0 0 24px 0;
    }
    
    .credits-display {
      background-color: #1a1a1a;
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
      text-align: center;
      border: 1px solid #262626;
    }
    
    .credits-number {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 48px;
      font-weight: 700;
      color: #fbbf24;
      margin: 0;
      line-height: 1;
    }
    
    .credits-label {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 14px;
      color: #737373;
      margin: 8px 0 0 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .credits-bar {
      background-color: #262626;
      border-radius: 4px;
      height: 8px;
      margin: 16px 0 8px 0;
      overflow: hidden;
    }
    
    .credits-bar-fill {
      background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%);
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }
    
    .credits-percentage {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 14px;
      color: #fbbf24;
      margin: 8px 0 0 0;
    }
    
    .button-wrapper {
      text-align: center;
      margin: 32px 0;
    }
    
    .button {
      display: inline-block;
      background-color: #fbbf24;
      color: #0a0a0a;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 16px;
      font-weight: 600;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 8px;
      border: none;
    }
    
    .secondary-button {
      display: inline-block;
      background-color: transparent;
      color: #a3a3a3;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 14px;
      text-decoration: none;
      padding: 12px 24px;
      margin-top: 12px;
    }
    
    .info-box {
      background-color: #1a1a1a;
      border-radius: 8px;
      padding: 20px;
      margin: 24px 0;
      border-left: 4px solid #fbbf24;
    }
    
    .info-heading {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 16px;
      font-weight: 600;
      color: #fafafa;
      margin: 0 0 8px 0;
    }
    
    .info-text {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 14px;
      color: #a3a3a3;
      line-height: 1.5;
      margin: 0;
    }
    
    .divider {
      border: none;
      border-top: 1px solid #262626;
      margin: 32px 0;
    }
    
    .footer {
      text-align: center;
      margin-top: 32px;
    }
    
    .footer-text {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 13px;
      color: #737373;
      margin: 0 0 8px 0;
    }
    
    .footer-link {
      color: #fbbf24;
      text-decoration: none;
    }
    
    /* Mobile responsiveness */
    @media screen and (max-width: 600px) {
      .email-content {
        margin: 10px;
        padding: 32px 24px;
      }
      
      .heading {
        font-size: 22px;
      }
      
      .paragraph {
        font-size: 15px;
      }
      
      .credits-number {
        font-size: 36px;
      }
    }
  </style>
</head>
<body>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td align="center" style="background-color: #0a0a0a; padding: 20px 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="email-wrapper" style="max-width: 600px;">
          <tr>
            <td>
              <div class="email-content">
                <!-- Logo -->
                <div class="logo">
                  <span class="logo-text">🍌 Bermy Banana</span>
                </div>
                
                <!-- Alert Banner -->
                <div class="alert-banner">
                  <p class="alert-text">⚠️ Low Credits Alert</p>
                </div>
                
                <!-- Heading -->
                <h1 class="heading">Running Low on Credits, ${escapeHtml(name)}</h1>
                
                <!-- Body -->
                <p class="paragraph">
                  You're making great videos! Just a heads up that your credit balance is getting low. 
                  Don't let your creative momentum stop—top up now to keep generating.
                </p>
                
                <!-- Credits Display -->
                <div class="credits-display">
                  <p class="credits-number">${creditsRemaining.toLocaleString()}</p>
                  <p class="credits-label">Credits Remaining</p>
                  <div class="credits-bar">
                    <div class="credits-bar-fill" style="width: ${percentage}%;"></div>
                  </div>
                  <p class="credits-percentage">${percentage}% of ${creditsTotal.toLocaleString()} total</p>
                </div>
                
                <!-- CTA Button -->
                <div class="button-wrapper">
                  <a href="${escapeHtml(pricingLink)}" class="button">Upgrade Your Plan</a><br>
                  <a href="${escapeHtml(appUrl)}/dashboard" class="secondary-button">Go to Dashboard →</a>
                </div>
                
                <!-- Info Box -->
                <div class="info-box">
                  <h3 class="info-heading">What can you do?</h3>
                  <p class="info-text">
                    Upgrade to a higher tier for more monthly credits, or wait until your next billing cycle 
                    for automatic renewal. Pro and Agency plans offer the best value for power users.
                  </p>
                </div>
                
                <hr class="divider">
                
                <!-- Footer -->
                <div class="footer">
                  <p class="footer-text">
                    Need help? Reply to this email or visit our 
                    <a href="${escapeHtml(appUrl)}/docs" class="footer-link">help center</a>.
                  </p>
                  <p class="footer-text">
                    You're receiving this because your Bermy Banana credits are below 20%.
                  </p>
                  <p class="footer-text">
                    © ${new Date().getFullYear()} Bermy Banana. All rights reserved.
                  </p>
                </div>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Generate plain text version of the low credits email
 */
function generateCreditLowText({
  name,
  creditsRemaining,
  creditsTotal,
  pricingUrl,
}: CreditLowEmailProps): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bermybanana.com';
  const pricingLink = pricingUrl || `${appUrl}/pricing`;
  const percentage = Math.round((creditsRemaining / creditsTotal) * 100);

  return `⚠️ Low Credits Alert - Bermy Banana

Running Low on Credits, ${name}

You're making great videos! Just a heads up that your credit balance is getting low. Don't let your creative momentum stop—top up now to keep generating.

CREDITS REMAINING: ${creditsRemaining.toLocaleString()}
${percentage}% of ${creditsTotal.toLocaleString()} total credits

Upgrade Your Plan: ${pricingLink}
Go to Dashboard: ${appUrl}/dashboard

What can you do?
Upgrade to a higher tier for more monthly credits, or wait until your next billing cycle for automatic renewal. Pro and Agency plans offer the best value for power users.

Need help? Reply to this email or visit our help center at ${appUrl}/docs

You're receiving this because your Bermy Banana credits are below 20%.

© ${new Date().getFullYear()} Bermy Banana. All rights reserved.
`;
}

/**
 * Escape HTML special characters to prevent XSS
 * Server-safe implementation (no DOM dependency)
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Check if a credit low email should be sent
 * Only send when credits drop below 20% for the first time in this cycle
 */
export function shouldSendCreditLowEmail(
  creditsRemaining: number,
  creditsTotal: number,
  lastNotifiedAt?: Date | null
): boolean {
  const threshold = creditsTotal * 0.2; // 20% threshold
  
  // Credits are above threshold - no need to notify
  if (creditsRemaining >= threshold) {
    return false;
  }
  
  // Credits are below threshold
  // Check if we've already notified in the last 7 days
  if (lastNotifiedAt) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    if (lastNotifiedAt > sevenDaysAgo) {
      return false; // Already notified recently
    }
  }
  
  return true;
}

/**
 * Send low credits notification email
 */
export async function sendCreditLowEmail(
  to: string,
  props: CreditLowEmailProps
): Promise<SendEmailResult> {
  return sendEmail({
    to,
    subject: '⚠️ Low Credits Alert - Top Up to Keep Creating',
    html: generateCreditLowHtml(props),
    text: generateCreditLowText(props),
    tags: [
      { name: 'category', value: 'credit_low' },
      { name: 'credits_remaining', value: String(props.creditsRemaining) },
    ],
  });
}

export default sendCreditLowEmail;
