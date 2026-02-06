/**
 * Promo Code Redemption API
 *
 * POST /api/promo/redeem
 * Body: { code: string }
 *
 * Validates a promo code and awards credits to the user if valid.
 */

import { NextRequest, NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { user, promoCode, redeemedPromoCode } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface RedeemRequest {
  code: string;
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Parse request body
    let body: RedeemRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Promo code is required" },
        { status: 400 }
      );
    }

    // Normalize the code (uppercase, trim whitespace)
    const normalizedCode = code.trim().toUpperCase();

    // Start a transaction to ensure atomicity
    const result = await db.transaction(async (tx) => {
      // Fetch the promo code (locking the row to prevent race conditions)
      const [promo] = await tx
        .select()
        .from(promoCode)
        .where(eq(promoCode.code, normalizedCode));

      if (!promo) {
        return { success: false, error: "Invalid promo code" };
      }

      // Check if promo code is active
      if (!promo.isActive) {
        return { success: false, error: "This promo code is no longer active" };
      }

      // Check if promo code has expired
      if (promo.expiresAt && new Date() > promo.expiresAt) {
        return { success: false, error: "This promo code has expired" };
      }

      // Check if max uses reached
      if (promo.usedCount >= promo.maxUses) {
        return { success: false, error: "This promo code has reached its usage limit" };
      }

      // Check if user has already redeemed this code
      const [existingRedemption] = await tx
        .select()
        .from(redeemedPromoCode)
        .where(
          and(
            eq(redeemedPromoCode.userId, userId),
            eq(redeemedPromoCode.promoCodeId, promo.id)
          )
        );

      if (existingRedemption) {
        return { success: false, error: "You have already redeemed this promo code" };
      }

      // Get current user credits
      const [userData] = await tx
        .select({ creditsRemaining: user.creditsRemaining })
        .from(user)
        .where(eq(user.id, userId));

      if (!userData) {
        return { success: false, error: "User not found" };
      }

      // Increment used count on promo code
      await tx
        .update(promoCode)
        .set({ usedCount: sql`${promoCode.usedCount} + 1` })
        .where(eq(promoCode.id, promo.id));

      // Add credits to user
      const [updatedUser] = await tx
        .update(user)
        .set({
          creditsRemaining: userData.creditsRemaining + promo.credits,
        })
        .where(eq(user.id, userId))
        .returning({ creditsRemaining: user.creditsRemaining });

      // Record the redemption
      await tx.insert(redeemedPromoCode).values({
        userId,
        promoCodeId: promo.id,
        creditsAwarded: promo.credits,
      });

      return {
        success: true,
        creditsAwarded: promo.credits,
        newBalance: updatedUser?.creditsRemaining,
      };
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully redeemed! ${result.creditsAwarded} credits added to your account.`,
      creditsAwarded: result.creditsAwarded,
      newBalance: result.newBalance,
    });
  } catch (error) {
    console.error("Promo code redemption error:", error);
    return NextResponse.json(
      { error: "Failed to redeem promo code" },
      { status: 500 }
    );
  }
}