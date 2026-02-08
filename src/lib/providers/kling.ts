import axios from 'axios';
import { poll, pTimeout } from 'p-timeout';

/**
 * Kling AI Video Provider for Bermy Banana
 * Supports both Standard (150 credits) and Pro (300 credits) tiers
 */

export interface KlingConfig {
  accessKey: string;
  secretKey: string;
  baseUrl: string;
}

export interface KlingGenerateParams {
  prompt: string;
  duration?: number; // 5-10 seconds
  aspectRatio?: '9:16' | '16:9';
  tier?: 'standard' | 'pro';
}

export interface KlingTaskResponse {
  task_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  video_url?: string;
  error_code?: string;
  error_message?: string;
}

export class KlingProvider {
  private config: KlingConfig;

  constructor(config: KlingConfig) {
    this.config = config;
  }

  /**
   * Generate video from prompt
   * Returns task ID for polling
   */
  async generate(params: KlingGenerateParams): Promise<{ taskId: string; creditsUsed: number }> {
    const { prompt, duration = 7, aspectRatio = '9:16', tier = 'standard' } = params;
    
    // Determine credit cost based on tier
    const creditsUsed = tier === 'pro' ? 200 : 150;

    try {
      const response = await axios.post(
        `${this.config.baseUrl}/v1/video/generate`,
        {
          prompt,
          duration,
          aspect_ratio: aspectRatio,
          // Add any tier-specific parameters here
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.accessKey}`,
            'X-API-Key': this.config.secretKey,
          },
          timeout: 30000, // 30 second timeout
        }
      );

      if (response.data.task_id) {
        return {
          taskId: response.data.task_id,
          creditsUsed,
        };
      }

      throw new Error('No task_id returned from Kling API');
    } catch (error) {
      console.error('Kling generation error:', error);
      throw new Error(`Kling generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Poll for task completion
   * Returns async generator for progress updates
   */
  async *poll(taskId: string): AsyncGenerator<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
    resultUrl?: string;
    error?: string;
  }> {
    const maxAttempts = 60; // 10 minutes max (60 * 10 seconds)
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await axios.get(
          `${this.config.baseUrl}/v1/video/query/${taskId}`,
          {
            headers: {
              'Authorization': `Bearer ${this.config.accessKey}`,
              'X-API-Key': this.config.secretKey,
            },
          }
        );

        const data = response.data;

        yield {
          status: data.status,
          progress: data.progress,
          resultUrl: data.video_url,
          error: data.error_message,
        };

        if (data.status === 'completed' || data.status === 'failed') {
          break;
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, 10000)); // 10 second delay

      } catch (error) {
        console.error('Kling polling error:', error);
        yield {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Polling failed',
        };
        break;
      }
    }

    if (attempts >= maxAttempts) {
      yield {
        status: 'failed',
        error: 'Maximum polling time exceeded',
      };
    }
  }

  /**
   * Cancel a generation task
   */
  async cancel(taskId: string): Promise<void> {
    try {
      await axios.delete(
        `${this.config.baseUrl}/v1/video/cancel/${taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessKey}`,
            'X-API-Key': this.config.secretKey,
          },
        }
      );
    } catch (error) {
      console.error('Kling cancel error:', error);
      throw new Error(`Failed to cancel Kling task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * Factory function to create Kling provider with env vars
 */
export function createKlingProvider(): KlingProvider {
  const accessKey = process.env.KLING_ACCESS_KEY;
  const secretKey = process.env.KLING_SECRET_KEY;
  const baseUrl = process.env.KLING_API_URL || 'https://api.kling.ai/v1';

  if (!accessKey || !secretKey) {
    throw new Error('Kling API credentials not configured. Please set KLING_ACCESS_KEY and KLING_SECRET_KEY in .env.local');
  }

  return new KlingProvider({
    accessKey,
    secretKey,
    baseUrl,
  });
}