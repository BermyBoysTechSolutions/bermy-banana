/**
 * Credit Management Service
 *
 * Handles checking and deducting user credits for video and image generation.
 * Replaces the legacy quota system with a credit-based model.
 */

import { eq } from "drizzle-orm";
import type { GenerationMode } from "@/lib/providers/types";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import type { VideoGenerator } from "./video-generator";
import { getGeneratorCredits } from "./video-generator";

// Credit costs per operation
export const CREDIT_COSTS = {
  VIDEO_SCENE: 100, // Per scene (not per job)
  IMAGE: 50,
} as const;

// Default credits per subscription tier
export const TIER_CREDITS = {
  TRIAL: 500,
  STARTER: 800,
  PRO: 2400,
  AGENCY: 6000,
} as const;

export interface CreditCheckResult {
  allowed: boolean;
  remaining: number;
  required: number;
  error?: string | undefined;
  isTrialExhausted?: boolean;
}

export interface UserCreditInfo {
  subscriptionTier: string;
  subscriptionStatus: string;
  creditsRemaining: number;
  creditsTotal: number;
}

/**
 * Calculate required credits for a generation request
 */
export function calculateRequiredCredits(
  mode: GenerationMode,
  sceneCount: number = 1,
  videoGenerator?: VideoGenerator
): number {
  if (mode === "MODE_B") {
    // Influencer photo (image generation)
    return CREDIT_COSTS.IMAGE;
  } else {
    // Video generation (MODE_A or MODE_C)
    if (videoGenerator) {
      // Use generator-specific pricing
      return getGeneratorCredits(videoGenerator) * sceneCount;
    } else {
      // Default to Veo pricing
      return CREDIT_COSTS.VIDEO_SCENE * sceneCount;
    }
  }
}

/**
 * Check if the user has enough credits for a generation request
 */
export async function checkCredits(
  userId: string,
  mode: GenerationMode,
  sceneCount: number = 1,
  videoGenerator?: VideoGenerator
): Promise<CreditCheckResult> {
  // Fetch user's credit info
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
    return {
      allowed: false,
      remaining: 0,
      required: 0,
      error: "User not found",
    };
  }

  // Calculate required credits
  const requiredCredits = calculateRequiredCredits(mode, sceneCount, videoGenerator);

  // For free tier, fall back to legacy quota system
  if (userData.subscriptionTier === "free") {
    return checkLegacyQuota(userId, mode);
  }

  // Check if user is on trial and has exhausted credits
  const isTrial = userData.subscriptionTier === "trial";
  const isTrialExhausted = isTrial && userData.creditsRemaining <= 0;

  if (isTrialExhausted) {
    return {
      allowed: false,
      remaining: 0,
      required: requiredCredits,
      error: "Trial credits exhausted. Please upgrade to a monthly plan to continue.",
      isTrialExhausted: true,
    };
  }

  // Check if subscription is active (or user is on trial with credits remaining)
  const isActive =
    userData.subscriptionStatus === "active" ||
    (isTrial && userData.creditsRemaining > 0);

  if (!isActive && userData.creditsRemaining <= 0) {
    return {
      allowed: false,
      remaining: 0,
      required: 0,
      error: "No active subscription. Please subscribe to continue.",
    };
  }

  // Check if user has enough credits
  const hasEnoughCredits = userData.creditsRemaining >= requiredCredits;

  return {
    allowed: hasEnoughCredits,
    remaining: userData.creditsRemaining,
    required: requiredCredits,
    error: hasEnoughCredits
      ? undefined
      : `Insufficient credits. Required: ${requiredCredits}, Available: ${userData.creditsRemaining}`,
    isTrialExhausted: false,
  };
}

/**
 * Deduct credits after a successful generation
 */
