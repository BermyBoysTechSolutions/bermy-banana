/**
 * Provider types for AI generation services
 */

/**
 * Aspect ratios supported by image/video generation
 */
export type AspectRatio =
  | "1:1"
  | "2:3"
  | "3:2"
  | "3:4"
  | "4:3"
  | "4:5"
  | "5:4"
  | "9:16"
  | "16:9"
  | "21:9";

/**
 * Image resolution for Nano Banana Pro
 */
export type ImageResolution = "1K" | "2K" | "4K";

/**
 * Reference image types for generation
 */
export interface ReferenceImage {
  url: string;
  type: "avatar" | "product" | "reference";
}

/**
 * Image generation request
 */
export interface ImageGenerationRequest {
  prompt: string;
  referenceImages?: ReferenceImage[];
  aspectRatio?: AspectRatio;
  resolution?: ImageResolution;
}

/**
 * Image generation result
 */
export interface ImageGenerationResult {
  success: boolean;
  imageData?: Buffer | undefined;
  mimeType?: string | undefined;
  error?: string | undefined;
  thoughtText?: string | undefined; // Any reasoning text from the model
}

/**
 * Video generation request for Veo 3.1
 */
export interface VideoGenerationRequest {
  prompt: string;
  referenceImages?: ReferenceImage[];
  aspectRatio?: AspectRatio;
  duration?: 5 | 6 | 8; // seconds (Veo requires 5-8)
  audioEnabled?: boolean;
}

/**
 * Async video generation result (Veo uses polling)
 */
export interface VideoGenerationInitResult {
  success: boolean;
  operationId?: string; // Used for polling
  error?: string;
}

/**
 * Video generation poll result
 */
export interface VideoGenerationPollResult {
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  videoData?: Buffer;
  mimeType?: string;
  error?: string;
}

/**
 * Generation modes
 */
export type GenerationMode = "MODE_A" | "MODE_B" | "MODE_C";

/**
 * Mode descriptions
 */
export const MODE_DESCRIPTIONS: Record<GenerationMode, string> = {
  MODE_A: "UGC Talking Video - Avatar with script generates talking head video",
  MODE_B: "Influencer Photo - Avatar with prompt generates realistic photo",
  MODE_C: "Product Video - Product demo with optional avatar",
};
