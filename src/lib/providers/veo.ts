/**
 * Veo 3.1 Provider for Video Generation
 *
 * This provider handles video generation using Google's Veo model via the Gemini API.
 * Veo uses an async workflow: initiate → poll → download
 *
 * Features:
 * - Duration: 5-8 seconds
 * - Aspect ratios: 9:16 (vertical), 16:9 (horizontal)
 * - Optional audio generation
 */

import { GoogleGenAI } from "@google/genai";
import type {
  VideoGenerationRequest,
  VideoGenerationPollResult,
} from "./types";

// Model ID for Veo - use the preview model for Gemini API
const VEO_MODEL = "veo-3.1-generate-preview";

// Polling configuration
const POLL_INTERVAL_MS = 10000; // 10 seconds (video generation takes time)
const MAX_POLL_ATTEMPTS = 60; // 10 minutes max

/**
 * Get the Google AI client
 */
function getClient(): GoogleGenAI {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_AI_API_KEY is not configured");
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Build a prompt for UGC talking head video
 */
export function buildUGCVideoPrompt(options: {
  script: string;
  avatarDescription?: string | undefined;
  action?: string | undefined;
  productDescription?: string | undefined;
  sceneType?: "hook" | "demo" | "cta" | "custom" | undefined;
  setting?: string | undefined;
}): string {
  const {
    script,
    avatarDescription,
    action,
    productDescription,
    sceneType,
    setting,
  } = options;

  let prompt = `Create a UGC-style talking head video for social media.\n\n`;

  // Avatar description is critical for consistency
  if (avatarDescription) {
    prompt += `The person in the video must look exactly like this: ${avatarDescription}\n\n`;
  }

  prompt += `The person is speaking directly to the camera, delivering this script naturally and engagingly:\n\n"${script}"\n\n`;

  if (action) {
    prompt += `What they are doing: ${action}\n\n`;
  }

  if (productDescription) {
    prompt += `They are featuring this product: ${productDescription}\n\n`;
  }

  if (sceneType) {
    const sceneGuidance: Record<string, string> = {
      hook: "This is an attention-grabbing hook - the speaker should be energetic and immediately captivating.",
      demo: "This is a product demonstration - the speaker should be informative and show the product clearly.",
      cta: "This is a call-to-action - the speaker should be persuasive and direct.",
      custom: "",
    };
    if (sceneGuidance[sceneType]) {
      prompt += `Style: ${sceneGuidance[sceneType]}\n\n`;
    }
  }

  if (setting) {
    prompt += `Setting/Location: ${setting}\n\n`;
  }

  prompt += `Technical requirements:
- Vertical 9:16 format (TikTok/Reels style)
- Direct eye contact with camera
- Good lighting on face
- Natural, authentic speaking style
- Phone-captured aesthetic`;

  return prompt;
}

/**
 * Action types for product videos
 */
export type ProductAction = "hold" | "point" | "use" | "unbox" | "demo";

/**
 * Build a prompt for product-focused video (Mode C)
 */
export function buildProductVideoPrompt(options: {
  productName: string;
  productDescription?: string | undefined;
  action: ProductAction;
  script?: string | undefined;
  includeAvatar?: boolean | undefined;
  avatarDescription?: string | undefined;
  setting?: string | undefined;
}): string {
  const {
    productName,
    productDescription,
    action,
    script,
    includeAvatar,
    avatarDescription,
    setting,
  } = options;

  // Action-specific guidance
  const actionGuidance: Record<ProductAction, string> = {
    hold: "The product is being held up to the camera, clearly visible, with the person showcasing it proudly.",
    point: "The person is pointing at specific features of the product, drawing attention to its details.",
    use: "The product is being actively used/demonstrated, showing it in action and its practical benefits.",
    unbox: "This is an unboxing video - the product is being revealed from its packaging with genuine excitement.",
    demo: "This is a detailed product demonstration showing how the product works step by step.",
  };

  let prompt = `Create a product-focused video for social media (TikTok/Reels style).

Product: ${productName}
${productDescription ? `Description: ${productDescription}` : ""}

Action: ${actionGuidance[action]}

`;

  if (script) {
    prompt += `The person should be saying: "${script}"\n\n`;
  }

  if (includeAvatar && avatarDescription) {
    prompt += `The presenter should match this description: ${avatarDescription}\n\n`;
  } else if (includeAvatar) {
    prompt += `Include a presenter/influencer showing the product.\n\n`;
  }

  if (setting) {
    prompt += `Setting: ${setting}\n\n`;
  }

  prompt += `Technical requirements:
- Vertical 9:16 format (TikTok/Reels style)
- Product should be clearly visible and well-lit
- Professional but authentic UGC aesthetic
- ${includeAvatar ? "Direct eye contact with camera when speaking" : "Focus on the product throughout"}
- Clean, attractive background`;

  return prompt;
}

/**
 * Generate a video using Veo and wait for completion
 *
 * This function handles the full flow:
 * 1. Initiate video generation
 * 2. Poll until completion
 * 3. Download the video data
 *
 * @param request - Video generation request
 * @param onProgress - Optional callback for progress updates
 * @returns Final video result with video data
 */
export async function generateVideo(
  request: VideoGenerationRequest,
  onProgress?: (status: string, attempt: number) => void
): Promise<VideoGenerationPollResult> {
  try {
    const client = getClient();

    // Map aspect ratio - Veo supports 16:9, 9:16, and 1:1
    const aspectRatio = request.aspectRatio === "16:9" ? "16:9" : request.aspectRatio === "1:1" ? "1:1" : "9:16";

    // Build config - minimal config to avoid unsupported parameter errors
    const config: Record<string, unknown> = {
      aspectRatio: aspectRatio,
    };

    console.warn("Initiating Veo video generation with config:", {
      model: VEO_MODEL,
      prompt: request.prompt.substring(0, 100) + "...",
      config,
    });

    // Initiate generation - this returns an operation object
    let operation = await client.models.generateVideos({
      model: VEO_MODEL,
      prompt: request.prompt,
      config: config,
    });

    console.warn("Initial operation response:", {
      done: operation?.done,
      name: operation?.name,
      hasResponse: !!operation?.response,
    });

    // Poll the operation status until the video is ready
    let attempts = 0;
    while (!operation.done && attempts < MAX_POLL_ATTEMPTS) {
      if (onProgress) {
        onProgress("PROCESSING", attempts);
      }

      console.warn(`Polling attempt ${attempts + 1}/${MAX_POLL_ATTEMPTS}...`);
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

      // Use getVideosOperation for video operations
      operation = await client.operations.getVideosOperation({
        operation: operation,
      });

      console.warn(`Poll result: done=${operation.done}`);
      attempts++;
    }

    if (!operation.done) {
      return {
        status: "FAILED",
        error: "Video generation timed out",
      };
    }

    // Check for errors in the operation
    if (operation.error) {
      const errorMsg = typeof operation.error === "object" && operation.error !== null && "message" in operation.error
        ? String(operation.error.message)
        : "Video generation failed";
      return {
        status: "FAILED",
        error: errorMsg,
      };
    }

    // Extract the video from the response
    const response = operation.response as {
      generatedVideos?: Array<{
        video?: {
          uri?: string;
          videoBytes?: string;
        } | string;
      }>;
    } | undefined;

    if (!response?.generatedVideos || response.generatedVideos.length === 0) {
      return {
        status: "FAILED",
        error: "No video generated in response",
      };
    }

    const generatedVideo = response.generatedVideos[0];
    if (!generatedVideo?.video) {
      return {
        status: "FAILED",
        error: "Video data missing in response",
      };
    }

    const videoRef = generatedVideo.video;

    // Handle different video response formats
    if (typeof videoRef === "string") {
      // Base64 encoded video data
      return {
        status: "COMPLETED",
        videoData: Buffer.from(videoRef, "base64"),
        mimeType: "video/mp4",
      };
    }

    if (videoRef.videoBytes) {
      // Base64 video bytes
      return {
        status: "COMPLETED",
        videoData: Buffer.from(videoRef.videoBytes, "base64"),
        mimeType: "video/mp4",
      };
    }

    if (videoRef.uri) {
      // Video is at a URI - download it with authentication
      const apiKey = process.env.GOOGLE_AI_API_KEY;
      const downloadUrl = videoRef.uri.includes("?")
        ? `${videoRef.uri}&key=${apiKey}`
        : `${videoRef.uri}?key=${apiKey}`;

      console.warn("Downloading video from URI:", videoRef.uri);

      const fetchResponse = await fetch(downloadUrl);
      if (fetchResponse.ok) {
        const buffer = await fetchResponse.arrayBuffer();
        return {
          status: "COMPLETED",
          videoData: Buffer.from(buffer),
          mimeType: fetchResponse.headers.get("content-type") || "video/mp4",
        };
      } else {
        const errorText = await fetchResponse.text().catch(() => "");
        console.error("Video download failed:", fetchResponse.status, errorText);
        return {
          status: "FAILED",
          error: `Failed to download video: ${fetchResponse.status} ${fetchResponse.statusText}`,
        };
      }
    }

    return {
      status: "FAILED",
      error: "Unknown video format in response",
    };
  } catch (error) {
    console.error("Veo video generation error:", error);
    return {
      status: "FAILED",
      error: error instanceof Error ? error.message : "Video generation failed",
    };
  }
}

/**
 * Generate an FFmpeg concat script for multi-scene videos
 *
 * @param clipUrls - Array of clip URLs in order
 * @returns FFmpeg concat script content
 */
export function generateConcatScript(clipUrls: string[]): string {
  const fileList = clipUrls
    .map((_url, index) => `file 'clip_${index + 1}.mp4'`)
    .join("\n");

  return `# FFmpeg Concat Script for Bermy Banana Multi-Scene Video
#
# Instructions:
# 1. Download all clips to the same directory
# 2. Rename them to clip_1.mp4, clip_2.mp4, etc.
# 3. Save this file as concat.txt in the same directory
# 4. Run: ffmpeg -f concat -safe 0 -i concat.txt -c copy output.mp4
#
# File list:
${fileList}

# Alternative one-liner (if clips are already named correctly):
# ffmpeg -f concat -safe 0 -i concat.txt -c copy final_video.mp4
`;
}
