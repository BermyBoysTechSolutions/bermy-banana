use client
import { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { PersistentOutput, GetPersistentOutputsResponse } from '@/lib/types/persistence';
import { useSession } from '@/lib/auth-client';
import { toast } from 'sonner';

interface PersistenceContextType {
  persistentOutputs: PersistentOutput[];
  loading: boolean;
  error: string | null;
  refreshOutputs: () => Promise<void>;
  persistOutput: (outputId: string, persistUntil?: Date) => Promise<boolean>;
  removeOutput: (outputId: string) => Promise<boolean>;
  isOutputPersistent: (outputId: string) => boolean;
}

const PersistenceContext = createContext<PersistenceContextType | undefined>(undefined);

export function PersistenceProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [persistentOutputs, setPersistentOutputs] = useState<PersistentOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const loadFromLocalStorage = () => {
      try {
        const stored = localStorage.getItem(`persistent-outputs-${session?.user?.id}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          setPersistentOutputs(parsed);
        }
      } catch (error) {
        console.error('Failed to load from localStorage:', error);
      }
    };

    if (session?.user?.id) {
      loadFromLocalStorage();
      refreshOutputs(); // Sync with API
    }
  }, [session?.user?.id]);

  // Save to localStorage whenever outputs change
  useEffect(() => {
    if (session?.user?.id && persistentOutputs.length > 0) {
      try {
        localStorage.setItem(`persistent-outputs-${session.user.id}`, JSON.stringify(persistentOutputs));
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
    }
  }, [persistentOutputs, session?.user?.id]);

  const refreshOutputs = useCallback(async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/outputs/persistent');
      if (!response.ok) throw new Error('Failed to fetch persistent outputs');
      
      const data: GetPersistentOutputsResponse = await response.json();
      setPersistentOutputs(data.outputs);
    } catch (error) {
      console.error('Failed to refresh outputs:', error);
      setError(error instanceof Error ? error.message : 'Failed to refresh outputs');
      toast.error('Failed to refresh persistent outputs');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  const persistOutput = useCallback(async (outputId: string, persistUntil?: Date) => {
    try {
      const response = await fetch('/api/outputs/persist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outputId,
          persistUntil: persistUntil?.toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to persist output');

      const data = await response.json();
      
      // Add to local state
      const newOutput: PersistentOutput = {
        id: data.output.id,
        type: data.output.type,
        url: data.output.url,
        thumbnailUrl: data.output.thumbnailUrl,
        durationSeconds: data.output.durationSeconds,
        metadata: data.output.metadata,
        persistUntil: data.output.persistUntil ? new Date(data.output.persistUntil) : undefined,
        createdAt: new Date(data.output.createdAt),
        jobId: data.output.jobId,
        jobMode: 'MODE_A', // Will be updated with actual data
        jobTitle: data.output.jobTitle,
      };

      setPersistentOutputs(prev => [...prev, newOutput]);
      toast.success('Output saved to your persistent gallery');
      return true;
    } catch (error) {
      console.error('Failed to persist output:', error);
      toast.error('Failed to save output');
      return false;
    }
  }, []);

  const removeOutput = useCallback(async (outputId: string) => {
    try {
      const response = await fetch(`/api/outputs/${outputId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove output');

      // Remove from local state
      setPersistentOutputs(prev => prev.filter(output => output.id !== outputId));
      toast.success('Output removed from your gallery');
      return true;
    } catch (error) {
      console.error('Failed to remove output:', error);
      toast.error('Failed to remove output');
      return false;
    }
  }, []);

  const isOutputPersistent = useCallback((outputId: string) => {
    return persistentOutputs.some(output => output.id === outputId);
  }, [persistentOutputs]);

  return (
    <PersistenceContext.Provider
      value={{
        persistentOutputs,
        loading,
        error,
        refreshOutputs,
        persistOutput,
        removeOutput,
        isOutputPersistent,
      }}
    >
      {children}
    </PersistenceContext.Provider>
  );
}

export function usePersistence() {
  const context = useContext(PersistenceContext);
  if (context === undefined) {
    throw new Error('usePersistence must be used within a PersistenceProvider');
  }
  return context;
}