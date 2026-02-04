"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Lock, Video, ImageIcon, Package, Clock, ImagePlus, Upload, X, Loader2 } from "lucide-react";
import { UserProfile } from "@/components/auth/user-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSession } from "@/lib/auth-client";
import Image from "next/image";

interface ReferenceImage {
  id: string;
  name: string;
  imageUrl: string;
  description?: string;
}

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  
  // Reference images state
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const [loadingReferenceImages, setLoadingReferenceImages] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Fetch reference images
  useEffect(() => {
    async function fetchReferenceImages() {
      if (!session) return;
      
      try {
        const res = await fetch("/api/reference-images");
        if (res.ok) {
          const data = await res.json();
          setReferenceImages(data.images || []);
        }
      } catch (err) {
        console.error("Failed to fetch reference images:", err);
      } finally {
        setLoadingReferenceImages(false);
      }
    }

    fetchReferenceImages();
  }, [session]);

  const handleUploadReferenceImage = async () => {
    if (!uploadFile || !uploadName.trim()) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("name", uploadName.trim());
      if (uploadDescription) {
        formData.append("description", uploadDescription.trim());
      }

      const res = await fetch("/api/reference-images", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await res.json();
      setReferenceImages([data.image, ...referenceImages]);
      setUploadDialogOpen(false);
      setUploadFile(null);
      setUploadName("");
      setUploadDescription("");
    } catch (err) {
      console.error("Failed to upload reference image:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteReferenceImage = async (id: string) => {
    try {
      const res = await fetch(`/api/reference-images/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete");
      }

      setReferenceImages(referenceImages.filter((img) => img.id !== id));
    } catch (err) {
      console.error("Failed to delete reference image:", err);
    }
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      if (!uploadName) {
        setUploadName(file.name.split(".")[0] || "");
      }
    }
  }, [uploadName]);

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

      {/* Reference Images Section */}
      <h2 className="text-xl font-semibold mb-4">Reference Images</h2>
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Manage Reference Images</CardTitle>
              <CardDescription>
                Upload images from previous generations to use as starting points for editing
              </CardDescription>
            </div>
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Reference Image</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="ref-file">Image File</Label>
                    <Input
                      id="ref-file"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="mt-1"
                    />
                    {uploadFile && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Selected: {uploadFile.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="ref-name">Name</Label>
                    <Input
                      id="ref-name"
                      value={uploadName}
                      onChange={(e) => setUploadName(e.target.value)}
                      placeholder="My Reference Image"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ref-desc">Description (Optional)</Label>
                    <Textarea
                      id="ref-desc"
                      value={uploadDescription}
                      onChange={(e) => setUploadDescription(e.target.value)}
                      placeholder="Description of this reference image..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                  <Button
                    onClick={handleUploadReferenceImage}
                    disabled={!uploadFile || !uploadName.trim() || isUploading}
                    className="w-full"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Upload Reference Image"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loadingReferenceImages ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : referenceImages.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-lg">
              <ImagePlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No reference images yet. Upload images you&apos;ve generated to use them as starting points for edits.
              </p>
              <Button variant="outline" onClick={() => setUploadDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Your First Image
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {referenceImages.map((img) => (
                <div key={img.id} className="relative group">
                  <Link href={`/mode-b?ref=${img.id}`}>
                    <div className="relative aspect-square rounded-lg overflow-hidden border border-border hover:border-pink-500 transition-colors cursor-pointer">
                      <Image
                        src={img.imageUrl}
                        alt={img.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-xs text-white truncate">
                          {img.name}
                        </p>
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleDeleteReferenceImage(img.id)}
                    className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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