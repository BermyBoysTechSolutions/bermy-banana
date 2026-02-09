"use client";

import { useState, useEffect } from "react";
import type { SubscriptionTier } from "@/lib/schema";
import type { Feature } from "@/lib/features";
import { hasFeatureAccess, hasKlingAccess, getLockedFeatures, getFeatureMap } from "@/lib/features";

interface TierFeaturesState {
  tier: SubscriptionTier;
  loading: boolean;
  hasAccess: (feature: Feature) => boolean;
  hasKling: boolean;
  lockedFeatures: Feature[];
  featureMap: Record<Feature, boolean>;
}

export function useTierFeatures(): TierFeaturesState {
  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTier() {
      try {
        const res = await fetch("/api/user/credits");
        if (res.ok) {
          const data = await res.json();
          setTier((data.effectiveTier ?? data.subscriptionTier ?? "free") as SubscriptionTier);
        }
      } catch {
        // Default to free on error
      } finally {
        setLoading(false);
      }
    }
    fetchTier();
  }, []);

  return {
    tier,
    loading,
    hasAccess: (feature: Feature) => hasFeatureAccess(tier, feature),
    hasKling: hasKlingAccess(tier),
    lockedFeatures: getLockedFeatures(tier),
    featureMap: getFeatureMap(tier),
  };
}
