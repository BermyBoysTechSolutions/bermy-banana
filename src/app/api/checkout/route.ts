/**
 * Checkout API Route
 *
 * Creates a Polar checkout session for subscription purchases.
 */

import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Polar } from "@polar-sh/sdk";
import { auth } from "@/lib/auth";
import { canPurchaseTrial } from "@/lib/services/credits";

// Initialize Polar client
const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN || "",
  server: process.env.NODE_ENV === "production" ? "production" : "sandbox",
});

// Product ID mapping (placeholders - replace with actual Polar product IDs)
const PRODUCT_IDS: Record<string, string> = {
  trial: process.env.POLAR_TRIAL_PRODUCT_ID || "polar_prod_trial",
  starter: process.env.POLAR_STARTER_PRODUCT_ID || "polar_prod_starter",
  pro: process.env.POLAR_PRO_PRODUCT_ID || "polar_prod_pro",
  agency: process.env.POLAR_AGENCY_PRODUCT_ID || "polar_prod_agency",
};

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, tier } = body;

    if (!tier || !PRODUCT_IDS[tier]) {
      return NextResponse.json(
        { error: "Invalid subscription tier" },
        { status: 400 }
      );
    }

    // Check if user is trying to purchase trial
    if (tier === "trial") {
      const canTrial = await canPurchaseTrial(session.user.id);
      if (!canTrial) {
        return NextResponse.json(
          { error: "Trial can only be purchased once. Please upgrade to a monthly plan." },
          { status: 403 }
        );
      }
    }

    const polarProductId = productId || PRODUCT_IDS[tier];

    // Create checkout session
    const checkout = await polar.checkouts.create({
      products: [polarProductId],
      customerEmail: session.user.email,
      customerName: session.user.name || undefined,
      metadata: {
        userId: session.user.id,
        tier: tier,
      },
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
    });

    if (!checkout?.url) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ checkoutUrl: checkout.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create checkout session",
      },
      { status: 500 }
    );
  }
}