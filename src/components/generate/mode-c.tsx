'use client';

import { useState } from 'react';

/**
 * Mode C: Product Video
 * Supports Veo, Kling Standard, and Kling Pro video generators
 * Creates product-focused videos with optional avatar
 */

interface ModeCProps {
  onGenerate: (data: {
    script: string;
    videoGenerator: 'veo' | 'kling-standard' | 'kling-pro';
    referenceImage?: string;
  }) => void;
  isGenerating?: boolean;
}

export default function ModeC({ onGenerate, isGenerating = false }: ModeCProps) {
  const [script, setScript] = useState('');
  const [selectedGenerator, setSelectedGenerator] = useState<'veo' | 'kling-standard' | 'kling-pro'>('veo');
  const [referenceImage, setReferenceImage] = useState<string>('');

  // Video generator options
  const generatorOptions = [
    {
      id: 'veo' as const,
      name: 'Veo',
      description: "Google's Veo - Reliable and fast video generation",
      cost: 100,
      recommended: true,
    },
    {
      id: 'kling-standard' as const,
      name: 'Kling Standard',
      description: 'Kling AI Standard - Good quality, 5-10 second videos',
      cost: 150,
      recommended: false,
    },
    {
      id: 'kling-pro' as const,
      name: 'Kling Pro',
      description: 'Kling AI Pro - Premium quality, 5-10 second videos',
      cost: 200,
      recommended: false,
    },
  ];

  // Get current generator
  const currentGenerator = generatorOptions.find(g => g.id === selectedGenerator) || generatorOptions[0];

  // Safety check
  if (!currentGenerator) {
    return <div>No generators available</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!script.trim()) {
      alert('Please enter a script');
      return;
    }

  const generateData: {
    script: string;
    videoGenerator: 'veo' | 'kling-standard' | 'kling-pro';
    referenceImage?: string;
  } = {
    script: script.trim(),
    videoGenerator: selectedGenerator,
  };

  if (referenceImage.trim()) {
    generateData.referenceImage = referenceImage.trim();
  }

  onGenerate(generateData);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Script Input */}
        <div className="space-y-2">
          <label htmlFor="script-c" className="text-sm font-medium">
            Script for Video + Image
          </label>
          <textarea
            id="script-c"
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
            {generatorOptions.map((option) => (
              <div
                key={option.id}
                className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedGenerator === option.id
                    ? 'border-primary bg-primary/5 ring-2 ring-primary'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedGenerator(option.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedGenerator === option.id
                        ? 'border-primary bg-primary'
                        : 'border-border'
                    }`}>
                      {selectedGenerator === option.id && (
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
            ))}
          </div>
        </div>

        {/* Reference Image URL */}
        <div className="space-y-2">
          <label htmlFor="reference-image" className="text-sm font-medium">
            Reference Image URL (Optional)
          </label>
          <input
            id="reference-image"
            type="url"
            value={referenceImage}
            onChange={(e) => setReferenceImage(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={isGenerating}
          />
          <p className="text-xs text-muted-foreground">
            Optional reference image for the video
          </p>
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