export async function deductCredits(
  userId: string,
  mode: GenerationMode,
  sceneCount: number = 1,
  videoGenerator?: VideoGenerator
): Promise<{ success: boolean; error?: string | undefined; remaining?: number | undefined }> {
  // Fetch current credits
  const [userData] = await db
    .select({
      subscriptionTier: user.subscriptionTier,
      creditsRemaining: user.creditsRemaining,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!userData) {
    return { success: false, error: "User not found" };
  }

  // For free tier, use legacy quota deduction
  if (userData.subscriptionTier === "free") {
    await deductLegacyQuota(userId, mode);
    return { success: true };
  }

  const creditsToDeduct = calculateRequiredCredits(mode, sceneCount, videoGenerator);

  if (userData.creditsRemaining < creditsToDeduct) {
    return { success: false, error: "Insufficient credits" };
  }

  // Deduct credits
  const [updated] = await db
    .update(user)
    .set({
      creditsRemaining: userData.creditsRemaining - creditsToDeduct,
    })
    .where(eq(user.id, userId))
    .returning({ creditsRemaining: user.creditsRemaining });

  return {
    success: true,
    remaining: updated?.creditsRemaining,
  };
}

/**
 * Add credits to a user (for admin or promotional purposes)
 */
export async function addCredits(
  userId: string,
  amount: number
): Promise<{ success: boolean; newBalance?: number | undefined; error?: string | undefined }> {
  try {
    const [userData] = await db
      .select({ creditsRemaining: user.creditsRemaining })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!userData) {
      return { success: false, error: "User not found" };
    }

    const [updated] = await db
      .update(user)
      .set({
        creditsRemaining: userData.creditsRemaining + amount,
      })
      .where(eq(user.id, userId))
      .returning({ creditsRemaining: user.creditsRemaining });

    return {
      success: true,
      newBalance: updated?.creditsRemaining,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add credits",
    };
  }
}

/**
 * Get user's current credit info
 */
export async function getUserCreditInfo(
  userId: string
): Promise<UserCreditInfo | null> {
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

  return userData || null;
}

/**
 * Check if user can purchase trial (trial is one-time only)
 */
export async function canPurchaseTrial(userId: string): Promise<boolean> {
  const [userData] = await db
    .select({
      subscriptionTier: user.subscriptionTier,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!userData) {
    return false;
  }

  // User can only purchase trial if they're on free tier
  // (not if they've already been on trial or have an active subscription)
  return userData.subscriptionTier === "free";
}

// ============================================================================
// Legacy Quota System (for backward compatibility with free tier)
// ============================================================================

async function checkLegacyQuota(
  userId: string,
  mode: GenerationMode
): Promise<CreditCheckResult> {
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
      required: 0,
      error: "User not found",
    };
  }

  // Check if quota needs reset
  const resetNeeded = shouldResetQuota(userData.quotaResetAt);
  if (resetNeeded) {
    await resetLegacyQuota(userId);
    if (mode === "MODE_B") {
      return {
        allowed: true,
        remaining: userData.dailyImageQuota,
        required: 1,
      };
    } else {
      return {
        allowed: true,
        remaining: userData.dailyVideoQuota,
        required: 1,
      };
    }
  }

  // Check quota based on mode
  if (mode === "MODE_B") {
    const remaining =
      userData.dailyImageQuota - userData.imagesGeneratedToday;
    return {
      allowed: remaining > 0,
      remaining: Math.max(0, remaining),
      required: 1,
      error: remaining <= 0 ? "Daily image quota exceeded" : undefined,
    };
  } else {
    const remaining =
      userData.dailyVideoQuota - userData.videosGeneratedToday;
    return {
      allowed: remaining > 0,
      remaining: Math.max(0, remaining),
      required: 1,
      error: remaining <= 0 ? "Daily video quota exceeded" : undefined,
    };
  }
}

async function deductLegacyQuota(
  userId: string,
  mode: GenerationMode
): Promise<void> {
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

async function resetLegacyQuota(userId: string): Promise<void> {
  await db
    .update(user)
    .set({
      videosGeneratedToday: 0,
      imagesGeneratedToday: 0,
      quotaResetAt: getNextResetTime(),
    })
    .where(eq(user.id, userId));
}

function shouldResetQuota(quotaResetAt: Date | null): boolean {
  if (!quotaResetAt) return true;
  const now = new Date();
  return now >= quotaResetAt;
}

function getNextResetTime(): Date {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCHours(24, 0, 0, 0);
  return tomorrow;
}