"use client";

import { Check, X, ArrowLeft, Sparkles, Crown, Building2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PRICING_TIERS, calculatePricePerVideo } from "@/lib/pricing";

interface Competitor {
  name: string;
  logo?: string;
  description: string;
  tiers: {
    name: string;
    price: number;
    videos: number;
    pricePerVideo: number | null;
  }[];
  features: {
    included: string[];
    excluded: string[];
  };
}

const competitors: Competitor[] = [
  {
    name: "MakeUGC",
    description: "UGC video generation platform",
    tiers: [
      { name: "Startup", price: 49, videos: 5, pricePerVideo: calculatePricePerVideo(49, 5) },
      { name: "Growth", price: 69, videos: 10, pricePerVideo: calculatePricePerVideo(69, 10) },
      { name: "Pro", price: 119, videos: 20, pricePerVideo: calculatePricePerVideo(119, 20) },
    ],
    features: {
      included: ["AI avatars", "Basic templates", "1080p export"],
      excluded: ["All 3 generation modes"],
    },
  },
  {
    name: "Arcads",
    description: "AI video creation tool",
    tiers: [
      { name: "Basic", price: 110, videos: 10, pricePerVideo: calculatePricePerVideo(110, 10) },
      { name: "Growth", price: 199, videos: 20, pricePerVideo: calculatePricePerVideo(199, 20) },
      { name: "Scale", price: 399, videos: 50, pricePerVideo: calculatePricePerVideo(399, 50) },
    ],
    features: {
      included: ["AI presenters", "Multi-language", "Basic analytics"],
      excluded: ["Trial"],
    },
  },
];

interface BermyTier {
  name: string;
  icon: typeof Zap;
  iconColor: string;
  price: number;
  credits: number;
  videos: number;
  pricePerVideo: number | null;
  popular: boolean;
}

// Bermy tiers dynamically calculated from shared pricing data
const bermyTiers: BermyTier[] = PRICING_TIERS
  .filter(tier => tier.id !== 'trial' && tier.id !== 'enterprise')
  .map(tier => ({
    name: tier.name,
    icon: tier.id === 'starter' ? Zap : tier.id === 'pro' ? Sparkles : Building2,
    iconColor: tier.id === 'starter' ? "text-blue-500" : tier.id === 'pro' ? "text-yellow-500" : "text-purple-500",
    price: tier.price!,
    credits: tier.credits!,
    videos: tier.videosPerMonth!,
    pricePerVideo: calculatePricePerVideo(tier.price, tier.videosPerMonth),
    popular: tier.popular ?? false,
  }));

const bermyAdvantages = [
  {
    title: "Better Price Per Video",
    description: "Up to 60% lower cost per video compared to competitors",
  },
  {
    title: "All 3 Modes Included",
    description: "Avatar demos, influencer photos, and hands-only videos in every plan",
  },
  {
    title: "No Hidden Limits",
    description: "Use credits for videos OR images - total flexibility",
  },
  {
    title: "1080p Quality",
    description: "High-quality output on all plans",
  },
  {
    title: "Flexible Trial",
    description: "$9 trial with 500 credits that never expire",
  },
];

export default function ComparePage() {
  return (
    <main className="flex-1 container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <Button variant="ghost" className="pl-0" asChild>
            <a href="/pricing">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Pricing
            </a>
          </Button>
          <h1 className="text-4xl font-bold tracking-tight">
            Why Choose Bermy Banana?
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            See how we compare to other UGC platforms. More value, more flexibility, no surprises.
          </p>
        </div>

        {/* Bermy Banana Pricing Highlight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {bermyTiers.map((tier) => (
            <Card
              key={tier.name}
              className={`relative ${
                tier.popular
                  ? "border-yellow-500/50 shadow-lg shadow-yellow-500/10"
                  : "border-border"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-yellow-500 text-black hover:bg-yellow-600">
                    <Crown className="w-3 h-3 mr-1" />
                    Best Value
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <tier.icon className={`h-5 w-5 ${tier.iconColor}`} />
                  {tier.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-3xl font-bold">${tier.price}</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Videos:</span>
                    <span className="font-medium">~{tier.videos}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price/video:</span>
                    <span className="font-medium text-green-500">${tier.pricePerVideo?.toFixed(2) ?? '—'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Price Comparison Table */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Price Per Video Comparison</h2>
          <div className="rounded-lg border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">Platform</th>
                    <th className="text-center py-3 px-4 font-medium">Entry Plan</th>
                    <th className="text-center py-3 px-4 font-medium">Mid Plan</th>
                    <th className="text-center py-3 px-4 font-medium">Pro Plan</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {/* Bermy Banana Row */}
                  <tr className="bg-yellow-500/5">
                    <td className="py-4 px-4 font-semibold text-yellow-500">
                      Bermy Banana
                    </td>
                    {bermyTiers.map((tier) => (
                      <td key={tier.name} className="py-4 px-4 text-center">
                        <div className="font-bold text-green-500">
                          ${tier.pricePerVideo?.toFixed(2) ?? '—'}
                        </div>
                        <div className="text-xs text-muted-foreground">{tier.name} (${tier.price})</div>
                      </td>
                    ))}
                  </tr>
                  {competitors.map((competitor) => (
                    <tr key={competitor.name} className="hover:bg-muted/30">
                      <td className="py-4 px-4 font-medium">{competitor.name}</td>
                      {competitor.tiers.map((tier) => (
                        <td key={tier.name} className="py-4 px-4 text-center">
                          <div className="font-medium">${tier.pricePerVideo?.toFixed(2) ?? '—'}</div>
                          <div className="text-xs text-muted-foreground">
                            {tier.name} (${tier.price})
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Price per video is calculated based on typical usage. Bermy Banana offers up to 60% lower cost per video.
          </p>
        </div>

        {/* Feature Comparison */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Feature Comparison</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Bermy Banana */}
            <Card className="border-yellow-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-yellow-500">Bermy Banana</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="space-y-2">
                  {[
                    "All 3 generation modes",
                    "Custom AI avatars",
                    "Multi-scene workflows",
                    "1080p output",
                    "Priority support",
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Competitors */}
            {competitors.map((competitor) => (
              <Card key={competitor.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{competitor.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="space-y-2">
                    {competitor.features.included.map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                    {competitor.features.excluded.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-muted-foreground">
                        <X className="h-4 w-4 text-red-500 shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bermy Advantages */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">The Bermy Banana Advantage</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bermyAdvantages.map((advantage) => (
              <Card key={advantage.title}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{advantage.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {advantage.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4 py-8">
          <h2 className="text-2xl font-bold">Ready to create more for less?</h2>
          <p className="text-muted-foreground">
            Join creators who are saving money and creating better UGC content.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black">
              <a href="/pricing">Get Started</a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="/examples">View Examples</a>
            </Button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-center text-xs text-muted-foreground border-t pt-8">
          <p>
            Pricing and features are based on publicly available information as of February 2026.
            Competitor pricing may have changed. Please verify current pricing on their respective websites.
          </p>
        </div>
      </div>
    </main>
  );
}
