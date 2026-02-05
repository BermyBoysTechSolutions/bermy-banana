"use client";

import { ArrowLeft, Play, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

// Same content as the landing page carousel - easy to replace with actual images/GIFs
const EXAMPLES = [
  { id: 1, label: "Example 1", type: "image", description: "Influencer-style photo with product placement" },
  { id: 2, label: "Example 2", type: "video", description: "Multi-scene UGC talking head video" },
  { id: 3, label: "Example 3", type: "image", description: "Lifestyle photo for social media" },
  { id: 4, label: "Example 4", type: "image", description: "Product demonstration photo" },
  { id: 5, label: "Example 5", type: "video", description: "Product unboxing video with AI avatar" },
  { id: 6, label: "Example 6", type: "image", description: "Casual testimonial-style photo" },
];

export default function ExamplesPage() {
  return (
    <main className="flex-1 container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Button variant="ghost" className="pl-0" asChild>
            <a href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </a>
          </Button>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              Examples
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Browse our gallery of AI-generated UGC content. From talking head videos 
              to influencer-style photos and product demos.
            </p>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {EXAMPLES.map((example) => (
            <div
              key={example.id}
              className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-zinc-800 shadow-lg border border-zinc-700/50 hover:border-yellow-500/50 transition-all hover:shadow-xl hover:shadow-yellow-500/5"
            >
              {/* Placeholder Content - Replace with actual images/GIFs */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                <div className="w-20 h-20 rounded-full bg-zinc-700/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {example.type === "video" ? (
                    <Play className="w-10 h-10 text-zinc-400 fill-current" />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-zinc-400" />
                  )}
                </div>
                <span className="text-zinc-400 font-medium text-lg">{example.label}</span>
                <span className="text-zinc-500 text-sm mt-1">
                  {example.type === "video" ? "Video/GIF" : "Image"}
                </span>
              </div>

              {/* Hover overlay with description */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end p-6 text-center">
                <span className="text-white font-semibold text-lg mb-2">
                  {example.label}
                </span>
                <span className="text-white/80 text-sm">
                  {example.description}
                </span>
                <span className="text-white/60 text-xs mt-3 px-3 py-1 rounded-full bg-white/10">
                  Replace with your {example.type === "video" ? "video/GIF" : "image"}
                </span>
              </div>

              {/* Type badge */}
              <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm">
                <span className="text-xs text-white/90 font-medium">
                  {example.type === "video" ? "Video" : "Image"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center space-y-4 py-8 border-t border-zinc-800">
          <h2 className="text-2xl font-bold">Ready to create your own?</h2>
          <p className="text-muted-foreground">
            Start generating AI-powered UGC content for your brand today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black">
              <a href="/pricing">Get Started</a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="/compare">Compare Plans</a>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
