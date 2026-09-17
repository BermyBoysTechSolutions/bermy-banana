import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ExampleGallery } from "@/components/examples/example-gallery";
import { Button } from "@/components/ui/button";

export default function ExamplesPage() {
  return (
    <main className="flex-1 container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Button variant="ghost" className="pl-0" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
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
        <ExampleGallery />

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
