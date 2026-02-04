/**
 * Nano Banana Pro (Gemini 3 Pro Image) Provider
 *
 * This provider handles image generation using Google's Gemini 3 Pro Image model,
 * also known as Nano Banana Pro. It supports:
 * - High-resolution output (1K, 2K, 4K)
 * - Up to 14 reference images (6 objects, 5 humans)
 * - Various aspect ratios
 */

import { GoogleGenAI, type Part } from "@google/genai";
import type {
  ImageGenerationRequest,
  ImageGenerationResult,
} from "./types";

// Model ID for Nano Banana Pro
const MODEL_ID = "gemini-3-pro-image-preview";

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
 * Fetch an image from a URL and convert it to base64
 */
async function fetchImageAsBase64(url: string): Promise<{
  data: string;
  mimeType: string;
}> {
  // Handle local URLs
  if (url.startsWith("/")) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    url = `${baseUrl}${url}`;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${url}`);
  }

  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const mimeType = response.headers.get("content-type") || "image/png";

  return { data: base64, mimeType };
}

/**
 * Generate an image using Nano Banana Pro
 *
 * @param request - Image generation request with prompt and optional reference images
 * @returns Image generation result with base64 image data
 */
export async function generateImage(
  request: ImageGenerationRequest
): Promise<ImageGenerationResult> {
  try {
    const client = getClient();

    // Build the content parts array
    const parts: Part[] = [];

    // Add text prompt
    parts.push({ text: request.prompt });

    // Add reference images if provided
    if (request.referenceImages && request.referenceImages.length > 0) {
      for (const refImage of request.referenceImages) {
        try {
          const imageData = await fetchImageAsBase64(refImage.url);
          parts.push({
            inlineData: {
              data: imageData.data,
              mimeType: imageData.mimeType,
            },
          });
        } catch (error) {
          console.error(`Failed to fetch reference image ${refImage.url}:`, error);
          // Continue without this image
        }
      }
    }

    // Generate the image
    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents: [{ role: "user", parts }],
      config: {
        responseModalities: ["TEXT", "IMAGE"],
        // Note: The SDK types may vary - adjust based on actual API
      },
    });

    // Extract the result
    let imageData: Buffer | undefined;
    let mimeType: string | undefined;
    let thoughtText: string | undefined;

    // Process the response parts
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      if (candidate && candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.text) {
            thoughtText = (thoughtText || "") + part.text;
          }
          if (part.inlineData) {
            imageData = Buffer.from(part.inlineData.data || "", "base64");
            mimeType = part.inlineData.mimeType || "image/png";
          }
        }
      }
    }

    if (!imageData) {
      return {
        success: false,
        error: "No image generated in response",
        thoughtText,
      };
    }

    return {
      success: true,
      imageData,
      mimeType,
      thoughtText,
    };
  } catch (error) {
    console.error("Nano Banana generation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Build an optimized prompt for Mode B (Influencer Photo)
 *
 * Applies best practices from the Nano Banana Pro tips guide:
 * - Specific subject description
 * - Composition and framing
 * - Style (photorealistic, phone-captured aesthetic)
 * - Lighting and mood
 */
export function buildInfluencerPhotoPrompt(options: {
  basePrompt: string;
  aspectRatio?: string;
  style?: "casual" | "professional" | "lifestyle" | "selfie";
  productName?: string | undefined;
  includeProduct?: boolean;
}): string {
  const { basePrompt, aspectRatio = "9:16", style = "casual", productName, includeProduct } = options;

  const styleDescriptions: Record<string, string> = {
    casual:
      "casual, candid photo, natural lighting, relaxed atmosphere, authentic social media aesthetic",
    professional:
      "professional portrait, studio-quality lighting, polished appearance, brand-ready",
    lifestyle:
      "lifestyle photography, natural environment, aspirational mood, editorial quality",
    selfie:
      "front-facing selfie style, phone camera perspective, close-up portrait, genuine expression",
  };

  const styleDesc = styleDescriptions[style] || styleDescriptions.casual;

  // Build product context if provided
  const productContext = includeProduct && productName
    ? `\n\nProduct Integration: The subject is holding, wearing, or interacting with a product (${productName}). The product should be naturally integrated into the scene, clearly visible but not overly promotional-looking.`
    : "";

  // Build the optimized prompt
  return `Create a photorealistic image for social media content.

Subject: ${basePrompt}

Style: ${styleDesc}${productContext}

Composition: ${aspectRatio === "9:16" ? "Vertical portrait format suitable for Instagram Stories/Reels or TikTok" : "Standard social media format"}

Quality: High-resolution, sharp focus on subject, professional color grading, natural skin tones

The image should look like it was captured by a professional content creator using a high-end smartphone camera. Authentic, engaging, and suitable for commercial UGC content.`;
}
