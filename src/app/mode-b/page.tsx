"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ImageIcon, Loader2, Download, RefreshCw } from "lucide-react";
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
import { useSession } from "@/lib/auth-client";

interface Avatar {
  id: string;
  name: string;
  referenceImageUrl: string;
}

type Style = "casual" | "professional" | "lifestyle" | "selfie";

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

export default function ModeBPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loadingAvatars, setLoadingAvatars] = useState(true);

  // Form state
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<Style>("casual");
  const [title, setTitle] = useState("");

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // Fetch avatars on mount
  useEffect(() => {
    async function fetchAvatars() {
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
    }

    if (session) {
      fetchAvatars();
    }
  }, [session]);

  const handleGenerate = async () => {
    if (!selectedAvatarId || !prompt.trim()) {
      setError("Please select an avatar and enter a prompt");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImageUrl(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "MODE_B",
          avatarId: selectedAvatarId,
          prompt: prompt.trim(),
          style,
          title: title.trim() || undefined,
          aspectRatio: "9:16",
        }),
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
              <CardTitle className="text-lg">1. Select Avatar</CardTitle>
              <CardDescription>
                Choose the avatar for your photo
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
                      onClick={() => setSelectedAvatarId(avatar.id)}
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

          {/* Style Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">2. Choose Style</CardTitle>
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

          {/* Prompt */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">3. Describe the Scene</CardTitle>
              <CardDescription>
                What should the avatar be doing? Where are they?
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
            disabled={isGenerating || !selectedAvatarId || !prompt.trim()}
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
}
