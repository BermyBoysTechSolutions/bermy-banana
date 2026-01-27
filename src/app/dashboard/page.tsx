"use client";

import Link from "next/link";
import { Lock, Video, ImageIcon, Package, Clock } from "lucide-react";
import { UserProfile } from "@/components/auth/user-profile";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-8">
            <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Protected Page</h1>
            <p className="text-muted-foreground mb-6">
              You need to sign in to access the dashboard
            </p>
          </div>
          <UserProfile />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session.user.name}
          </p>
        </div>
      </div>

      {/* Generation Mode Cards */}
      <h2 className="text-xl font-semibold mb-4">Create Content</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 border border-border rounded-lg bg-gradient-to-br from-blue-500/5 to-transparent">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10">
              <Video className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold">UGC Video</h3>
          </div>
          <p className="text-muted-foreground mb-4 text-sm">
            Create talking head videos with your avatar, optional product, and multi-scene scripts.
          </p>
          <Button asChild className="w-full">
            <Link href="/mode-a">Create Video</Link>
          </Button>
        </div>

        <div className="p-6 border border-border rounded-lg bg-gradient-to-br from-pink-500/5 to-transparent">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-pink-500/10">
              <ImageIcon className="h-5 w-5 text-pink-500" />
            </div>
            <h3 className="text-lg font-semibold">Influencer Photo</h3>
          </div>
          <p className="text-muted-foreground mb-4 text-sm">
            Generate realistic phone-captured style photos of your AI avatar for social media.
          </p>
          <Button asChild className="w-full">
            <Link href="/mode-b">Create Photo</Link>
          </Button>
        </div>

        <div className="p-6 border border-border rounded-lg bg-gradient-to-br from-green-500/5 to-transparent">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500/10">
              <Package className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold">Product Video</h3>
          </div>
          <p className="text-muted-foreground mb-4 text-sm">
            Create product demos with avatars holding, pointing, unboxing, or using your products.
          </p>
          <Button asChild className="w-full">
            <Link href="/mode-c">Create Product Video</Link>
          </Button>
        </div>
      </div>

      {/* Quick Links */}
      <h2 className="text-xl font-semibold mb-4">Manage Assets</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 border border-border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Avatars</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Manage your AI personas and reference images
          </p>
          <Button asChild variant="outline">
            <Link href="/avatars">View Avatars</Link>
          </Button>
        </div>

        <div className="p-6 border border-border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Products</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Upload and manage product images for demos
          </p>
          <Button asChild variant="outline">
            <Link href="/products">View Products</Link>
          </Button>
        </div>
      </div>

      {/* Recent Outputs Placeholder */}
      <h2 className="text-xl font-semibold mb-4">Recent Outputs</h2>
      <div className="p-8 border border-dashed border-border rounded-lg text-center">
        <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">
          No outputs yet. Start creating to see your generated content here.
        </p>
      </div>
    </div>
  );
}
