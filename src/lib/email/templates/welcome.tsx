import { sendEmail, type SendEmailResult } from '../resend';

/**
 * Welcome Email Template
 * 
 * Sends a welcome email to new users after successful signup.
 * Dark-themed with yellow accents matching Bermy Banana's brand.
 */

export interface WelcomeEmailProps {
  name: string;
  dashboardUrl?: string;
}

/**
 * Generate the HTML content for the welcome email
 */
function generateWelcomeHtml({ name, dashboardUrl }: WelcomeEmailProps): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bermybanana.com';
  const dashboardLink = dashboardUrl || `${appUrl}/dashboard`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>Welcome to Bermy Banana</title>
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
    
    .tips-section {
      background-color: #1a1a1a;
      border-radius: 8px;
      padding: 24px;
      margin: 24px 0;
      border-left: 4px solid #fbbf24;
    }
    
    .tips-heading {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 18px;
      font-weight: 600;
      color: #fafafa;
      margin: 0 0 16px 0;
    }
    
    .tip-item {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 15px;
      color: #d4d4d4;
      line-height: 1.5;
      margin: 0 0 12px 0;
      padding-left: 20px;
      position: relative;
    }
    
    .tip-item::before {
      content: "🍌";
      position: absolute;
      left: 0;
    }
    
    .tip-item:last-child {
      margin-bottom: 0;
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
                
                <!-- Heading -->
                <h1 class="heading">Welcome to Bermy Banana, ${escapeHtml(name)}!</h1>
                
                <!-- Body -->
                <p class="paragraph">
                  We're thrilled to have you on board! Get ready to create stunning AI-powered videos 
                  with your own custom avatars. Your creative journey starts now.
                </p>
                
                <!-- CTA Button -->
                <div class="button-wrapper">
                  <a href="${escapeHtml(dashboardLink)}" class="button">Go to Dashboard</a>
                </div>
                
                <!-- Quick Tips -->
                <div class="tips-section">
                  <h2 class="tips-heading">Quick Tips to Get Started</h2>
                  <p class="tip-item">Create your first avatar by uploading a reference photo</p>
                  <p class="tip-item">Upload product images you want to feature in your videos</p>
                  <p class="tip-item">Choose from our scene templates or create custom prompts</p>
                  <p class="tip-item">Generate your first video and watch the magic happen!</p>
                </div>
                
                <hr class="divider">
                
                <!-- Footer -->
                <div class="footer">
                  <p class="footer-text">
                    Need help? Reply to this email or visit our 
                    <a href="${escapeHtml(appUrl)}/docs" class="footer-link">documentation</a>.
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
 * Generate plain text version of the welcome email
 */
function generateWelcomeText({ name, dashboardUrl }: WelcomeEmailProps): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bermybanana.com';
  const dashboardLink = dashboardUrl || `${appUrl}/dashboard`;

  return `Welcome to Bermy Banana, ${name}!

We're thrilled to have you on board! Get ready to create stunning AI-powered videos with your own custom avatars. Your creative journey starts now.

Go to Dashboard: ${dashboardLink}

Quick Tips to Get Started:
- Create your first avatar by uploading a reference photo
- Upload product images you want to feature in your videos
- Choose from our scene templates or create custom prompts
- Generate your first video and watch the magic happen!

Need help? Reply to this email or visit our documentation at ${appUrl}/docs

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
 * Send welcome email to a new user
 */
export async function sendWelcomeEmail(
  to: string,
  props: WelcomeEmailProps
): Promise<SendEmailResult> {
  return sendEmail({
    to,
    subject: 'Welcome to Bermy Banana! 🍌',
    html: generateWelcomeHtml(props),
    text: generateWelcomeText(props),
    tags: [
      { name: 'category', value: 'welcome' },
      { name: 'user_name', value: props.name },
    ],
  });
}

export default sendWelcomeEmail;
