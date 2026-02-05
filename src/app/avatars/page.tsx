"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Plus, Trash2, Loader2, User, Upload, Pencil } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSession } from "@/lib/auth-client";

interface Avatar {
  id: string;
  name: string;
  description?: string | null;
  referenceImageUrl: string;
  metadata?: {
    gender?: string;
    ageRange?: string;
    ethnicity?: string;
    style?: string;
  };
  createdAt: string;
}

export const dynamic = "force-dynamic";

export default function AvatarsPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [isSavingDescription, setIsSavingDescription] = useState(false);

  // Fetch avatars
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
        setLoading(false);
      }
    }

    if (session) {
      fetchAvatars();
    }
  }, [session]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleCreate = async () => {
    if (!name.trim() || !selectedFile) {
      setError("Please enter a name and select an image");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      if (description.trim()) {
        formData.append("description", description.trim());
      }
      formData.append("image", selectedFile);

      const res = await fetch("/api/avatars", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to create avatar");
      }

      // Add the new avatar to the list
      setAvatars((prev) => [data.avatar, ...prev]);

      // Reset form
      setName("");
      setDescription("");
      setSelectedFile(null);
      setPreviewUrl(null);
      setDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create avatar");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (avatarId: string) => {
    if (!confirm("Are you sure you want to delete this avatar?")) return;

    try {
      const res = await fetch(`/api/avatars/${avatarId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setAvatars((prev) => prev.filter((a) => a.id !== avatarId));
      }
    } catch (err) {
      console.error("Failed to delete avatar:", err);
    }
  };

  const handleSaveDescription = async (avatarId: string) => {
    setIsSavingDescription(true);
    try {
      const res = await fetch(`/api/avatars/${avatarId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: editDescription }),
      });

      if (res.ok) {
        const data = await res.json();
        setAvatars((prev) =>
          prev.map((a) => (a.id === avatarId ? { ...a, description: data.avatar.description } : a))
        );
        setEditingId(null);
      }
    } catch (err) {
      console.error("Failed to update avatar:", err);
    } finally {
      setIsSavingDescription(false);
    }
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
          Please sign in to manage your avatars.
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

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/10">
              <User className="h-5 w-5 text-purple-500" />
            </div>
            Avatars
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your AI personas for content generation
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Avatar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Avatar</DialogTitle>
              <DialogDescription>
                Upload a reference image to create a new AI avatar.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Sofia, Alex, etc."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the avatar's appearance in detail, e.g., 'Young woman in her mid-20s with long brown hair, tan skin, bright smile, wearing a white t-shirt'"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1 text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This description is used to generate consistent-looking videos of your avatar.
                </p>
              </div>

              <div>
                <Label>Reference Image</Label>
                <div className="mt-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  {previewUrl ? (
                    <div className="relative aspect-square w-48 rounded-lg overflow-hidden border">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                        className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-muted-foreground transition-colors"
                    >
                      <Upload className="h-8 w-8 mb-2" />
                      <span className="text-sm">Click to upload</span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  For best results, use a clear, front-facing photo with good
                  lighting.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={isCreating || !name.trim() || !selectedFile}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Avatar"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : avatars.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No avatars yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first avatar to start generating content.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Avatar
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {avatars.map((av) => (
            <Card key={av.id} className="overflow-hidden group">
              <div className="relative aspect-square">
                <Image
                  src={av.referenceImageUrl}
                  alt={av.name}
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader className="p-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-sm pt-1">{av.name}</CardTitle>
                  <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingId(av.id);
                        setEditDescription(av.description || "");
                      }}
                      className="p-2 bg-primary text-primary-foreground rounded-md mr-2 hover:bg-primary/90"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(av.id)}
                      className="p-2 bg-destructive text-white rounded-md hover:bg-destructive/90"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {editingId === av.id ? (
                  <div className="space-y-2 mt-1">
                    <Textarea
                      placeholder="Describe the avatar's appearance..."
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={3}
                      className="text-xs"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveDescription(av.id)}
                        disabled={isSavingDescription}
                        className="h-7 text-xs"
                      >
                        {isSavingDescription ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "Save"
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                        className="h-7 text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <CardDescription className="text-xs">
                    {av.description ? (
                      <span className="line-clamp-2">{av.description}</span>
                    ) : (
                      <span className="text-muted-foreground/60 italic">
                        No description — click edit to add one
                      </span>
                    )}
                  </CardDescription>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
// Trigger deploy
// Test deploy Wed Feb  4 10:02:37 AM EST 2026
// Auto-deploy test 1770217665
