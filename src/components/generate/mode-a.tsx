'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { useTierFeatures } from '@/hooks/use-tier-features';

/**
 * Mode A: Talking Head Video (UGC)
 * Supports Veo, Kling Standard, and Kling Pro video generators
 */

interface ModeAProps {
  onGenerate: (data: {
    script: string;
    videoGenerator: 'veo' | 'kling-standard' | 'kling-pro';
  }) => void;
  isGenerating?: boolean;
}

export default function ModeA({ onGenerate, isGenerating = false }: ModeAProps) {
  const [script, setScript] = useState('');
  const [selectedGenerator, setSelectedGenerator] = useState<'veo' | 'kling-standard' | 'kling-pro'>('veo');
  const router = useRouter();
  const { hasAccess, loading: tierLoading } = useTierFeatures();

  // Video generator options
  const generatorOptions = [
    {
      id: 'veo' as const,
      name: 'Veo',
      description: "Google's Veo - Reliable and fast video generation",
      cost: 100,
      feature: 'veo' as const,
      recommended: false,
    },
    {
      id: 'kling-standard' as const,
      name: 'Kling Standard',
      description: 'Kling AI Standard - Good quality, 5-10 second videos',
      cost: 150,
      feature: 'klingStandard' as const,
      recommended: false,
    },
    {
      id: 'kling-pro' as const,
      name: 'Kling Pro',
      description: 'Kling AI Pro - Premium quality, 5-10 second videos',
      cost: 200,
      feature: 'klingPro' as const,
      recommended: true,
    },
  ];

  // Get current generator
  const currentGenerator = generatorOptions.find(g => g.id === selectedGenerator) || generatorOptions[0];

  // Safety check
  if (!currentGenerator) {
    return <div>No generators available</div>;
  }

  const handleGeneratorClick = (option: typeof generatorOptions[number]) => {
    if (tierLoading) return;
    if (!hasAccess(option.feature)) {
      router.push('/pricing?upgrade=true');
      return;
    }
    setSelectedGenerator(option.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!script.trim()) {
      alert('Please enter a script');
      return;
    }

    onGenerate({
      script: script.trim(),
      videoGenerator: selectedGenerator,
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Script Input */}
        <div className="space-y-2">
          <label htmlFor="script" className="text-sm font-medium">
            Script for Talking Head Video
          </label>
          <textarea
            id="script"
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Enter your script here..."
            className="w-full min-h-[120px] p-3 border rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
            required
            disabled={isGenerating}
          />
          <p className="text-xs text-muted-foreground">
            Describe what the avatar should say in the video
          </p>
        </div>

        {/* Video Generator Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Video Generator</label>

          <div className="grid grid-cols-1 gap-3">
            {generatorOptions.map((option) => {
              const locked = !tierLoading && !hasAccess(option.feature);
              return (
                <div
                  key={option.id}
                  className={`relative p-4 border rounded-lg transition-all ${
                    locked
                      ? 'border-border opacity-60 cursor-pointer'
                      : selectedGenerator === option.id
                        ? 'border-primary bg-primary/5 ring-2 ring-primary cursor-pointer'
                        : 'border-border hover:border-primary/50 cursor-pointer'
                  }`}
                  onClick={() => handleGeneratorClick(option)}
                >
                  {locked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-lg z-10">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Lock className="h-4 w-4" />
                        Upgrade to Pro
                      </div>
                    </div>
                  )}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedGenerator === option.id && !locked
                          ? 'border-primary bg-primary'
                          : 'border-border'
                      }`}>
                        {selectedGenerator === option.id && !locked && (
                          <div className="w-full h-full rounded-full bg-primary transform scale-50" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{option.name}</span>
                          {option.recommended && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {option.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{option.cost}</div>
                      <div className="text-xs text-muted-foreground">credits</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Cost Display */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Current cost:</span>
            <span className="font-bold text-lg">{currentGenerator.cost}</span>
            <span className="text-sm text-muted-foreground">credits</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Selected: {currentGenerator.name}
          </div>
        </div>

        {/* Generate Button */}
        <button
          type="submit"
          disabled={isGenerating || !script.trim()}
          className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center space-x-2">
              <span className="animate-pulse">Generating...</span>
            </span>
          ) : (
            <span className="flex items-center justify-between">
              <span>Generate Video</span>
              <span className="text-sm opacity-75">{currentGenerator.cost} credits</span>
            </span>
          )}
        </button>
      </form>

      {/* Info Message */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Your video will be ready in 2-5 minutes</p>
        <p>You can track progress in your dashboard</p>
      </div>
    </div>
  );
}
