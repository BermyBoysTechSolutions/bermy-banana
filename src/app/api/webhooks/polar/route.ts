/**
 * Polar Webhook Handler - Polar Next.js SDK
 *
 * Handles subscription and payment events from Polar.
 */

import { Webhooks } from "@polar-sh/nextjs";
import { NextResponse } from "next/server";

// Import subscription handlers
import { handleNewSubscription, handleSubscriptionUpdate, handleSubscriptionCancellation, handleSubscriptionRevocation } from "@/lib/polar";

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET || "",
  onPayload: async (payload) => {
    const eventType = payload.type;
    const eventData = payload.data;

    console.log(`📨 Processing Polar webhook: ${eventType}`);

    switch (eventType) {
      case "subscription.created":
        await handleNewSubscription(eventData);
        break;

      case "subscription.updated":
        await handleSubscriptionUpdate(eventData);
        break;

      case "subscription.canceled":
        await handleSubscriptionCancellation(eventData);
        break;

      case "subscription.revoked":
        await handleSubscriptionRevocation(eventData);
        break;

      case "order.paid":
        console.log("Order paid - credits should be provisioned via subscription");
        break;

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }
  },
});

// For Vercel edge config
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
