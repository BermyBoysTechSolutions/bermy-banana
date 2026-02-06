"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ImageIcon, Loader2, Download, RefreshCw, Package, Upload, X, ImagePlus } from "lucide-react";
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

interface Avatar {
  id: string;
  name: string;
  referenceImageUrl: string;
}

interface Product {
  id: string;
  name: string;
  imageUrl: string;
}

interface ReferenceImage {
  id: string;
  name: string;
  imageUrl: string;
}

type Style = "casual" | "professional" | "lifestyle" | "selfie";
type AspectRatio = "16:9" | "9:16" | "1:1";

const STYLE_OPTIONS: { value: Style; label: string; description: string }[] = [
  {
    value: "casual",
    label: "Casual",
    description: "Natural, relaxed social media aesthetic",
  },
  {
    value: "professional",
    label: "Professional",
    description: "Polished, brand-ready appearance",
  },
  {
    value: "lifestyle",
    label: "Lifestyle",
    description: "Aspirational, editorial quality",
  },
  {
    value: "selfie",
    label: "Selfie",
    description: "Phone camera perspective, close-up",
  },
];

const ASPECT_RATIO_OPTIONS: { value: AspectRatio; label: string; icon: React.ReactNode }[] = [
  { value: "16:9", label: "16:9", icon: <div className="w-4 h-2.5 border-2 border-current rounded-sm" /> },
  { value: "9:16", label: "9:16", icon: <div className="w-2.5 h-4 border-2 border-current rounded-sm" /> },
  { value: "1:1", label: "1:1", icon: <div className="w-3.5 h-3.5 border-2 border-current rounded-sm" /> },
];

