'use client';

import { useState, useEffect } from 'react';
import { usePersistence } from '@/hooks/use-persistence';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Download, Trash2, ExternalLink, Image, Video, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { SaveAsAvatarButton } from './save-as-avatar-button';
import { PersistenceIndicator } from './persistence-indicator';
import { toast } from 'sonner';

interface RecentOutputsDashboardProps {
  limit?: number;
  showHeader?: boolean;
  className?: string;
}

export function RecentOutputsDashboard({
  limit = 12,
  showHeader = true,
  className,
}: RecentOutputsDashboardProps) {
  const { persistentOutputs, loading, error, removeOutput, refreshOutputs } = usePersistence();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('Download started');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed');
    }
  };

  const handleRemove = async (outputId: string) => {
    const success = await removeOutput(outputId);
    if (success) {
      refreshOutputs();
    }
  };

  if (!mounted) {
    return (
      <div className={className}>
        {showHeader && (
          <div className="mb-6">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-video" />
              <CardHeader>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        {showHeader && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Your Gallery</h2>
            <p className="text-muted-foreground">
              Failed to load your persistent outputs
            </p>
          </div>
        )}
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">Failed to load outputs</p>
            <Button onClick={refreshOutputs} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const outputs = persistentOutputs.slice(0, limit);

  if (outputs.length === 0 && !loading) {
    return (
      <div className={className}>
        {showHeader && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Your Gallery</h2>
            <p className="text-muted-foreground">
              Your saved outputs will appear here
            </p>
          </div>
        )}
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Video className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-2">No saved outputs yet</p>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Save your generated outputs to keep them permanently in your gallery
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      {showHeader && (
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Your Gallery</h2>
            <p className="text-muted-foreground">
              {outputs.length} saved output{outputs.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshOutputs}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {outputs.map((output) => (
          <Card key={output.id} className="overflow-hidden group relative">
            <div className="aspect-video bg-muted relative overflow-hidden">
              {output.type === 'VIDEO' ? (
                <video
                  src={output.url}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : (
                <img
                  src={output.thumbnailUrl || output.url}
                  alt="Output"
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.open(output.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleDownload(output.url, `${output.id}.${output.type === 'VIDEO' ? 'mp4' : 'jpg'}`)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    {output.type === 'IMAGE' && (
                      <DropdownMenuItem asChild>
                        <SaveAsAvatarButton
                          outputId={output.id}
                          imageUrl={output.url}
                          variant="ghost"
                          size="sm"
                        />
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleRemove(output.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Type badge */}
              <Badge
                variant="secondary"
                className="absolute top-2 left-2"
              >
                {output.type === 'VIDEO' ? (
                  <Video className="h-3 w-3 mr-1" />
                ) : (
                  <Image className="h-3 w-3 mr-1" />
                )}
                {output.type}
              </Badge>

              {/* Persistence indicator */}
              <div className="absolute top-2 right-2">
                <PersistenceIndicator
                  isPersistent={true}
                  persistUntil={output.persistUntil}
                  size="sm"
                  showTooltip={true}
                />
              </div>
            </div>

            <CardHeader className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {output.jobTitle && (
                    <CardTitle className="text-sm font-medium truncate">
                      {output.jobTitle}
                    </CardTitle>
                  )}
                  <CardDescription className="text-xs">
                    {output.createdAt && (
                      <time dateTime={output.createdAt.toISOString()}>
                        {formatDistanceToNow(output.createdAt, { addSuffix: true })}
                      </time>
                    )}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  {output.jobMode}
                </Badge>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {loading && (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading more...
          </Button>
        </div>
      )}
    </div>
  );
}