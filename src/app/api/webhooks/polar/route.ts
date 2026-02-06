/**
 * Polar Webhook Handler
 *
 * Handles subscription events from Polar:
 * - subscription.created: User subscribes to a plan
 * - subscription.updated: Subscription changes (upgrades, downgrades)
 * - subscription.cancelled: User cancels subscription
 * - checkout.created: Handle one-time purchases (like trial)
 */

import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";

// Credit allocations per tier
const TIER_CREDITS: Record<string, number> = {
  trial: 500,
  starter: 800,
  pro: 2400,
  agency: 6000,
};

// Webhook secret for signature verification
const WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET!;

interface PolarWebhookPayload {
  type: string;
  data: {
    id: string;
    customerId: string;
    customer?: {
      id: string;
      email: string;
      name?: string;
    };
    productId?: string;
    product?: {
      id: string;
      name: string;
    };
    metadata?: {
      userId?: string;
      tier?: string;
    };
    status?: string;
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: boolean;
    // For checkout events
    amount?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: unknown;
  };
}

/**
 * Verify webhook signature from Polar
 */
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const hmac = createHmac("sha256", secret);
    hmac.update(payload);
    const computedSignature = hmac.digest("hex");
    return computedSignature === signature;
  } catch {
    return false;
  }
}

/**
 * Extract tier from product name or metadata
 */
