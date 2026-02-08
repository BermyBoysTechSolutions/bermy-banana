"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Package,
  Loader2,
  Download,
  RefreshCw,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Play,
  FileText,
  Hand,
  MousePointer,
  Sparkles,
  PackageOpen,
  Monitor,
  User,
  Upload,
  ImagePlus,
  X
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSession } from "@/lib/auth-client";

interface Product {
  id: string;
  name: string;
  imageUrl: string;
  description?: string;
}

interface Avatar {
  id: string;
  name: string;
  referenceImageUrl: string;
}

interface ReferenceImage {
  id: string;
  name: string;
  imageUrl: string;
}

type ProductAction = "hold" | "point" | "use" | "unbox" | "demo";
type Duration = 5 | 6 | 8;
type AspectRatio = "16:9" | "9:16" | "1:1";

interface ProductSceneConfig {
  id: string;
  action: ProductAction;
  script: string;
  duration: Duration;
  setting: string;
}

interface VideoOutput {
  sceneIndex: number;
  url: string;
}

const ACTION_OPTIONS: {
  value: ProductAction;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    value: "hold",
    label: "Hold",
    description: "Show product clearly to camera",
    icon: <Hand className="h-4 w-4" />,
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    value: "point",
    label: "Point",
    description: "Highlight product features",
    icon: <MousePointer className="h-4 w-4" />,
    color: "text-purple-500 bg-purple-500/10",
  },
  {
    value: "use",
    label: "Use",
    description: "Demonstrate product in action",
    icon: <Sparkles className="h-4 w-4" />,
    color: "text-green-500 bg-green-500/10",
  },
  {
    value: "unbox",
    label: "Unbox",
    description: "Reveal product from packaging",
    icon: <PackageOpen className="h-4 w-4" />,
    color: "text-yellow-500 bg-yellow-500/10",
  },
  {
    value: "demo",
    label: "Demo",
    description: "Full product demonstration",
    icon: <Monitor className="h-4 w-4" />,
    color: "text-red-500 bg-red-500/10",
  },
];

const DURATION_OPTIONS: { value: Duration; label: string }[] = [
  { value: 5, label: "5 sec" },
  { value: 6, label: "6 sec" },
  { value: 8, label: "8 sec" },
];

const ASPECT_RATIO_OPTIONS: { value: AspectRatio; label: string; icon: React.ReactNode }[] = [
  { value: "16:9", label: "16:9", icon: <div className="w-4 h-2.5 border-2 border-current rounded-sm" /> },
  { value: "9:16", label: "9:16", icon: <div className="w-2.5 h-4 border-2 border-current rounded-sm" /> },
  { value: "1:1", label: "1:1", icon: <div className="w-3.5 h-3.5 border-2 border-current rounded-sm" /> },
];

