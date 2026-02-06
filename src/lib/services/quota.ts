/**
 * Quota Management Service
 *
 * Handles checking and decrementing user quotas for video and image generation.
 * Quotas reset daily at midnight UTC.
 */

import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { eq } from "drizzle-orm";
import type { GenerationMode } from "@/lib/providers/types";

export interface QuotaCheckResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  error?: string | undefined;
}

export interface UserQuotaInfo {
  dailyVideoQuota: number;
  dailyImageQuota: number;
  videosGeneratedToday: number;
  imagesGeneratedToday: number;
  quotaResetAt: Date | null;
}

/**
 * Check if the user has quota remaining for a specific generation type
 */
export async function checkQuota(
  userId: string,
  mode: GenerationMode
): Promise<QuotaCheckResult> {
  // Fetch user's quota info
  const [userData] = await db
    .select({
      dailyVideoQuota: user.dailyVideoQuota,
      dailyImageQuota: user.dailyImageQuota,
      videosGeneratedToday: user.videosGeneratedToday,
      imagesGeneratedToday: user.imagesGeneratedToday,
      quotaResetAt: user.quotaResetAt,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!userData) {
    return {
      allowed: false,
      remaining: 0,
      limit: 0,
      error: "User not found",
    };
  }

  // Check if quota needs to be reset (daily reset at midnight UTC)
  const resetNeeded = shouldResetQuota(userData.quotaResetAt);

  if (resetNeeded) {
    // Reset quota counters
    await resetUserQuota(userId);
    // Return fresh quota
    if (mode === "MODE_B") {
      return {
        allowed: true,
        remaining: userData.dailyImageQuota,
        limit: userData.dailyImageQuota,
      };
    } else {
      return {
        allowed: true,
        remaining: userData.dailyVideoQuota,
        limit: userData.dailyVideoQuota,
      };
    }
  }

  // Check quota based on mode
  // MODE_B (Influencer Photo) uses image quota
  // MODE_A and MODE_C use video quota
  if (mode === "MODE_B") {
    const remaining = userData.dailyImageQuota - userData.imagesGeneratedToday;
    return {
      allowed: remaining > 0,
      remaining: Math.max(0, remaining),
      limit: userData.dailyImageQuota,
      error: remaining <= 0 ? "Daily image quota exceeded" : undefined,
    };
  } else {
    const remaining = userData.dailyVideoQuota - userData.videosGeneratedToday;
    return {
      allowed: remaining > 0,
      remaining: Math.max(0, remaining),
      limit: userData.dailyVideoQuota,
      error: remaining <= 0 ? "Daily video quota exceeded" : undefined,
    };
  }
}

/**
 * Decrement the user's quota after a successful generation
 */
export async function decrementQuota(
  userId: string,
  mode: GenerationMode
): Promise<void> {
  // First check if quota needs reset
  const [userData] = await db
    .select({
      quotaResetAt: user.quotaResetAt,
      videosGeneratedToday: user.videosGeneratedToday,
      imagesGeneratedToday: user.imagesGeneratedToday,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!userData) return;

  const resetNeeded = shouldResetQuota(userData.quotaResetAt);

  if (mode === "MODE_B") {
    // Image generation
    if (resetNeeded) {
      await db
        .update(user)
        .set({
          imagesGeneratedToday: 1,
          videosGeneratedToday: 0,
          quotaResetAt: getNextResetTime(),
        })
        .where(eq(user.id, userId));
    } else {
      await db
        .update(user)
        .set({
          imagesGeneratedToday: userData.imagesGeneratedToday + 1,
        })
        .where(eq(user.id, userId));
    }
  } else {
    // Video generation (MODE_A or MODE_C)
    if (resetNeeded) {
      await db
        .update(user)
        .set({
          videosGeneratedToday: 1,
          imagesGeneratedToday: 0,
          quotaResetAt: getNextResetTime(),
        })
        .where(eq(user.id, userId));
    } else {
      await db
        .update(user)
        .set({
          videosGeneratedToday: userData.videosGeneratedToday + 1,
        })
        .where(eq(user.id, userId));
    }
  }
}

/**
 * Reset user's daily quota counters
 */
async function resetUserQuota(userId: string): Promise<void> {
  await db
    .update(user)
    .set({
      videosGeneratedToday: 0,
      imagesGeneratedToday: 0,
      quotaResetAt: getNextResetTime(),
    })
    .where(eq(user.id, userId));
}

/**
 * Check if quota should be reset based on last reset time
 * Resets happen at midnight UTC
 */
function shouldResetQuota(quotaResetAt: Date | null): boolean {
  if (!quotaResetAt) return true;

  const now = new Date();
  return now >= quotaResetAt;
}

/**
 * Get the next quota reset time (midnight UTC)
 */
function getNextResetTime(): Date {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCHours(24, 0, 0, 0); // Next midnight UTC
  return tomorrow;
}

/**
 * Get user's current quota info
 */
export async function getUserQuotaInfo(
  userId: string
): Promise<UserQuotaInfo | null> {
  const [userData] = await db
    .select({
      dailyVideoQuota: user.dailyVideoQuota,
      dailyImageQuota: user.dailyImageQuota,
      videosGeneratedToday: user.videosGeneratedToday,
      imagesGeneratedToday: user.imagesGeneratedToday,
      quotaResetAt: user.quotaResetAt,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return userData || null;
}
