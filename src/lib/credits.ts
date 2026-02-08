/**
 * Credit system constants for Bermy Banana
 * Pricing for all AI generation services
 */

// Provider credit costs
export const CREDIT_COSTS = {
  // Video generation
  VEO: 100,                    // Veo 3.1 standard
  KLING_STANDARD: 150,         // Kling AI standard tier
  KLING_PRO: 300,              // Kling AI pro tier
  
  // Other services can be added here
  // IMAGE_GENERATION: 10,
  // TEXT_GENERATION: 5,
} as const;

// Provider names for UI display
export const PROVIDER_DISPLAY_NAMES = {
  veo: 'Veo',
  'kling-standard': 'Kling Standard',
  'kling-pro': 'Kling Pro',
} as const;

// Provider descriptions
export const PROVIDER_DESCRIPTIONS = {
  veo: 'Google Veo 3.1 - Reliable video generation',
  'kling-standard': 'Kling AI Standard - 5-7 second videos',
  'kling-pro': 'Kling AI Pro - 8-10 second videos',
} as const;

/**
 * Get credit cost for a provider and tier
 */
export function getCreditCost(provider: string): number {
  if (provider === 'veo') return CREDIT_COSTS.VEO;
  if (provider === 'kling-standard') return CREDIT_COSTS.KLING_STANDARD;
  if (provider === 'kling-pro') return CREDIT_COSTS.KLING_PRO;
  
  // Default to Veo cost if unknown
  return CREDIT_COSTS.VEO;
}

/**
 * Format credit cost for display
 */
export function formatCreditCost(cost: number): string {
  return `${cost} credit${cost === 1 ? '' : 's'}`;
}

/**
 * Get provider display name
 */
export function getProviderDisplayName(provider: string): string {
  return PROVIDER_DISPLAY_NAMES[provider as keyof typeof PROVIDER_DISPLAY_NAMES] || provider;
}

/**
 * Get provider description
 */
export function getProviderDescription(provider: string): string {
  return PROVIDER_DESCRIPTIONS[provider as keyof typeof PROVIDER_DESCRIPTIONS] || provider;
}