const VIDEO_GENERATOR_OPTIONS = [
  {
    id: 'veo' as const,
    name: 'Veo',
    description: "Google's Veo - Reliable and fast",
    cost: 100,
    recommended: true,
  },
  {
    id: 'kling-standard' as const,
    name: 'Kling Standard',
    description: 'Kling AI Standard - Good quality',
    cost: 150,
    recommended: false,
  },
  {
    id: 'kling-pro' as const,
    name: 'Kling Pro',
    description: 'Kling AI Pro - Premium quality',
    cost: 200,
    recommended: false,
  },
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export default function ModeCPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingAvatars, setLoadingAvatars] = useState(true);
  const [loadingReferenceImages, setLoadingReferenceImages] = useState(true);

  // Form state
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>("");
  const [selectedReferenceImageId, setSelectedReferenceImageId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");
  const [videoGenerator, setVideoGenerator] = useState<'veo' | 'kling-standard' | 'kling-pro'>('veo');
  const [scenes, setScenes] = useState<ProductSceneConfig[]>([
    { id: generateId(), action: "hold", script: "", duration: 5, setting: "" },
    { id: generateId(), action: "use", script: "", duration: 6, setting: "" },
    { id: generateId(), action: "demo", script: "", duration: 5, setting: "" },
  ]);

  // Upload dialog state
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Ensure dialog states are properly initialized and not stuck open
  useEffect(() => {
    // Reset dialog states on component mount to prevent stuck modals
    setUploadDialogOpen(false);
  }, []);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<string>("");
  const [outputs, setOutputs] = useState<VideoOutput[]>([]);
  const [concatScript, setConcatScript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      if (!session) return;

      try {
        const [productsRes, avatarsRes, refImagesRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/avatars"),
          fetch("/api/reference-images"),
        ]);

        if (productsRes.ok) {
          const data = await productsRes.json();
          setProducts(data.products || []);
        }
        if (avatarsRes.ok) {
          const data = await avatarsRes.json();
          setAvatars(data.avatars || []);
        }
        if (refImagesRes.ok) {
          const data = await refImagesRes.json();
          setReferenceImages(data.images || []);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoadingProducts(false);
        setLoadingAvatars(false);
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

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      if (!uploadName) {
        setUploadName(file.name.split(".")[0] || "");
      }
    }
  }, [uploadName]);

  const addScene = () => {
    if (scenes.length >= 5) return;
    setScenes([...scenes, { id: generateId(), action: "demo", script: "", duration: 6, setting: "" }]);
  };

  const removeScene = (id: string) => {
    if (scenes.length <= 1) return;
    setScenes(scenes.filter((s) => s.id !== id));
  };

  const moveScene = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= scenes.length) return;

    const newScenes = [...scenes];
    const sceneA = newScenes[index];
    const sceneB = newScenes[newIndex];
    if (sceneA && sceneB) {
      newScenes[index] = sceneB;
      newScenes[newIndex] = sceneA;
      setScenes(newScenes);
    }
  };

  const updateScene = (id: string, updates: Partial<ProductSceneConfig>) => {
    setScenes(scenes.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const handleGenerate = async () => {
    if (!selectedProductId) {
      setError("Please select a product");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setOutputs([]);
    setConcatScript(null);
    setGenerationProgress("Starting video generation...");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "MODE_C",
          productId: selectedProductId,
          avatarId: selectedAvatarId || undefined,
          referenceImageId: selectedReferenceImageId || undefined,
          title: title.trim() || undefined,
          aspectRatio,
          audioEnabled,
          videoGenerator,
          productScenes: scenes.map((s) => ({
            action: s.action,
            script: s.script.trim() || undefined,
            duration: s.duration,
            setting: s.setting.trim() || undefined,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Generation failed");
      }

      setOutputs(data.outputs || []);
      setConcatScript(data.concatScript || null);
      setGenerationProgress("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
      setGenerationProgress("");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setOutputs([]);
    setConcatScript(null);
    setError(null);
    setGenerationProgress("");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);

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
          Please sign in to generate product videos.
        </p>
        <Button asChild>
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
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
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500/10">
            <Package className="h-5 w-5 text-green-500" />
          </div>
          Product Video
        </h1>
        <p className="text-muted-foreground mt-2">
          Create product demo videos featuring your products with optional avatar presenter.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Asset Selection */}
        <div className="lg:col-span-3 space-y-6">
          {/* Product Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">1. Select Product</CardTitle>
              <CardDescription>Choose the product to feature</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingProducts ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8 border border-dashed rounded-lg">
                  <p className="text-muted-foreground mb-4">No products found.</p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/products">Add Product</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => setSelectedProductId(product.id)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedProductId === product.id
                          ? "border-green-500 ring-2 ring-green-500/20"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                        <p className="text-xs text-white truncate">{product.name}</p>
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
              <CardTitle className="text-lg">2. Ref Image (Optional)</CardTitle>
              <CardDescription>Use existing content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-3">
                <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Upload className="h-3 w-3 mr-1" />
                      Upload
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
                    className="h-8 px-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {loadingReferenceImages ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : referenceImages.length === 0 ? (
                <div className="text-center py-4 border border-dashed rounded-lg">
                  <ImagePlus className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">
                    No reference images
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {referenceImages.map((img) => (
                    <div key={img.id} className="relative group">
                      <button
                        onClick={() => setSelectedReferenceImageId(img.id)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all w-full ${
                          selectedReferenceImageId === img.id
                            ? "border-green-500 ring-2 ring-green-500/20"
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

          {/* Avatar Selection (Optional) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                3. Presenter (Optional)
              </CardTitle>
              <CardDescription>Add an avatar to present the product</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAvatars ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : avatars.length === 0 ? (
                <div className="text-center py-4 border border-dashed rounded-lg">
                  <p className="text-muted-foreground text-sm mb-3">No avatars yet.</p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/avatars">Add Avatar</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedAvatarId("")}
                    className={`w-full p-2 rounded-lg border text-left text-sm transition-all ${
                      !selectedAvatarId
                        ? "border-green-500 bg-green-500/5"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    No presenter (product only)
                  </button>
                  <div className="grid grid-cols-3 gap-2">
                    {avatars.slice(0, 6).map((avatar) => (
                      <button
                        key={avatar.id}
                        onClick={() => setSelectedAvatarId(avatar.id)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          selectedAvatarId === avatar.id
                            ? "border-green-500 ring-2 ring-green-500/20"
                            : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        <Image
                          src={avatar.referenceImageUrl}
                          alt={avatar.name}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Video Title (optional)</Label>
                <Input
                  id="title"
                  placeholder={selectedProduct ? `${selectedProduct.name} Demo` : "My Product Video"}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              {/* Video Generator Selection */}
              <div className="space-y-3">
                <Label>Video Generator</Label>
                <div className="grid grid-cols-1 gap-2">
                  {VIDEO_GENERATOR_OPTIONS.map((option) => (
                    <div
                      key={option.id}
                      className={`relative p-3 border rounded-lg cursor-pointer transition-all ${
                        videoGenerator === option.id
                          ? 'border-green-500 bg-green-500/5 ring-2 ring-green-500/20'
                          : 'border-border hover:border-green-500/50'
                      }`}
                      onClick={() => setVideoGenerator(option.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full border ${
                            videoGenerator === option.id
                              ? 'border-green-500 bg-green-500'
                              : 'border-border'
                          }`}>
                            {videoGenerator === option.id && (
                              <div className="w-full h-full rounded-full bg-green-500 transform scale-50" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-sm">{option.name}</span>
                              {option.recommended && (
                                <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                                  Recommended
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {option.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm">{option.cost}</div>
                          <div className="text-xs text-muted-foreground">credits</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Aspect Ratio</Label>
                <div className="flex gap-2">
                  {ASPECT_RATIO_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setAspectRatio(option.value)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all flex-1 ${
                        aspectRatio === option.value
                          ? "border-green-500 bg-green-500/10 text-green-600"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      {option.icon}
                      <span className="text-xs font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="audio">Generate with audio</Label>
                <button
                  id="audio"
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    audioEnabled ? "bg-green-500" : "bg-muted"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                      audioEnabled ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Scene Builder */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">4. Build Your Scenes</CardTitle>
                <CardDescription>
                  Add up to 5 scenes ({scenes.length}/5)
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={addScene}
                disabled={scenes.length >= 5}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {scenes.map((scene, index) => (
                <div
                  key={scene.id}
                  className="border border-border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        Scene {index + 1}
                      </span>
                      <Badge
                        variant="secondary"
                        className={ACTION_OPTIONS.find((a) => a.value === scene.action)?.color}
                      >
                        {ACTION_OPTIONS.find((a) => a.value === scene.action)?.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveScene(index, "up")}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveScene(index, "down")}
                        disabled={index === scenes.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeScene(scene.id)}
                        disabled={scenes.length <= 1}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Action Type */}
                  <div className="grid grid-cols-5 gap-1">
                    {ACTION_OPTIONS.map((action) => (
                      <button
                        key={action.value}
                        onClick={() => updateScene(scene.id, { action: action.value })}
                        className={`py-2 px-1 rounded text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                          scene.action === action.value
                            ? action.color + " border border-current"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                        title={action.description}
                      >
                        {action.icon}
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Duration:</Label>
                    <div className="flex gap-1">
                      {DURATION_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => updateScene(scene.id, { duration: opt.value })}
                          className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                            scene.duration === opt.value
                              ? "bg-green-500 text-white"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Script (Optional for product videos) */}
                  <div>
                    <Label className="text-xs">Script (optional)</Label>
                    <Textarea
                      placeholder={`What should be said during this ${scene.action} scene...`}
                      value={scene.script}
                      onChange={(e) => updateScene(scene.id, { script: e.target.value })}
                      rows={2}
                      className="text-sm mt-1"
                    />
                  </div>

                  {/* Setting (Optional) */}
                  <div>
                    <Label className="text-xs">Setting (optional)</Label>
                    <Input
                      placeholder="e.g., kitchen counter, studio backdrop..."
                      value={scene.setting}
                      onChange={(e) => updateScene(scene.id, { setting: e.target.value })}
                      className="text-sm mt-1"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedProductId}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Package className="h-4 w-4 mr-2" />
                Generate Video ({scenes.length} scene{scenes.length > 1 ? "s" : ""})
              </>
            )}
          </Button>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>

        {/* Right Column - Preview/Output */}
        <div className="lg:col-span-4">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Output</CardTitle>
              <CardDescription>
                {outputs.length > 0
                  ? `${outputs.length} scene${outputs.length > 1 ? "s" : ""} generated`
                  : "Your video clips will appear here"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="aspect-[9/16] bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      {generationProgress || "Processing scenes..."}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This may take several minutes
                    </p>
                  </div>
                </div>
              ) : outputs.length > 0 ? (
                <div className="space-y-4">
                  {outputs
                    .sort((a, b) => a.sceneIndex - b.sceneIndex)
                    .map((output) => (
                      <div
                        key={output.sceneIndex}
                        className="border border-border rounded-lg overflow-hidden"
                      >
                        <div className="aspect-[9/16] bg-black relative">
                          <video
                            src={output.url}
                            controls
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="p-3 flex items-center justify-between bg-muted/50">
                          <span className="text-sm font-medium">
                            Scene {output.sceneIndex}
                          </span>
                          <Button asChild variant="outline" size="sm">
                            <a href={output.url} download>
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}

                  {/* Concat Script */}
                  {concatScript && (
                    <div className="border border-border rounded-lg p-4 bg-muted/50">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">FFmpeg Concat Script</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        Use this script to combine all scenes into one video:
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(concatScript)}
                        className="w-full"
                      >
                        Copy Script
                      </Button>
                    </div>
                  )}

                  <Button variant="outline" onClick={handleReset} className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Create New Video
                  </Button>
                </div>
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center p-8">
                    <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Select a product, build your scenes, and generate
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
