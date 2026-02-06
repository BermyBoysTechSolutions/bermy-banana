"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Video,
  Loader2,
  Download,
  RefreshCw,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Play,
  FileText,
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

type SceneType = "hook" | "demo" | "cta" | "custom";
type Duration = 5 | 6 | 8;
type AspectRatio = "16:9" | "9:16" | "1:1";

interface SceneConfig {
  id: string;
  type: SceneType;
  script: string;
  action: string;
  setting: string;
  duration: Duration;
}

interface VideoOutput {
  sceneIndex: number;
  url: string;
}

const SCENE_TYPES: { value: SceneType; label: string; description: string; color: string }[] = [
  {
    value: "hook",
    label: "Hook",
    description: "Attention-grabbing opener",
    color: "text-yellow-500 bg-yellow-500/10",
  },
  {
    value: "demo",
    label: "Demo",
    description: "Show the product/benefit",
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    value: "cta",
    label: "CTA",
    description: "Call to action",
    color: "text-green-500 bg-green-500/10",
  },
  {
    value: "custom",
    label: "Custom",
    description: "Free-form content",
    color: "text-purple-500 bg-purple-500/10",
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

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export default function ModeAPage() {
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
  const [title, setTitle] = useState("");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");
  const [scenes, setScenes] = useState<SceneConfig[]>([
    { id: generateId(), type: "hook", script: "", action: "talking to camera energetically", setting: "", duration: 5 },
    { id: generateId(), type: "demo", script: "", action: "holding and showing the product", setting: "", duration: 6 },
    { id: generateId(), type: "cta", script: "", action: "talking to camera with a smile", setting: "", duration: 5 },
  ]);

  // Upload dialog state
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Script Assistant state
  const [generatingScript, setGeneratingScript] = useState<string | null>(null);
  const [scriptSuggestions, setScriptSuggestions] = useState<string[]>([]);
  const [scriptModalSceneId, setScriptModalSceneId] = useState<string | null>(null);

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
        const [avatarsRes, productsRes, refImagesRes] = await Promise.all([
          fetch("/api/avatars"),
          fetch("/api/products"),
          fetch("/api/reference-images"),
        ]);

        if (avatarsRes.ok) {
          const data = await avatarsRes.json();
          setAvatars(data.avatars || []);
        }
        if (productsRes.ok) {
          const data = await productsRes.json();
          setProducts(data.products || []);
        }
        if (refImagesRes.ok) {
          const data = await refImagesRes.json();
          setReferenceImages(data.images || []);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoadingAvatars(false);
        setLoadingProducts(false);
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
    setScenes([...scenes, { id: generateId(), type: "custom", script: "", action: "", setting: "", duration: 6 }]);
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

  const updateScene = (id: string, updates: Partial<SceneConfig>) => {
    setScenes(scenes.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const generateScriptSuggestions = useCallback(async (sceneId: string, sceneType: SceneType) => {
    setGeneratingScript(sceneId);
    setScriptSuggestions([]);
    setScriptModalSceneId(sceneId);

    try {
      const scene = scenes.find((s) => s.id === sceneId);
      const selectedProduct = products.find((p) => p.id === selectedProductId);

      const res = await fetch("/api/ai/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: sceneType,
          productName: selectedProduct?.name,
          duration: scene?.duration || 6,
          existingHook: sceneType !== "hook" ? scenes.find((s) => s.type === "hook")?.script : undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setScriptSuggestions(data.scripts || []);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to generate scripts");
      }
    } catch (err) {
      console.error("Failed to generate scripts:", err);
      setError("Failed to generate script suggestions");
    } finally {
      setGeneratingScript(null);
    }
  }, [scenes, products, selectedProductId]);

  const selectSuggestion = (suggestion: string) => {
    if (scriptModalSceneId) {
      updateScene(scriptModalSceneId, { script: suggestion });
      setScriptModalSceneId(null);
      setScriptSuggestions([]);
    }
  };

  const handleGenerate = async () => {
    if (!selectedAvatarId) {
      setError("Please select an avatar");
      return;
    }

    const emptyScenes = scenes.filter((s) => !s.script.trim());
    if (emptyScenes.length > 0) {
      setError("Please fill in scripts for all scenes");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setOutputs([]);
    setConcatScript(null);
    setGenerationProgress("Starting video generation...");

    try {
      const body: Record<string, unknown> = {
        mode: "MODE_A",
        avatarId: selectedAvatarId,
        productId: selectedProductId || undefined,
        referenceImageId: selectedReferenceImageId || undefined,
        title: title.trim() || undefined,
        audioEnabled,
        aspectRatio,
        scenes: scenes.map((s) => ({
          type: s.type,
          script: s.script.trim(),
          action: s.action.trim() || undefined,
          setting: s.setting.trim() || undefined,
          duration: s.duration,
        })),
      };

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
          Please sign in to generate UGC videos.
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
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10">
            <Video className="h-5 w-5 text-blue-500" />
          </div>
          UGC Video
        </h1>
        <p className="text-muted-foreground mt-2">
          Create multi-scene talking head videos with your AI avatar for social media ads.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Asset Selection */}
        <div className="lg:col-span-3 space-y-6">
          {/* Avatar Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">1. Select Avatar</CardTitle>
              <CardDescription>Choose your AI persona</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAvatars ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : avatars.length === 0 ? (
                <div className="text-center py-8 border border-dashed rounded-lg">
                  <p className="text-muted-foreground mb-4">No avatars found.</p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/avatars">Create Avatar</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {avatars.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => setSelectedAvatarId(avatar.id)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedAvatarId === avatar.id
                          ? "border-blue-500 ring-2 ring-blue-500/20"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <Image
                        src={avatar.referenceImageUrl}
                        alt={avatar.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                        <p className="text-xs text-white truncate">{avatar.name}</p>
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
                            ? "border-blue-500 ring-2 ring-blue-500/20"
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

          {/* Product Selection (Optional) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">3. Product (Optional)</CardTitle>
              <CardDescription>Feature a product</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingProducts ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-6 border border-dashed rounded-lg">
                  <p className="text-muted-foreground text-sm mb-3">No products yet.</p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/products">Add Product</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedProductId("")}
                    className={`w-full p-2 rounded-lg border text-left text-sm transition-all ${
                      !selectedProductId
                        ? "border-blue-500 bg-blue-500/5"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    No product
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    {products.slice(0, 4).map((product) => (
                      <button
                        key={product.id}
                        onClick={() => setSelectedProductId(product.id)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          selectedProductId === product.id
                            ? "border-blue-500 ring-2 ring-blue-500/20"
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
                  placeholder="My UGC Video"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1"
                />
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
                          ? "border-blue-500 bg-blue-500/10 text-blue-600"
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
                    audioEnabled ? "bg-blue-500" : "bg-muted"
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
                        className={SCENE_TYPES.find((t) => t.value === scene.type)?.color}
                      >
                        {SCENE_TYPES.find((t) => t.value === scene.type)?.label}
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

                  {/* Scene Type */}
                  <div className="grid grid-cols-4 gap-1">
                    {SCENE_TYPES.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => updateScene(scene.id, { type: type.value })}
                        className={`py-1.5 px-2 rounded text-xs font-medium transition-all ${
                          scene.type === type.value
                            ? type.color + " border border-current"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {type.label}
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
                              ? "bg-blue-500 text-white"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action */}
                  <div>
                    <Label className="text-xs">Action (what the avatar does)</Label>
                    <Input
                      placeholder="e.g., talking to camera, holding product, pointing at screen"
                      value={scene.action}
                      onChange={(e) => updateScene(scene.id, { action: e.target.value })}
                      className="mt-1 text-sm"
                    />
                  </div>

                  {/* Setting */}
                  <div>
                    <Label className="text-xs">Setting (where)</Label>
                    <Input
                      placeholder="e.g., modern kitchen, outdoor patio, cozy living room"
                      value={scene.setting}
                      onChange={(e) => updateScene(scene.id, { setting: e.target.value })}
                      className="mt-1 text-sm"
                    />
                  </div>

                  {/* Script */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-xs">Script (what they say)</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => generateScriptSuggestions(scene.id, scene.type)}
                        disabled={generatingScript === scene.id}
                        className="h-7 text-xs"
                      >
                        {generatingScript === scene.id ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3 mr-1" />
                        )}
                        Generate
                      </Button>
                    </div>
                    <Textarea
                      placeholder={`Enter ${scene.type} script...`}
                      value={scene.script}
                      onChange={(e) => updateScene(scene.id, { script: e.target.value })}
                      rows={3}
                      className="text-sm"
                    />
                  </div>

                  {/* Script Suggestions Modal */}
                  {scriptModalSceneId === scene.id && scriptSuggestions.length > 0 && (
                    <div className="border border-border rounded-lg p-3 bg-muted/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">AI Suggestions</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setScriptModalSceneId(null)}
                          className="h-6 w-6 p-0"
                        >
                          &times;
                        </Button>
                      </div>
                      {scriptSuggestions.map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => selectSuggestion(suggestion)}
                          className="w-full text-left p-2 bg-background rounded border border-border hover:border-blue-500 transition-colors"
                        >
                          <p className="text-xs text-muted-foreground mb-1">
                            Option {i + 1}
                          </p>
                          <p className="text-sm">{suggestion}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedAvatarId || scenes.some((s) => !s.script.trim())}
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
                <Video className="h-4 w-4 mr-2" />
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
                      Select an avatar, build your scenes, and generate
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
