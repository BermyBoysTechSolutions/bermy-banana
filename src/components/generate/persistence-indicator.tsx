use client
import { Lock, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
import { cn } from '@/lib/utils';

interface PersistenceIndicatorProps {
  isPersistent: boolean;
  persistUntil?: Date;
  onRemove?: () => void;
  isLoading?: boolean;
  className?: string;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PersistenceIndicator({
  isPersistent,
  persistUntil,
  onRemove,
  isLoading = false,
  className,
  showTooltip = true,
  size = 'md',
}: PersistenceIndicatorProps) {
  if (!isPersistent) return null;

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getRemainingDays = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const remainingDays = persistUntil ? getRemainingDays(persistUntil) : null;

  return (
    <TooltipProvider>
      <div className={cn('flex items-center gap-2', className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-500">
              <Lock className={cn('fill-current', sizeClasses[size])} />
              {remainingDays !== null && remainingDays <= 7 && (
                <Clock className={cn('text-orange-500', sizeClasses[size])} />
              )}
            </div>
          </TooltipTrigger>
          {showTooltip && (
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-medium">Persisted Output</p>
                {persistUntil && (
                  <p className="text-xs text-muted-foreground">
                    Expires on {formatDate(persistUntil)}
                    {remainingDays !== null && (
                      <>
                        <br />
                        {remainingDays > 0 ? (
                          <span className={remainingDays <= 7 ? 'text-orange-500' : ''}>
                            {remainingDays} day{remainingDays !== 1 ? 's' : ''} remaining
                          </span>
                        ) : (
                          <span className="text-red-500">Expired</span>
                        )}
                      </>
                    )}
                  </p>
                )}
              </div>
            </TooltipContent>
          )}
        </Tooltip>

        {onRemove && (
          <Modal>
            <ModalTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4" />
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
                  onClick={onRemove}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Remove
                </ModalAction>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
      </div>
    </TooltipProvider>
  );
}