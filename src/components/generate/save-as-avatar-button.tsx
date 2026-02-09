use client
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, Loader2, User } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface SaveAsAvatarButtonProps {
  outputId: string;
  imageUrl: string;
  onSave?: () => void;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function SaveAsAvatarButton({
  outputId,
  imageUrl,
  onSave,
  className,
  variant = 'outline',
  size = 'default',
}: SaveAsAvatarButtonProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSaveAsAvatar = async () => {
    if (!session?.user?.id) {
      toast.error('You must be logged in to save avatars');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/outputs/${outputId}/save-as-avatar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save as avatar');
      }

      const data = await response.json();
      setIsSaved(true);
      toast.success('Avatar saved successfully!');
      onSave?.();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to save as avatar:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save as avatar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          disabled={isSaved}
        >
          {isSaved ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Saved as Avatar
            </>
          ) : (
            <>
              <Avatar className="mr-2 h-4 w-4">
                <AvatarImage src={imageUrl} alt="Preview" />
                <AvatarFallback>
                  <User className="h-3 w-3" />
                </AvatarFallback>
              </Avatar>
              Save as Avatar
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save as Avatar</DialogTitle>
          <DialogDescription>
            This image will be saved to your avatar collection and can be used as a reference image for future generations.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-4 py-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={imageUrl} alt="Preview" />
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              This will be added to your avatar collection
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveAsAvatar}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Avatar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}