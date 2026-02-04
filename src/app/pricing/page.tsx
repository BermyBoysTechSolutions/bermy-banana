"use client";

import { useState } from "react";
import { Check, Sparkles, Zap, Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PricingTier {
  id: string;
  name: string;
  price: number;
  description: string;
  credits: number;
  videosPerMonth: number;
  imagesPerMonth: number;
  features: string[];
  popular?: boolean;
  productId: string; // Polar product ID placeholder
}

const pricingTiers: PricingTier[] = [
  {
    id: "starter",
    name: "Starter",
    price: 39,
    description: "Perfect for creators just getting started",
    credits: 800,
    videosPerMonth: 8,
    imagesPerMonth: 16,
    productId: "polar_prod_starter", // Placeholder
    features: [
      "800 credits per month",
      "~8 videos (100 credits/scene)",
      "~16 images (50 credits/image)",
      "All 3 generation modes",
      "Multi-scene video workflows",
      "1080p output quality",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 79,
    description: "For serious content creators and small teams",
    credits: 2400,
    videosPerMonth: 24,
    imagesPerMonth: 48,
    productId: "polar_prod_pro", // Placeholder
    popular: true,
    features: [
      "2,400 credits per month",
      "~24 videos (100 credits/scene)",
      "~48 images (50 credits/image)",
      "All 3 generation modes",
      "Multi-scene video workflows",
      "1080p output quality",
      "Priority processing",
      "API access",
      "Priority support",
    ],
  },
  {
    id: "agency",
    name: "Agency",
    price: 199,
    description: "For agencies and high-volume production",
    credits: 6000,
    videosPerMonth: 60,
    imagesPerMonth: 120,
    productId: "polar_prod_agency", // Placeholder
    features: [
      "6,000 credits per month",
      "~60 videos (100 credits/scene)",
      "~120 images (50 credits/image)",
      "All 3 generation modes",
      "Multi-scene video workflows",
      "1080p output quality",
      "Fastest processing",
      "API access",
      "White-label options",
      "Dedicated support",
      "Team collaboration",
    ],
  },
];

const creditInfo = [
  { type: "Video Scene", cost: 100, description: "Per 5-8 second scene" },
  { type: "Influencer Photo", cost: 50, description: "Per image generated" },
];

export default function PricingPage() {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleSubscribe = async (tier: PricingTier) => {
    try {
      setLoadingTier(tier.id);

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: tier.productId,
          tier: tier.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create checkout");
      }

      const { checkoutUrl } = await response.json();

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to start checkout"
      );
      setLoadingTier(null);
    }
  };

  return (
    <main className="flex-1 container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your content creation needs. All plans
            include access to our AI-powered UGC generation platform.
          </p>
        </div>

        {/* Credit System Info */}
        <div className="bg-muted/50 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Credit-Based System
          </h2>
          <p className="text-muted-foreground">
            Our flexible credit system lets you generate videos and images based
            on your needs. Credits roll over for 30 days.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {creditInfo.map((item) => (
              <div
                key={item.type}
                className="flex items-center justify-between p-3 bg-background rounded-md border"
              >
                <div>
                  <p className="font-medium">{item.type}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <Badge variant="secondary">{item.cost} credits</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.id}
              className={`flex flex-col ${
                tier.popular
                  ? "border-yellow-500/50 shadow-lg shadow-yellow-500/10"
                  : ""
              }`}
            >
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    {tier.id === "starter" && <Zap className="h-5 w-5 text-blue-500" />}
                    {tier.id === "pro" && <Sparkles className="h-5 w-5 text-yellow-500" />}
                    {tier.id === "agency" && <Building2 className="h-5 w-5 text-purple-500" />}
                    {tier.name}
                  </CardTitle>
                  {tier.popular && (
                    <Badge className="bg-yellow-500 text-black hover:bg-yellow-600">
                      Popular
                    </Badge>
                  )}
                </div>
                <CardDescription>{tier.description}</CardDescription>
                <div className="pt-2">
                  <span className="text-4xl font-bold">${tier.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {tier.credits.toLocaleString()} credits
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-muted rounded text-center">
                    <div className="font-semibold">~{tier.videosPerMonth}</div>
                    <div className="text-muted-foreground">videos</div>
                  </div>
                  <div className="p-2 bg-muted rounded text-center">
                    <div className="font-semibold">~{tier.imagesPerMonth}</div>
                    <div className="text-muted-foreground">images</div>
                  </div>
                </div>
                <ul className="space-y-2">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleSubscribe(tier)}
                  disabled={loadingTier === tier.id}
                  className={`w-full ${
                    tier.popular
                      ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                      : ""
                  }`}
                  variant={tier.popular ? "default" : "outline"}
                >
                  {loadingTier === tier.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Get Started"
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Competitor Comparison Link */}
        <div className="text-center">
          <a
            href="/compare"
            className="text-sm text-muted-foreground hover:text-yellow-500 transition-colors"
          >
            See how we compare to competitors →
          </a>
        </div>

        {/* FAQ or Additional Info */}
        <div className="text-center text-muted-foreground text-sm">
          <p>
            Questions? Contact us at{" "}
            <a
              href="mailto:support@bermybanana.com"
              className="text-yellow-500 hover:underline"
            >
              support@bermybanana.com
            </a>
          </p>
          <p className="mt-2">
            All subscriptions can be cancelled at any time. Credits expire after
            30 days of inactivity.
          </p>
        </div>
      </div>
    </main>
  );
}