function extractTier(
  payload: PolarWebhookPayload
): { tier: string; credits: number; isTrial: boolean } | null {
  // Try metadata first
  const metadataTier = payload.data.metadata?.tier;
  if (metadataTier && TIER_CREDITS[metadataTier] !== undefined) {
    return { 
      tier: metadataTier, 
      credits: TIER_CREDITS[metadataTier]!,
      isTrial: metadataTier === "trial"
    };
  }

  // Try to infer from product name
  const productName = payload.data.product?.name?.toLowerCase() || "";
  if (productName.includes("trial")) {
    return { tier: "trial", credits: TIER_CREDITS["trial"]!, isTrial: true };
  }
  if (productName.includes("starter")) {
    return { tier: "starter", credits: TIER_CREDITS["starter"]!, isTrial: false };
  }
  if (productName.includes("pro")) {
    return { tier: "pro", credits: TIER_CREDITS["pro"]!, isTrial: false };
  }
  if (productName.includes("agency")) {
    return { tier: "agency", credits: TIER_CREDITS["agency"]!, isTrial: false };
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();

    // Verify webhook signature
    const signature = request.headers.get("x-polar-signature");
    if (!signature) {
      return NextResponse.json(
        { error: "Missing webhook signature" },
        { status: 401 }
      );
    }

    if (!WEBHOOK_SECRET) {
      console.error("POLAR_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    const isValid = verifyWebhookSignature(rawBody, signature, WEBHOOK_SECRET);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    // Parse payload
    const payload: PolarWebhookPayload = JSON.parse(rawBody);
    const eventType = payload.type;

    console.log(`Received Polar webhook: ${eventType}`, {
      subscriptionId: payload.data.id,
      customerId: payload.data.customerId,
    });

    // Handle checkout completed (for one-time purchases like trial)
    if (eventType === "checkout.completed" || eventType === "order.created") {
      const tierInfo = extractTier(payload);
      if (!tierInfo) {
        console.error("Could not determine tier from payload", payload);
        return NextResponse.json(
          { error: "Could not determine tier" },
          { status: 400 }
        );
      }

      const userId = payload.data.metadata?.userId;
      if (!userId) {
        console.error("No userId in checkout metadata", payload);
        return NextResponse.json(
          { error: "No userId in metadata" },
          { status: 400 }
        );
      }

      // Handle trial purchase differently
      if (tierInfo.isTrial) {
        await db
          .update(user)
          .set({
            subscriptionTier: "trial",
            subscriptionStatus: "trial", // Trial is not "active" subscription
            creditsRemaining: tierInfo.credits,
            creditsTotal: tierInfo.credits,
            polarCustomerId: payload.data.customerId,
            // Don't set polarSubscriptionId for trial (it's not a subscription)
          })
          .where(eq(user.id, userId));

        console.log(`Activated trial for user ${userId} with ${tierInfo.credits} credits`);
      } else {
        // Regular subscription
        await db
          .update(user)
          .set({
            subscriptionTier: tierInfo.tier,
            subscriptionStatus: "active",
            creditsRemaining: tierInfo.credits,
            creditsTotal: tierInfo.credits,
            polarCustomerId: payload.data.customerId,
          })
          .where(eq(user.id, userId));

        console.log(`Activated ${tierInfo.tier} subscription for user ${userId}`);
      }
    }

    // Handle subscription created
    if (eventType === "subscription.created") {
      const tierInfo = extractTier(payload);
      if (!tierInfo) {
        console.error("Could not determine tier from payload", payload);
        return NextResponse.json(
          { error: "Could not determine tier" },
          { status: 400 }
        );
      }

      const userId = payload.data.metadata?.userId;
      if (!userId) {
        console.error("No userId in subscription metadata", payload);
        return NextResponse.json(
          { error: "No userId in metadata" },
          { status: 400 }
        );
      }

      // Skip trial subscriptions (handled by checkout.completed)
      if (tierInfo.isTrial) {
        console.log(`Skipping subscription.created for trial user ${userId}`);
        return NextResponse.json({ success: true });
      }

      // Update user subscription
      await db
        .update(user)
        .set({
          subscriptionTier: tierInfo.tier,
          subscriptionStatus: "active",
          creditsRemaining: tierInfo.credits,
          creditsTotal: tierInfo.credits,
          polarCustomerId: payload.data.customerId,
          polarSubscriptionId: payload.data.id,
        })
        .where(eq(user.id, userId));

      console.log(`Activated ${tierInfo.tier} subscription for user ${userId}`);
    }

    // Handle subscription updated (upgrades, downgrades)
    if (eventType === "subscription.updated") {
      const tierInfo = extractTier(payload);
      const userId = payload.data.metadata?.userId;

      if (tierInfo && userId && !tierInfo.isTrial) {
        await db
          .update(user)
          .set({
            subscriptionTier: tierInfo.tier,
            creditsTotal: tierInfo.credits,
            // Only update credits if upgrading (not if downgrading mid-cycle)
            // This is a simplified logic - you may want more sophisticated handling
          })
          .where(eq(user.id, userId));

        console.log(`Updated subscription to ${tierInfo.tier} for user ${userId}`);
      }
    }

    // Handle subscription cancelled
    if (eventType === "subscription.cancelled") {
      const userId = payload.data.metadata?.userId;

      if (userId) {
        await db
          .update(user)
          .set({
            subscriptionStatus: "cancelled",
          })
          .where(eq(user.id, userId));

        console.log(`Cancelled subscription for user ${userId}`);
      }
    }

    // Handle subscription revoked (payment failure, etc.)
    if (eventType === "subscription.revoked") {
      const userId = payload.data.metadata?.userId;

      if (userId) {
        await db
          .update(user)
          .set({
            subscriptionStatus: "past_due",
          })
          .where(eq(user.id, userId));

        console.log(`Revoked subscription for user ${userId}`);
      }
    }

    // Handle subscription active (renewal)
    if (eventType === "subscription.active") {
      const tierInfo = extractTier(payload);
      const userId = payload.data.metadata?.userId;

      if (tierInfo && userId && !tierInfo.isTrial) {
        // Reset credits on renewal
        await db
          .update(user)
          .set({
            subscriptionStatus: "active",
            creditsRemaining: tierInfo.credits,
            creditsTotal: tierInfo.credits,
          })
          .where(eq(user.id, userId));

        console.log(`Renewed ${tierInfo.tier} subscription for user ${userId}`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}