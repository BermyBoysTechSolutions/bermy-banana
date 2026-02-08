# Polar Integration Setup Guide

This guide walks you through setting up Polar for Bermy Banana's subscription and billing system.

## Quick Setup

### 1. Install Dependencies
```bash
npm install @polar-sh/sdk @polar-sh/checkout @stripe/stripe-js
```

### 2. Set Up Environment Variables
Copy the Polar environment template and fill in your values:

```bash
cp .env.polar.example .env.local
```

Then edit `.env.local` with your Polar credentials:

```env
# From your Polar dashboard
POLAR_ACCESS_TOKEN=polar_oat_OfFBXI12VT14ATtE2pRjNot1FIEVTXmlA7xbz3CMKjL
POLAR_ORGANIZATION_ID=your_org_id
POLAR_WEBHOOK_SECRET=your_webhook_secret

# Product IDs from Polar dashboard
POLAR_STARTER_PRODUCT_ID=prod_xxx
POLAR_PRO_PRODUCT_ID=prod_xxx
POLAR_AGENCY_PRODUCT_ID=prod_xxx
```

### 3. Create Products in Polar Dashboard

1. Go to https://polar.sh → Your Organization → Products
2. Create three subscription products:

**Starter Tier ($25/month)**
- Price: $25/month
- Credits: 1,000/month
- Features: Basic UGC generation, Veo & Kling, Email support

**Pro Tier ($59/month)**
- Price: $59/month  
- Credits: 3,000/month
- Features: Everything in Starter, Priority support, Analytics

**Agency Tier ($129/month)**
- Price: $129/month
- Credits: 8,000/month
- Features: Everything in Pro, White-label, API access, Dedicated support

### 4. Configure Webhooks

1. In Polar dashboard → Settings → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/polar`
3. Select events:
   - `subscription.created`
   - `subscription.updated`
   - `subscription.cancelled`
   - `subscription.revoked`
4. Copy webhook secret and add to `.env.local`

### 5. Run Database Migration

```bash
# Apply the credit system migration
npm run db:migrate

# Or push directly
npm run db:push
```

### 6. Test the Integration

Create a test subscription:
1. Use Stripe test card: `4242 4242 4242 4242`
2. Any future date, any CVC
3. Complete the checkout flow
4. Check that credits are added to user account

## Usage Examples

### Check User Credits
```typescript
import { usePolar } from '@/hooks/use-polar'

function VideoGenerator() {
  const { credits, canAffordGeneration } = usePolar()
  
  const canUseKlingPro = canAffordGeneration('klingPro')
  
  if (!canUseKlingPro) {
    return <div>Insufficient credits for Kling Pro</div>
  }
  
  // Proceed with generation
}
```

### Deduct Credits
```typescript
const { deductCredits } = usePolar()

// When generating video
const success = await deductCredits(200) // Kling Pro cost
if (success) {
  // Proceed with video generation
}
```

### Show Pricing
```typescript
import { PricingCards } from '@/hooks/use-polar'

function PricingPage() {
  return <PricingCards />
}
```

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Polar SDK     │    │  Your App Logic  │    │   Database      │
│                 │    │                  │    │                 │
│ - Billing       │◄──►│ - Credit Mgmt    │◄──►│ - User Credits  │
│ - Subscriptions │    │ - Usage Tracking │    │ - Usage History │
│ - Webhooks      │    │ - Access Control │    │ - Subscriptions │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Credit Costs

- **Veo**: 100 credits
- **Kling Standard**: 150 credits  
- **Kling Pro**: 200 credits

## Security Notes

- Webhook signatures are verified automatically
- Never expose your Polar access token client-side
- Use environment variables for all secrets
- Test thoroughly in development mode first

## Troubleshooting

### Webhook not working?
- Check webhook URL is accessible
- Verify webhook secret is correct
- Check Vercel logs for errors

### Credits not updating?
- Check database migration applied
- Verify webhook events are being received
- Check Polar dashboard for subscription status

### Checkout failing?
- Ensure Stripe is properly configured
- Check product IDs are correct
- Verify organization ID is set

## Next Steps

1. Set up your products in Polar dashboard
2. Configure webhooks
3. Test the complete flow
4. Deploy to production
5. Monitor usage and analytics

Questions? Check the Polar docs at https://docs.polar.sh or ask in their Discord.