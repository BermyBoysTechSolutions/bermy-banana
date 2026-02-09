'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { usePersistence } from '@/hooks/use-persistence';
import {
  Modal,
  ModalAction,
  ModalCancel,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from '@/components/ui/modal-complete';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  HardDrive, 
  Download, 
  Trash2, 
  ExternalLink, 
  MoreVertical,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface PersistenceManagerProps {
  outputId: string;
  title?: string;
  thumbnailUrl?: string;
  type: 'VIDEO' | 'IMAGE';
  url: string;
  className?: string;
  showActions?: boolean;
  variant?: 'compact' | 'full';
}

export function PersistenceManager({
  outputId,
  title,
  thumbnailUrl,
  type,
  url,
  className,
  showActions = true,
  variant = 'full',
}: PersistenceManagerProps) {
  const { 
    persistentOutputs, 
    isOutputPersistent, 
    persistOutput, 
    removeOutput, 
    loading 
  } = usePersistence();
  
  const [isLoading, setIsLoading] = useState(false);
  const [localIsPersistent, setLocalIsPersistent] = useState(false);

  const isPersistent = isOutputPersistent(outputId);
  const persistenceData = persistentOutputs.find(output => output.id === outputId);

  useEffect(() => {
    setLocalIsPersistent(isPersistent);
  }, [isPersistent]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await persistOutput(outputId);
      setLocalIsPersistent(true);
    } catch (error) {
      console.error('Failed to save output:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    setIsLoading(true);
    try {
      await removeOutput(outputId);
      setLocalIsPersistent(false);
    } catch (error) {
      console.error('Failed to remove output:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${title || 'output'}.${type === 'VIDEO' ? 'mp4' : 'jpg'}`;
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

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {localIsPersistent ? (
          <>
            <div className="flex items-center gap-1 text-green-600 dark:text-green-500">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs font-medium">Saved</span>
            </div>
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => window.open(url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full Size
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleRemove}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={isLoading || loading}
            className="h-6 px-2 text-xs"
          >
            {isLoading ? (
              <Clock className="h-3 w-3 animate-spin" />
            ) : (
              'Save'
            )}
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">{title || 'Untitled Output'}</CardTitle>
            <CardDescription>
              {type} • {formatDistanceToNow(new Date(), { addSuffix: true })}
            </CardDescription>
          </div>
          <Badge variant={localIsPersistent ? "default" : "secondary"}>
            {localIsPersistent ? "Saved" : "Not Saved"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Preview */}
        <div className="aspect-video bg-muted rounded-lg overflow-hidden">
          {type === 'VIDEO' ? (
            <video
              src={url}
              poster={thumbnailUrl}
              className="w-full h-full object-cover"
              muted
              controls
            />
          ) : (
            <img
              src={thumbnailUrl || url}
              alt={title || 'Output'}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Persistence Status */}
        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div className="flex items-center gap-2">
            {localIsPersistent ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Saved to Gallery</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Not saved to gallery
                </span>
              </>
            )}
          </div>
          
          {showActions && (
            <div className="flex items-center gap-2">
              {localIsPersistent ? (
                <Modal>
                  <ModalTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </ModalTrigger>
                  <ModalContent>
                    <ModalHeader>
                      <ModalTitle>Remove from Gallery?</ModalTitle>
                      <ModalDescription>
                        This will remove the output from your persistent gallery. 
                        You won't be able to access it after removal.
                      </ModalDescription>
                    </ModalHeader>
                    <ModalFooter>
                      <ModalCancel>Cancel</ModalCancel>
                      <ModalAction
                        onClick={handleRemove}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Remove
                      </ModalAction>
                    </ModalFooter>
                  </ModalContent>
                </Modal>
              ) : (
                <Button 
                  onClick={handleSave} 
                  disabled={isLoading || loading}
                  size="sm"
                >
                  <HardDrive className="h-4 w-4 mr-1" />
                  Save to Gallery
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(url, '_blank')}
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              View Full Size
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}