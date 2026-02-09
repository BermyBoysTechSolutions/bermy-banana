import type { SubscriptionTier } from "./schema";

export type Feature = "veo" | "klingStandard" | "klingPro";

const FEATURE_MAP: Record<SubscriptionTier, Record<Feature, boolean>> = {
  free: { veo: false, klingStandard: false, klingPro: false },
  trial: { veo: true, klingStandard: false, klingPro: false },
  starter: { veo: true, klingStandard: false, klingPro: false },
  pro: { veo: true, klingStandard: true, klingPro: true },
  agency: { veo: true, klingStandard: true, klingPro: true },
};

export function hasFeatureAccess(tier: SubscriptionTier, feature: Feature): boolean {
  return FEATURE_MAP[tier]?.[feature] ?? false;
}

export function hasKlingAccess(tier: SubscriptionTier): boolean {
  return hasFeatureAccess(tier, "klingStandard") || hasFeatureAccess(tier, "klingPro");
}

export function getLockedFeatures(tier: SubscriptionTier): Feature[] {
  const map = FEATURE_MAP[tier];
  if (!map) return ["veo", "klingStandard", "klingPro"];
  return (Object.entries(map) as [Feature, boolean][])
    .filter(([, allowed]) => !allowed)
    .map(([feature]) => feature);
}

export function getFeatureMap(tier: SubscriptionTier): Record<Feature, boolean> {
  return FEATURE_MAP[tier] ?? FEATURE_MAP.free;
}
