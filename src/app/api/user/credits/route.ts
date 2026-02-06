/**
 * User Credits API
 *
 * GET /api/user/credits
 *
 * Returns the current user's credit information.
 */

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
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

    // Fetch user credit info
    const [userData] = await db
      .select({
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus,
        creditsRemaining: user.creditsRemaining,
        creditsTotal: user.creditsTotal,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!userData) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      subscriptionTier: userData.subscriptionTier,
      subscriptionStatus: userData.subscriptionStatus,
      creditsRemaining: userData.creditsRemaining,
      creditsTotal: userData.creditsTotal,
    });
  } catch (error) {
    console.error("Failed to fetch user credits:", error);
    return NextResponse.json(
      { error: "Failed to fetch credit information" },
      { status: 500 }
    );
  }
}