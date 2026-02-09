"use client";

import { useState } from "react";
import { Check, X, Sparkles, Zap, Building2, Briefcase, Loader2, Gift } from "lucide-react";
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

import { type PricingTierData } from "@/lib/pricing";

interface PricingTier extends PricingTierData {
  description: string;
  features: string[];
  productId: string;
}

const pricingTiers: PricingTier[] = [
  {
    id: "trial",
    name: "Trial",
    price: 9,
    description: "Try before you commit - perfect for testing",
    credits: 500,
    videosPerMonth: 5,
    imagesPerMonth: 10,
    productId: process.env.NEXT_PUBLIC_POLAR_TRIAL_PRODUCT_ID || "ea6fec5c-f397-4721-913b-b71a105c15c1",
    oneTime: true,
    features: [
      "500 credits (one-time)",
      "~5 videos (100 credits/scene)",
      "~10 images (50 credits/image)",
      "All 3 generation modes",
      "Full feature access",
      "No monthly commitment",
      "Credits never expire",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: 39,
    description: "Perfect for creators just getting started",
    credits: 800,
    videosPerMonth: 8,
    imagesPerMonth: 16,
    productId: process.env.NEXT_PUBLIC_POLAR_STARTER_PRODUCT_ID || "519cbedf-8388-40e3-b6ff-ec91ee9fc648",
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
    productId: process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID || "6e22424b-5e37-43e8-8113-8f92be71f617",
    popular: true,
    features: [
      "2,400 credits per month",
      "~24 videos (100 credits/scene)",
      "~48 images (50 credits/image)",
      "All 3 generation modes",
      "Multi-scene video workflows",
      "1080p output quality",
      "Priority processing",
    ],
  },
  {
    id: "agency",
    name: "Agency",
    price: 179,
    description: "For agencies and high-volume production",
    credits: 6000,
    videosPerMonth: 67,
    imagesPerMonth: 120,
    productId: process.env.NEXT_PUBLIC_POLAR_AGENCY_PRODUCT_ID || "265c8fc4-ad32-408d-9327-8ac82a8730f8",
    features: [
      "6,000 credits per month",
      "~67 videos (100 credits/scene)",
      "~120 images (50 credits/image)",
      "All 3 generation modes",
      "Multi-scene video workflows",
      "1080p output quality",
      "Fastest processing",
      "Dedicated support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: null,
    description: "For large organizations with custom needs",
    credits: null,
    videosPerMonth: null,
    imagesPerMonth: null,
    contactSales: true,
    productId: "polar_prod_enterprise", // Placeholder
    features: [
      "Custom credit packages",
      "Dedicated support",
      "Custom AI avatar training",
      "API access",
      "White-label options",
      "Team collaboration",
      "SLA guarantee",
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

      // Redirect to Polar checkout with product ID as query param
      const checkoutUrl = `/api/checkout?products=${tier.productId}`;
      window.location.href = checkoutUrl;
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
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
                    {tier.id === "trial" && <Gift className="h-5 w-5 text-green-500" />}
                    {tier.id === "starter" && <Zap className="h-5 w-5 text-blue-500" />}
                    {tier.id === "pro" && <Sparkles className="h-5 w-5 text-yellow-500" />}
                    {tier.id === "agency" && <Building2 className="h-5 w-5 text-purple-500" />}
                    {tier.id === "enterprise" && <Briefcase className="h-5 w-5 text-red-500" />}
                    {tier.name}
                  </CardTitle>
                  {tier.popular && (
                    <Badge className="bg-yellow-500 text-black hover:bg-yellow-600">
                      Popular
                    </Badge>
                  )}
                  {tier.oneTime && (
                    <Badge variant="outline" className="border-green-500 text-green-600">
                      One-time
                    </Badge>
                  )}
                </div>
                <CardDescription>{tier.description}</CardDescription>
                {tier.contactSales ? (
                  <div className="pt-2">
                    <span className="text-3xl font-bold">Contact Sales</span>
                  </div>
                ) : (
                  <>
                    <div className="pt-2">
                      <span className="text-4xl font-bold">${tier.price}</span>
                      {tier.oneTime ? (
                        <span className="text-muted-foreground"> one-time</span>
                      ) : (
                        <span className="text-muted-foreground">/month</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {tier.credits?.toLocaleString()} credits
                      {tier.oneTime && <span className="text-green-600 font-medium"> (never expires)</span>}
                    </div>
                  </>
                )}
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                {!tier.contactSales && (
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
                )}
                {!tier.contactSales && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">AI Video Models</p>
                    <div className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>Veo video generation</span>
                    </div>
                    {tier.id === "pro" || tier.id === "agency" ? (
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>Kling Standard &amp; Pro</span>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <X className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                        <span>Kling Standard &amp; Pro (Pro plan required)</span>
                      </div>
                    )}
                  </div>
                )}
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
                {tier.contactSales ? (
                  <Button
                    asChild
                    className="w-full"
                    variant="outline"
                  >
                    <a href="mailto:sales@bermybanana.com">Contact Sales</a>
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSubscribe(tier)}
                    disabled={loadingTier === tier.id}
                    className={`w-full ${
                      tier.popular
                        ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                        : tier.oneTime
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : ""
                    }`}
                    variant={tier.popular || tier.oneTime ? "default" : "outline"}
                  >
                    {loadingTier === tier.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : tier.oneTime ? (
                      "Get Trial Access"
                    ) : (
                      "Get Started"
                    )}
                  </Button>
                )}
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
            All subscriptions can be cancelled at any time. Trial credits never expire.
            Monthly credits expire after 30 days of inactivity.
          </p>
        </div>
      </div>
    </main>
  );
}