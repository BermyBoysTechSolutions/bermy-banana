"use client";

import Link from "next/link";
import { Banana, Video, ImageIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { ExampleCarousel } from "@/components/carousel/example-carousel";

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="flex-1 container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-yellow-400/20">
              <Banana className="h-7 w-7 text-yellow-500" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 bg-clip-text text-transparent text-center">
              Bermy Banana
            </h1>
          </div>
          <h2 className="text-2xl font-semibold text-muted-foreground">
            AI-Powered UGC Generation
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create stunning influencer photos, talking head videos, and product
            demos with multi-scene workflows. Premium UGC quality without the premium agency markup.
          </p>
        </div>

        <div className="flex justify-center gap-4">
          {session ? (
            <Button asChild size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button asChild size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black">
              <Link href="/pricing">Get Started</Link>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 border rounded-lg space-y-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10 mx-auto">
              <Video className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className="font-semibold">UGC Talking Videos</h3>
            <p className="text-sm text-muted-foreground">
              Create multi-scene talking head videos with your AI avatar.
              Perfect for ads, testimonials, and product demos.
            </p>
          </div>

          <div className="p-6 border rounded-lg space-y-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-pink-500/10 mx-auto">
              <ImageIcon className="h-5 w-5 text-pink-500" />
            </div>
            <h3 className="font-semibold">Influencer Photos</h3>
            <p className="text-sm text-muted-foreground">
              Generate realistic &quot;phone-captured&quot; style photos of your AI
              avatar for social media content.
            </p>
          </div>

          <div className="p-6 border rounded-lg space-y-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500/10 mx-auto">
              <Sparkles className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="font-semibold">Product Videos</h3>
            <p className="text-sm text-muted-foreground">
              Show off products with AI avatars holding, pointing, unboxing,
              or demonstrating your items.
            </p>
          </div>
        </div>

        {/* Example Content Carousel */}
        <div className="mt-16 pt-8 border-t border-zinc-800">
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-2">See It In Action</h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Browse examples of AI-generated UGC content. From talking head videos 
              to influencer-style photos and product demos.
            </p>
          </div>
          <ExampleCarousel />
        </div>
      </div>
    </main>
  );
}// Force deploy Wed Feb  4 01:57:32 PM EST 2026
