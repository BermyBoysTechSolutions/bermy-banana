// Shared pricing constants - Single source of truth
// Update these values and both pricing + comparison pages will sync

export interface PricingTierData {
  id: string;
  name: string;
  price: number | null;
  credits: number | null;
  videosPerMonth: number | null;
  imagesPerMonth: number | null;
  popular?: boolean;
  contactSales?: boolean;
  oneTime?: boolean;
}

// Core pricing data - EDIT HERE to update everywhere
export const PRICING_TIERS: PricingTierData[] = [
  {
    id: "trial",
    name: "Trial",
    price: 9,
    credits: 500,
    videosPerMonth: 5,
    imagesPerMonth: 10,
    oneTime: true,
  },
  {
    id: "starter",
    name: "Starter",
    price: 39,
    credits: 800,
    videosPerMonth: 8,
    imagesPerMonth: 16,
  },
  {
    id: "pro",
    name: "Pro",
    price: 79,
    credits: 2400,
    videosPerMonth: 24,
    imagesPerMonth: 48,
    popular: true,
  },
  {
    id: "agency",
    name: "Agency",
    price: 179,
    credits: 6000,
    videosPerMonth: 67,
    imagesPerMonth: 120,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: null,
    credits: null,
    videosPerMonth: null,
    imagesPerMonth: null,
    contactSales: true,
  },
];

// Credit costs
export const CREDIT_COSTS = {
  VIDEO_SCENE: 100,
  IMAGE: 50,
} as const;

// Calculate price per video dynamically
export function calculatePricePerVideo(price: number | null, videosPerMonth: number | null): number | null {
  if (price === null || videosPerMonth === null || videosPerMonth === 0) {
    return null;
  }
  return Math.round((price / videosPerMonth) * 100) / 100;
}

// Calculate price per image dynamically  
export function calculatePricePerImage(price: number | null, imagesPerMonth: number | null): number | null {
  if (price === null || imagesPerMonth === null || imagesPerMonth === 0) {
    return null;
  }
  return Math.round((price / imagesPerMonth) * 100) / 100;
}

// Get tier by ID
export function getTierById(id: string): PricingTierData | undefined {
  return PRICING_TIERS.find(tier => tier.id === id);
}

// Competitor data (static - they don't share APIs!)
export interface CompetitorTier {
  name: string;
  price: number;
  videos: number;
  pricePerVideo: number | null; // Will be calculated
}

export const COMPETITOR_TIERS: Omit<CompetitorTier, 'pricePerVideo'>[] = [
  { name: "MakeUGC Startup", price: 49, videos: 5 },
  { name: "MakeUGC Growth", price: 69, videos: 10 },
  { name: "MakeUGC Pro", price: 119, videos: 20 },
  { name: "Speel Basic", price: 59, videos: 12 },
  { name: "Speel Pro", price: 99, videos: 25 },
  { name: "Arcads Starter", price: 79, videos: 10 },
  { name: "Arcads Business", price: 149, videos: 25 },
];

// Calculate competitor prices dynamically too
export function getCompetitorTiersWithPrices(): CompetitorTier[] {
  return COMPETITOR_TIERS.map(tier => ({
    ...tier,
    pricePerVideo: calculatePricePerVideo(tier.price, tier.videos),
  }));
}