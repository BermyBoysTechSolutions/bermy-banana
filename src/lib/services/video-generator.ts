/**
 * Video Generator Service
 * 
 * Provides a unified interface for multiple video generation providers
 * Supports Veo, Kling Standard, and Kling Pro
 */

import { generateVideo as generateVeoVideo } from "@/lib/providers/veo";
import { createKlingProvider } from "@/lib/providers/kling";
import type { VideoGenerationRequest, VideoGenerationPollResult } from "@/lib/providers/types";

export type VideoGenerator = "veo" | "kling-standard" | "kling-pro";

export interface GeneratorConfig {
  name: string;
  credits: number;
  description: string;
}

export const GENERATOR_CONFIGS: Record<VideoGenerator, GeneratorConfig> = {
  veo: {
    name: "Veo",
    credits: 100,
    description: "Google's Veo - Reliable and fast"
  },
  "kling-standard": {
    name: "Kling Standard (150 credits)",
    credits: 150,
    description: "Kling AI Standard - Good quality"
  },
  "kling-pro": {
    name: "Kling Pro (200 credits)",
    credits: 200,
    description: "Kling AI Pro - Premium quality"
  }
};

/**
 * Generate video using the specified generator
 */
export async function generateVideoWithProvider(
  generator: VideoGenerator,
  request: VideoGenerationRequest,
  onProgress?: (status: string, attempt: number) => void
): Promise<VideoGenerationPollResult> {
  try {
    switch (generator) {
      case "veo":
        return await generateVeoVideo(request, onProgress);
        
      case "kling-standard":
      case "kling-pro": {
        const klingProvider = createKlingProvider();
        const tier = generator === "kling-pro" ? "pro" : "standard";
        
        // Build Kling prompt from request
        const klingPrompt = request.prompt;
        const aspectRatio = request.aspectRatio === "16:9" ? "16:9" : "9:16";
        const duration = request.duration || 7;
        
        // Start generation
        const { taskId } = await klingProvider.generate({
          prompt: klingPrompt,
          duration,
          aspectRatio,
          tier,
        });
        
        // Poll for completion
        let attempts = 0;
        for await (const update of klingProvider.poll(taskId)) {
          if (onProgress) {
            onProgress(update.status.toUpperCase(), attempts);
          }
          
          if (update.status === 'completed') {
            // Download video
            if (update.resultUrl) {
              const response = await fetch(update.resultUrl);
              if (response.ok) {
                const buffer = await response.arrayBuffer();
                return {
                  status: "COMPLETED",
                  videoData: Buffer.from(buffer),
                  mimeType: "video/mp4",
                };
              }
            }
            return {
              status: "FAILED",
              error: "Video completed but no URL provided",
            };
          }
          
          if (update.status === 'failed') {
            return {
              status: "FAILED",
              error: update.error || "Kling generation failed",
            };
          }
          
          attempts++;
        }
        
        return {
          status: "FAILED",
          error: "Video generation timed out",
        };
      }
      
      default:
        return {
          status: "FAILED",
          error: `Unknown video generator: ${generator}`,
        };
    }
  } catch (error) {
    console.error(`Video generation error with ${generator}:`, error);
    return {
      status: "FAILED",
      error: error instanceof Error ? error.message : "Video generation failed",
    };
  }
}

/**
 * Get the credit cost for a generator
 */
export function getGeneratorCredits(generator: VideoGenerator): number {
  return GENERATOR_CONFIGS[generator].credits;
}