export default function ModeBPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const [loadingAvatars, setLoadingAvatars] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingReferenceImages, setLoadingReferenceImages] = useState(true);

  // Form state
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedReferenceImageId, setSelectedReferenceImageId] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<Style>("casual");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");
  const [title, setTitle] = useState("");

  // Upload dialog state
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      if (!session) return;

      // Fetch avatars
      try {
        const res = await fetch("/api/avatars");
        if (res.ok) {
          const data = await res.json();
          setAvatars(data.avatars || []);
        }
      } catch (err) {
        console.error("Failed to fetch avatars:", err);
      } finally {
        setLoadingAvatars(false);
      }

      // Fetch products
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoadingProducts(false);
      }

      // Fetch reference images
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

    fetchData();
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
      setSelectedReferenceImageId(data.image.id);
      setUploadDialogOpen(false);
      setUploadFile(null);
      setUploadName("");
      setUploadDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
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
      if (selectedReferenceImageId === id) {
        setSelectedReferenceImageId("");
      }
    } catch (err) {
      console.error("Failed to delete reference image:", err);
    }
  };

  const handleGenerate = async () => {
    // Must have either avatar OR reference image, but not both
    if ((!selectedAvatarId && !selectedReferenceImageId) || !prompt.trim()) {
      setError("Please select an avatar OR a reference image, and enter a prompt");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImageUrl(null);

    try {
      const body: Record<string, unknown> = {
        mode: "MODE_B",
        prompt: prompt.trim(),
        style,
        title: title.trim() || undefined,
        aspectRatio,
      };

      // Use reference image if selected, otherwise use avatar
      if (selectedReferenceImageId) {
        body.referenceImageId = selectedReferenceImageId;
      } else if (selectedAvatarId) {
        body.avatarId = selectedAvatarId;
      }

      if (selectedProductId) {
        body.productId = selectedProductId;
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Generation failed");
      }

      setGeneratedImageUrl(data.outputUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setGeneratedImageUrl(null);
    setError(null);
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

  if (sessionLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Sign in Required</h1>
        <p className="text-muted-foreground mb-6">
          Please sign in to generate influencer photos.
        </p>
        <Button asChild>
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-pink-500/10">
            <ImageIcon className="h-5 w-5 text-pink-500" />
          </div>
          Influencer Photo
        </h1>
        <p className="text-muted-foreground mt-2">
          Generate realistic phone-captured style photos of your AI avatar for
          social media.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Form */}
        <div className="space-y-6">
          {/* Avatar Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">1. Generate From Avatar</CardTitle>
              <CardDescription>
                Choose an avatar to generate from (or use reference image below)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAvatars ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : avatars.length === 0 ? (
                <div className="text-center py-8 border border-dashed rounded-lg">
                  <p className="text-muted-foreground mb-4">
                    No avatars found. Create one first.
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/avatars">Create Avatar</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {avatars.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => {
                        setSelectedAvatarId(avatar.id);
                        setSelectedReferenceImageId(""); // Deselect reference image
                      }}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedAvatarId === avatar.id
                          ? "border-pink-500 ring-2 ring-pink-500/20"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <Image
                        src={avatar.referenceImageUrl}
                        alt={avatar.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <p className="text-xs text-white truncate">
                          {avatar.name}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reference Image Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">2. Generate From Reference Image</CardTitle>
              <CardDescription>
                Use a reference image as starting point instead of an avatar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
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
                {selectedReferenceImageId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedReferenceImageId("")}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>

              {loadingReferenceImages ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : referenceImages.length === 0 ? (
                <div className="text-center py-6 border border-dashed rounded-lg">
                  <ImagePlus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No reference images yet. Upload one to use as a starting point.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {referenceImages.map((img) => (
                    <div key={img.id} className="relative group">
                      <button
                        onClick={() => {
                        setSelectedReferenceImageId(img.id);
                        setSelectedAvatarId(""); // Deselect avatar
                      }}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all w-full ${
                          selectedReferenceImageId === img.id
                            ? "border-pink-500 ring-2 ring-pink-500/20"
                            : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        <Image
                          src={img.imageUrl}
                          alt={img.name}
                          fill
                          className="object-cover"
                        />
                      </button>
                      <button
                        onClick={() => handleDeleteReferenceImage(img.id)}
                        className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">3. Select Product (Optional)</CardTitle>
              <CardDescription>
                Include a product in the photo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant={selectedProductId === "" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedProductId("")}
                >
                  None
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/products">
                    <Package className="h-4 w-4 mr-1" />
                    Manage Products
                  </Link>
                </Button>
              </div>

              {loadingProducts ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-6 border border-dashed rounded-lg">
                  <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    No products yet.
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/products">Add Product</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => setSelectedProductId(product.id)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedProductId === product.id
                          ? "border-pink-500 ring-2 ring-pink-500/20"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                        <p className="text-xs text-white truncate">
                          {product.name}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Style Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">4. Choose Style</CardTitle>
              <CardDescription>
                Select the photo style
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {STYLE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setStyle(option.value)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      style === option.value
                        ? "border-pink-500 bg-pink-500/5"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <p className="font-medium text-sm">{option.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Aspect Ratio Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">5. Aspect Ratio</CardTitle>
              <CardDescription>
                Choose the output format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                {ASPECT_RATIO_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setAspectRatio(option.value)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all flex-1 ${
                      aspectRatio === option.value
                        ? "border-pink-500 bg-pink-500/10 text-pink-600"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    {option.icon}
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Prompt */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">6. Describe the Scene</CardTitle>
              <CardDescription>
                What should the avatar be doing? Where are they?
                {selectedProductId && (
                  <span className="block text-pink-600 mt-1">
                    Tip: The selected product will be automatically included. You can reference it in your prompt (e.g., &quot;holding the product&quot;).
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="prompt">Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder="A young woman taking a selfie at a trendy coffee shop, holding a latte, warm natural lighting"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="title">Title (optional)</Label>
                <Input
                  id="title"
                  placeholder="My Coffee Shop Photo"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || (!selectedAvatarId && !selectedReferenceImageId) || !prompt.trim()}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Photo"
            )}
          </Button>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>

        {/* Right Column - Preview */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Preview</CardTitle>
              <CardDescription>
                Your generated photo will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-[9/16] bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                {isGenerating ? (
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Generating your photo...
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This may take a moment
                    </p>
                  </div>
                ) : generatedImageUrl ? (
                  <a href={generatedImageUrl} download={`mode-b-${Date.now()}.png`} className="relative w-full h-full block group">
                    <Image
                      src={generatedImageUrl}
                      alt="Generated photo"
                      fill
                      className="object-cover transition-opacity group-hover:opacity-90"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                       <div className="bg-white/90 p-2 rounded-full shadow-lg">
                          <Download className="h-6 w-6 text-pink-600" />
                       </div>
                    </div>
                  </a>
                ) : (
                  <div className="text-center p-8">
                    <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Select an avatar and enter a prompt to generate a photo
                    </p>
                  </div>
                )}
              </div>

              {generatedImageUrl && (
                <div className="flex gap-3 mt-4">
                  <Button asChild className="flex-1">
                    <a href={generatedImageUrl} download>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </a>
                  </Button>
                  <Button variant="outline" onClick={handleReset}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    New Photo
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}// Deployment trigger Wed Feb  4 12:08:35 PM EST 2026
