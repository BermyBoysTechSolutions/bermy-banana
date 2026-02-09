import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Trash2, Loader2, Check } from 'lucide-react';
import { useGenerationPersistence } from '@/hooks/use-generation-persistence';
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
} from '@/components/ui/modal-simple';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface PersistenceActionsProps {
  outputId: string;
  jobId?: string;
  jobMode?: 'MODE_A' | 'MODE_B' | 'MODE_C';
  jobTitle?: string;
  outputType?: 'VIDEO' | 'IMAGE';
  outputUrl?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  showText?: boolean;
  onSave?: () => void;
  onRemove?: () => void;
}

export function PersistenceActions({
  outputId,
  jobId,
  jobMode,
  jobTitle,
  outputType,
  outputUrl,
  thumbnailUrl,
  durationSeconds,
  className,
  variant = 'outline',
  size = 'default',
  showText = true,
  onSave,
  onRemove,
}: PersistenceActionsProps) {
  const {
    isPersistent,
    isLoading,
    persistOutput,
    removeOutput,
    persistUntil,
    error,
  } = useGenerationPersistence({
    outputId,
    jobId,
    jobMode,
    jobTitle,
    outputType,
    outputUrl,
    thumbnailUrl,
    durationSeconds,
  });

  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  const handlePersist = async () => {
    await persistOutput();
    onSave?.();
  };

  const handleRemove = async () => {
    await removeOutput();
    onRemove?.();
    setIsRemoveDialogOpen(false);
  };

  if (isPersistent) {
    return (
      <TooltipProvider>
        <div className={cn('flex items-center gap-2', className)}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-500">
                <Check className="h-4 w-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">Saved to your gallery</p>
              {persistUntil && (
                <p className="text-xs text-muted-foreground">
                  Expires {persistUntil.toLocaleDateString()}
                </p>
              )}
            </TooltipContent>
          </Tooltip>

          <Modal open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
            <ModalTrigger asChild>
              <Button
                variant="ghost"
                size={size}
                className="text-destructive hover:text-destructive"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className={cn('h-4 w-4', showText && 'mr-2')} />
                    {showText && 'Remove'}
                  </>
                )}
              </Button>
            </ModalTrigger>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>Remove from Gallery?</ModalTitle>
                <ModalDescription>
                  This will remove the output from your persistent gallery. You won't be able to access it after removal.
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
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={handlePersist}
            disabled={isLoading}
            className={className}
          >
            {isLoading ? (
              <Loader2 className={cn('h-4 w-4', showText && 'mr-2')} />
            ) : (
              <Save className={cn('h-4 w-4', showText && 'mr-2')} />
            )}
            {showText && (isLoading ? 'Saving...' : 'Save')}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">Save to your gallery</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}