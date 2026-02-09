use client
import { useState, useCallback, useEffect } from 'react';
import { usePersistence } from './use-persistence';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';

interface UseGenerationPersistenceProps {
  outputId?: string;
  jobId?: string;
  jobMode?: 'MODE_A' | 'MODE_B' | 'MODE_C';
  jobTitle?: string;
  outputType?: 'VIDEO' | 'IMAGE';
  outputUrl?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
}

interface UseGenerationPersistenceReturn {
  isPersistent: boolean;
  isLoading: boolean;
  persistOutput: () => Promise<void>;
  removeOutput: () => Promise<void>;
  persistUntil?: Date;
  error: string | null;
}

export function useGenerationPersistence({
  outputId,
  jobId,
  jobMode,
  jobTitle,
  outputType,
  outputUrl,
  thumbnailUrl,
  durationSeconds,
}: UseGenerationPersistenceProps): UseGenerationPersistenceReturn {
  const { persistOutput, removeOutput, isOutputPersistent } = usePersistence();
  const { userId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [persistUntil, setPersistUntil] = useState<Date | undefined>();

  const isPersistent = outputId ? isOutputPersistent(outputId) : false;

  const handlePersist = useCallback(async () => {
    if (!outputId || !userId) {
      toast.error('Unable to save output');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Calculate persistence date (default 30 days for now)
      const persistDate = new Date();
      persistDate.setDate(persistDate.getDate() + 30);
      
      const success = await persistOutput(outputId, persistDate);
      if (success) {
        setPersistUntil(persistDate);
      }
    } catch (error) {
      console.error('Failed to persist output:', error);
      setError(error instanceof Error ? error.message : 'Failed to save output');
    } finally {
      setIsLoading(false);
    }
  }, [outputId, userId, persistOutput]);

  const handleRemove = useCallback(async () => {
    if (!outputId) {
      toast.error('Unable to remove output');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await removeOutput(outputId);
      setPersistUntil(undefined);
    } catch (error) {
      console.error('Failed to remove output:', error);
      setError(error instanceof Error ? error.message : 'Failed to remove output');
    } finally {
      setIsLoading(false);
    }
  }, [outputId, removeOutput]);

  // Check if output is already persistent on mount
  useEffect(() => {
    if (outputId && isPersistent) {
      // You might want to fetch the persistUntil date from the API
      // For now, we'll just set it to 30 days from now as a placeholder
      const persistDate = new Date();
      persistDate.setDate(persistDate.getDate() + 30);
      setPersistUntil(persistDate);
    }
  }, [outputId, isPersistent]);

  return {
    isPersistent,
    isLoading,
    persistOutput: handlePersist,
    removeOutput: handleRemove,
    persistUntil,
    error,
  };
}