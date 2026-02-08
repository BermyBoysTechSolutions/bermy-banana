/**
 * Generation Service
 *
 * Orchestrates the creation and processing of generation jobs.
 * Handles job creation, scene management, and output storage.
 */

import { db } from "@/lib/db";
import {
  generationJob,
  scene,
  outputAsset,
  avatar,
  productAsset,
  referenceImage,
  user,
} from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { upload } from "@/lib/storage";
import {
  generateImage,
  buildInfluencerPhotoPrompt,
} from "@/lib/providers/nano-banana";
import {
  generateVideo,
  buildUGCVideoPrompt,
  buildProductVideoPrompt,
  generateConcatScript,
  type ProductAction,
} from "@/lib/providers/veo";
import { checkCredits, deductCredits } from "./credits";
import type { GenerationMode } from "@/lib/providers/types";
import type {
  GenerationJob,
  Scene,
  OutputAsset,
} from "@/lib/schema";
import { generateVideoWithProvider, type VideoGenerator } from "./video-generator";

/**
 * Scene configuration for Mode A
 */
export interface SceneConfig {
  type: "hook" | "demo" | "cta" | "custom";
  script: string;
  action?: string | undefined;
  setting?: string | undefined;
  duration: 5 | 6 | 8;
  avatarId?: string | undefined;
  productId?: string | undefined;
}

/**
 * Mode A generation request
 */
export interface ModeAGenerationRequest {
  avatarId: string;
  productId?: string | undefined;
  referenceImageId?: string | undefined;
  scenes: SceneConfig[];
  title?: string | undefined;
  aspectRatio?: "16:9" | "9:16" | "1:1" | undefined;
  audioEnabled?: boolean | undefined;
  videoGenerator?: VideoGenerator | undefined;
}

/**
 * Mode B generation request
 */
export interface ModeBGenerationRequest {
  avatarId?: string | undefined;
  prompt: string;
  style?: "casual" | "professional" | "lifestyle" | "selfie" | undefined;
  aspectRatio?: "9:16" | "16:9" | "1:1" | undefined;
  title?: string | undefined;
  productId?: string | undefined;
  referenceImageId?: string | undefined;
}

/**
 * Scene configuration for Mode C (product video)
 */
export interface ProductSceneConfig {
  action: ProductAction;
  script?: string | undefined;
  duration: 5 | 6 | 8;
  setting?: string | undefined;
}

/**
 * Mode C generation request
 */
export interface ModeCGenerationRequest {
  productId: string;
  avatarId?: string | undefined;
  referenceImageId?: string | undefined;
  scenes: ProductSceneConfig[];
  title?: string | undefined;
  aspectRatio?: "16:9" | "9:16" | "1:1" | undefined;
  audioEnabled?: boolean | undefined;
  videoGenerator?: VideoGenerator | undefined;
}

/**
 * Generation result
 */
export interface GenerationResult {
  success: boolean;
  jobId?: string | undefined;
  outputUrl?: string | undefined;
  error?: string | undefined;
}

/**
 * Check if user can generate (approved status and has credits)
 */
export async function canUserGenerate(
  userId: string,
  mode: GenerationMode,
  sceneCount: number = 1,
  videoGenerator?: VideoGenerator
): Promise<{ allowed: boolean; error?: string | undefined }> {
  // Check user approval status
  const [userData] = await db
    .select({ status: user.status })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!userData) {
    return { allowed: false, error: "User not found" };
  }

  if (userData.status !== "APPROVED") {
    return {
      allowed: false,
      error: "Account must be approved to generate content",
    };
  }

  // Check credits
  const creditCheck = await checkCredits(userId, mode, sceneCount);
  if (!creditCheck.allowed) {
    return { allowed: false, error: creditCheck.error ?? "Insufficient credits" };
  }

  return { allowed: true };
}

/**
 * Generate an influencer photo (Mode B)
 *
 * This is the simplest generation mode:
 * 1. Validate user can generate
 * 2. Fetch avatar reference image
 * 3. Build optimized prompt
 * 4. Call Nano Banana provider
 * 5. Store output and return URL
 */
export async function generateInfluencerPhoto(
  userId: string,
  request: ModeBGenerationRequest
): Promise<GenerationResult> {
  try {
    // 1. Check if user can generate
    const canGenerate = await canUserGenerate(userId, "MODE_B");
    if (!canGenerate.allowed) {
      return { success: false, error: canGenerate.error ?? "Cannot generate" };
    }

    // 2. Fetch the avatar (if provided)
    let avatarData: { id: string; name: string; referenceImageUrl: string; description: string | null } | null = null;
    if (request.avatarId) {
      const [fetchedAvatar] = await db
        .select()
        .from(avatar)
        .where(and(eq(avatar.id, request.avatarId), eq(avatar.userId, userId)))
        .limit(1);
      avatarData = fetchedAvatar ?? null;
    }

    // 3. Fetch reference image (if provided)
    let referenceImageData: { id: string; name: string; imageUrl: string; description: string | null } | null = null;
    if (request.referenceImageId) {
      const [fetchedRef] = await db
        .select()
        .from(referenceImage)
        .where(and(eq(referenceImage.id, request.referenceImageId), eq(referenceImage.userId, userId)))
        .limit(1);
      referenceImageData = fetchedRef ?? null;
    }

    // Must have either avatar or reference image
    if (!avatarData && !referenceImageData) {
      return { success: false, error: "Either avatar or reference image must be provided" };
    }

    const aspectRatio = request.aspectRatio ?? "9:16";
    const configAspectRatio = aspectRatio === "1:1" ? "9:16" : aspectRatio;

    // Determine the name for the job title
    const sourceName = avatarData?.name ?? referenceImageData?.name ?? "Untitled";

    // 3. Create the job record
    const [job] = await db
      .insert(generationJob)
      .values({
        userId,
        mode: "MODE_B",
        status: "PROCESSING",
        title: request.title ?? `Influencer Photo - ${sourceName}`,
        config: {
          aspectRatio: configAspectRatio as "9:16" | "16:9",
        },
      })
      .returning();

    if (!job) {
      return { success: false, error: "Failed to create job" };
    }

    // Fetch optional product data
    let productData: { name: string; description: string | null; imageUrl: string } | null = null;
    if (request.productId) {
      const [fetchedProduct] = await db
        .select()
        .from(productAsset)
        .where(and(eq(productAsset.id, request.productId), eq(productAsset.userId, userId)))
        .limit(1);
      if (fetchedProduct) {
        productData = fetchedProduct;
      }
    }

    // 4. Create the scene record
    const [sceneRecord] = await db
      .insert(scene)
      .values({
        jobId: job.id,
        order: 1,
        avatarId: request.avatarId,
        productId: request.productId ?? undefined,
        prompt: request.prompt,
        status: "PROCESSING",
      })
      .returning();

    if (!sceneRecord) {
      return { success: false, jobId: job.id, error: "Failed to create scene" };
    }

    try {
      // 5. Build the optimized prompt
      const optimizedPrompt = buildInfluencerPhotoPrompt({
        basePrompt: request.prompt,
        aspectRatio: aspectRatio,
        style: request.style ?? "casual",
        productName: productData?.name ?? undefined,
        includeProduct: !!productData,
      });

      // 6. Build reference images array
      const referenceImages: Array<{ url: string; type: "avatar" | "product" | "reference" }> = [];

      // Add avatar reference if present
      if (avatarData) {
        referenceImages.push({
          url: avatarData.referenceImageUrl,
          type: "avatar",
        });
      }

      // Add product reference if present
      if (productData) {
        referenceImages.push({
          url: productData.imageUrl,
          type: "product",
        });
      }

      // Add reference image if present
      if (referenceImageData) {
        referenceImages.push({
          url: referenceImageData.imageUrl,
          type: "reference",
        });
      }

      // 7. Generate the image
      const result = await generateImage({
        prompt: optimizedPrompt,
        referenceImages,
        aspectRatio: aspectRatio,
        resolution: "2K",
      });

      if (!result.success || !result.imageData) {
        // Update job and scene as failed
        const errorMsg = result.error ?? "Image generation failed";
        await db
          .update(generationJob)
          .set({
            status: "FAILED",
            errorMessage: errorMsg,
          })
          .where(eq(generationJob.id, job.id));

        await db
          .update(scene)
          .set({
            status: "FAILED",
            errorMessage: errorMsg,
          })
          .where(eq(scene.id, sceneRecord.id));

        return {
          success: false,
          jobId: job.id,
          error: errorMsg,
        };
      }

      // 7. Upload the generated image
      const timestamp = Date.now();
      const filename = `mode-b-${job.id}-${timestamp}.png`;
      const uploadResult = await upload(result.imageData, filename, "outputs");

      // 8. Create output asset record
      const [output] = await db
        .insert(outputAsset)
        .values({
          jobId: job.id,
          sceneId: sceneRecord.id,
          type: "IMAGE",
          url: uploadResult.url,
          metadata: {
            width: 1080, // 2K vertical
            height: 1920,
            format: result.mimeType ?? "image/png",
          },
        })
        .returning();

      if (!output) {
        return { success: false, jobId: job.id, error: "Failed to create output" };
      }

      // 9. Update job and scene as completed
      await db
        .update(generationJob)
        .set({
          status: "COMPLETED",
          completedAt: new Date(),
        })
        .where(eq(generationJob.id, job.id));

      await db
        .update(scene)
        .set({ status: "COMPLETED" })
        .where(eq(scene.id, sceneRecord.id));

      // 10. Deduct credits (1 image = 50 credits)
      await deductCredits(userId, "MODE_B", 1);

      return {
        success: true,
        jobId: job.id,
        outputUrl: output.url,
      };
    } catch (error) {
      // Update job as failed
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      await db
        .update(generationJob)
        .set({
          status: "FAILED",
          errorMessage: errorMsg,
        })
        .where(eq(generationJob.id, job.id));

      await db
        .update(scene)
        .set({
          status: "FAILED",
          errorMessage: errorMsg,
        })
        .where(eq(scene.id, sceneRecord.id));

      throw error;
    }
  } catch (error) {
    console.error("Generation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Generation failed",
    };
  }
}

/**
 * Get a job by ID with its scenes and outputs
 */
export async function getJob(
  userId: string,
  jobId: string
): Promise<{
  job: GenerationJob;
  scenes: Scene[];
  outputs: OutputAsset[];
} | null> {
  const [job] = await db
    .select()
    .from(generationJob)
    .where(
      and(eq(generationJob.id, jobId), eq(generationJob.userId, userId))
    )
    .limit(1);

  if (!job) return null;

  const scenes = await db
    .select()
    .from(scene)
    .where(eq(scene.jobId, jobId))
    .orderBy(scene.order);

  const outputs = await db
    .select()
    .from(outputAsset)
    .where(eq(outputAsset.jobId, jobId));

  return { job, scenes, outputs };
}

/**
 * Get user's recent jobs
 */
export async function getUserJobs(
  userId: string,
  limit = 20
): Promise<GenerationJob[]> {
  return db
    .select()
    .from(generationJob)
    .where(eq(generationJob.userId, userId))
    .orderBy(generationJob.createdAt)
    .limit(limit);
}

/**
 * Multi-scene video generation result
 */
export interface VideoGenerationResult {
  success: boolean;
  jobId?: string | undefined;
  outputs?: Array<{ sceneIndex: number; url: string }> | undefined;
  concatScript?: string | undefined;
  error?: string | undefined;
}

/**
 * Generate a UGC video with multiple scenes (Mode A)
 *
 * Flow:
 * 1. Validate user can generate
 * 2. Create job and scene records
 * 3. Generate each scene video with Veo
 * 4. Store outputs and generate concat script
 */
export async function generateUGCVideo(
  userId: string,
  request: ModeAGenerationRequest
): Promise<VideoGenerationResult> {
  try {
    // Validate scenes
    if (!request.scenes || request.scenes.length === 0) {
      return { success: false, error: "At least one scene is required" };
    }

    if (request.scenes.length > 5) {
      return { success: false, error: "Maximum 5 scenes allowed" };
    }

    // 1. Check if user can generate (with scene count for credit calculation)
    const canGenerate = await canUserGenerate(userId, "MODE_A", request.scenes.length, request.videoGenerator);
    if (!canGenerate.allowed) {
      return { success: false, error: canGenerate.error ?? "Cannot generate" };
    }

    // 2. Fetch the avatar
    const [avatarData] = await db
      .select()
      .from(avatar)
      .where(and(eq(avatar.id, request.avatarId), eq(avatar.userId, userId)))
      .limit(1);

    if (!avatarData) {
      return { success: false, error: "Avatar not found" };
    }

    // 3. Create the job record
    const aspectRatio = request.aspectRatio ?? "9:16";
    const [job] = await db
      .insert(generationJob)
      .values({
        userId,
        mode: "MODE_A",
        status: "PROCESSING",
        title: request.title ?? `UGC Video - ${avatarData.name}`,
        config: {
          aspectRatio,
          audioEnabled: request.audioEnabled ?? true,
        },
      })
      .returning();

    if (!job) {
      return { success: false, error: "Failed to create job" };
    }

    // 4. Create scene records
    const sceneRecords: Array<{
      id: string;
      order: number;
      script: string;
      type: string;
      action: string | undefined;
      setting: string | undefined;
      duration: number;
    }> = [];

    // Fetch product description if a product is selected
    let productDescription: string | undefined;
    if (request.productId) {
      const [productData] = await db
        .select()
        .from(productAsset)
        .where(and(eq(productAsset.id, request.productId), eq(productAsset.userId, userId)))
        .limit(1);
      if (productData) {
        productDescription = productData.description ?? productData.name;
      }
    }

    // Fetch reference image if selected
    let referenceImageData: { imageUrl: string; name: string } | null = null;
    if (request.referenceImageId) {
      const [fetchedRef] = await db
        .select()
        .from(referenceImage)
        .where(and(eq(referenceImage.id, request.referenceImageId), eq(referenceImage.userId, userId)))
        .limit(1);
      if (fetchedRef) {
        referenceImageData = fetchedRef;
      }
    }

    for (let i = 0; i < request.scenes.length; i++) {
      const sceneConfig = request.scenes[i];
      if (!sceneConfig) continue;

      const [sceneRecord] = await db
        .insert(scene)
        .values({
          jobId: job.id,
          order: i + 1,
          avatarId: sceneConfig.avatarId ?? request.avatarId,
          productId: sceneConfig.productId ?? request.productId,
          prompt: sceneConfig.script,
          script: sceneConfig.script,
          action: sceneConfig.action,
          setting: sceneConfig.setting,
          duration: sceneConfig.duration,
          status: "PENDING",
        })
        .returning();

      if (sceneRecord) {
        sceneRecords.push({
          id: sceneRecord.id,
          order: i + 1,
          script: sceneConfig.script,
          type: sceneConfig.type,
          action: sceneConfig.action,
          setting: sceneConfig.setting,
          duration: sceneConfig.duration,
        });
      }
    }

        // 5. Process each scene
        const outputs: Array<{ sceneIndex: number; url: string }> = [];
        let hasError = false;

        for (const sceneRecord of sceneRecords) {
            // Update scene to PROCESSING
            await db
                .update(scene)
                .set({ status: "PROCESSING" })
                .where(eq(scene.id, sceneRecord.id));

            try {
                // Build the video prompt with avatar description
                const videoPrompt = buildUGCVideoPrompt({
                    script: sceneRecord.script,
                    avatarDescription: avatarData.description ?? undefined,
                    action: sceneRecord.action,
                    productDescription,
                    sceneType: sceneRecord.type as "hook" | "demo" | "cta" | "custom",
                    setting: sceneRecord.setting,
                });

                // Build reference images array
                const referenceImages: Array<{ url: string; type: "avatar" | "product" | "reference" }> = [
                    {
                        url: avatarData.referenceImageUrl,
                        type: "avatar" as const,
                    },
                ];

                // Add product reference if present
                if (request.productId) {
                    const [productData] = await db
                        .select({ imageUrl: productAsset.imageUrl })
                        .from(productAsset)
                        .where(eq(productAsset.id, request.productId))
                        .limit(1);
                    if (productData) {
                        referenceImages.push({
                            url: productData.imageUrl,
                            type: "product" as const,
                        });
                    }
                }

                // Add reference image if present
                if (referenceImageData) {
                    referenceImages.push({
                        url: referenceImageData.imageUrl,
                        type: "reference" as const,
                    });
                }

                // Generate the video
                const videoGenerator = request.videoGenerator || "veo";
                const result = await generateVideoWithProvider(
                    videoGenerator,
                    {
                        prompt: videoPrompt,
                        referenceImages,
                        aspectRatio: aspectRatio as "16:9" | "9:16" | "1:1",
                        duration: sceneRecord.duration as 5 | 6 | 8,
                        audioEnabled: request.audioEnabled ?? true,
                    },
                    (status, attempt) => {
                        console.log(`Scene ${sceneRecord.order}: ${status} (attempt ${attempt})`);
                    }
                );

        if (result.status !== "COMPLETED" || !result.videoData) {
          // Mark scene as failed
          await db
            .update(scene)
            .set({
              status: "FAILED",
              errorMessage: result.error ?? "Video generation failed",
            })
            .where(eq(scene.id, sceneRecord.id));
          hasError = true;
          continue;
        }

        // Upload the video
        const timestamp = Date.now();
        const filename = `mode-a-${job.id}-scene-${sceneRecord.order}-${timestamp}.mp4`;
        const uploadResult = await upload(result.videoData, filename, "outputs");

        // Create output record
        const [output] = await db
          .insert(outputAsset)
          .values({
            jobId: job.id,
            sceneId: sceneRecord.id,
            type: "VIDEO",
            url: uploadResult.url,
            durationSeconds: sceneRecord.duration,
            metadata: {
              format: result.mimeType ?? "video/mp4",
            },
          })
          .returning();

        if (output) {
          outputs.push({
            sceneIndex: sceneRecord.order,
            url: output.url,
          });
        }

        // Mark scene as completed
        await db
          .update(scene)
          .set({ status: "COMPLETED" })
          .where(eq(scene.id, sceneRecord.id));
      } catch (error) {
        console.error(`Scene ${sceneRecord.order} generation error:`, error);
        await db
          .update(scene)
          .set({
            status: "FAILED",
            errorMessage: error instanceof Error ? error.message : "Unknown error",
          })
          .where(eq(scene.id, sceneRecord.id));
        hasError = true;
      }
    }

    // 6. Update job status
    const finalStatus = hasError
      ? outputs.length > 0
        ? "COMPLETED" // Partial success
        : "FAILED"
      : "COMPLETED";

    await db
      .update(generationJob)
      .set({
        status: finalStatus,
        completedAt: new Date(),
        errorMessage: hasError ? "Some scenes failed to generate" : null,
      })
      .where(eq(generationJob.id, job.id));

    // 7. Deduct credits based on successful scene generations
    if (outputs.length > 0) {
      await deductCredits(userId, "MODE_A", outputs.length, request.videoGenerator);
    }

    // 8. Generate concat script if we have multiple outputs
    let concatScript: string | undefined;
    if (outputs.length > 1) {
      const sortedUrls = outputs
        .sort((a, b) => a.sceneIndex - b.sceneIndex)
        .map((o) => o.url);
      concatScript = generateConcatScript(sortedUrls);
    }

    return {
      success: outputs.length > 0,
      jobId: job.id,
      outputs,
      concatScript,
      error: hasError && outputs.length === 0 ? "All scenes failed to generate" : undefined,
    };
  } catch (error) {
    console.error("UGC video generation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Generation failed",
    };
  }
}

/**
 * Generate a product video with multiple scenes (Mode C)
 *
 * Flow:
 * 1. Validate user can generate
 * 2. Fetch product (and optionally avatar)
 * 3. Create job and scene records
 * 4. Generate each scene video with Veo
 * 5. Store outputs and generate concat script
 */
export async function generateProductVideo(
  userId: string,
  request: ModeCGenerationRequest
): Promise<VideoGenerationResult> {
  try {
    // Validate scenes
    if (!request.scenes || request.scenes.length === 0) {
      return { success: false, error: "At least one scene is required" };
    }

    if (request.scenes.length > 5) {
      return { success: false, error: "Maximum 5 scenes allowed" };
    }

    // 1. Check if user can generate (with scene count for credit calculation)
    const canGenerate = await canUserGenerate(userId, "MODE_C", request.scenes.length, request.videoGenerator);
    if (!canGenerate.allowed) {
      return { success: false, error: canGenerate.error ?? "Cannot generate" };
    }

    // 2. Fetch the product
    const [productData] = await db
      .select()
      .from(productAsset)
      .where(and(eq(productAsset.id, request.productId), eq(productAsset.userId, userId)))
      .limit(1);

    if (!productData) {
      return { success: false, error: "Product not found" };
    }

    // 3. Optionally fetch avatar if provided
    let avatarData: { name: string; description: string | null; referenceImageUrl: string } | null = null;
    if (request.avatarId) {
      const [fetchedAvatar] = await db
        .select()
        .from(avatar)
        .where(and(eq(avatar.id, request.avatarId), eq(avatar.userId, userId)))
        .limit(1);

      if (fetchedAvatar) {
        avatarData = fetchedAvatar;
      }
    }

    // Fetch reference image if selected
    let referenceImageData: { imageUrl: string; name: string } | null = null;
    if (request.referenceImageId) {
      const [fetchedRef] = await db
        .select()
        .from(referenceImage)
        .where(and(eq(referenceImage.id, request.referenceImageId), eq(referenceImage.userId, userId)))
        .limit(1);
      if (fetchedRef) {
        referenceImageData = fetchedRef;
      }
    }

    // 4. Create the job record
    const aspectRatio = request.aspectRatio ?? "9:16";
    const [job] = await db
      .insert(generationJob)
      .values({
        userId,
        mode: "MODE_C",
        status: "PROCESSING",
        title: request.title ?? `Product Video - ${productData.name}`,
        config: {
          aspectRatio,
          audioEnabled: request.audioEnabled ?? true,
        },
      })
      .returning();

    if (!job) {
      return { success: false, error: "Failed to create job" };
    }

    // 5. Create scene records
    const sceneRecords: Array<{
      id: string;
      order: number;
      action: ProductAction;
      script: string | undefined;
      duration: number;
      setting: string | undefined;
    }> = [];

    for (let i = 0; i < request.scenes.length; i++) {
      const sceneConfig = request.scenes[i];
      if (!sceneConfig) continue;

      const [sceneRecord] = await db
        .insert(scene)
        .values({
          jobId: job.id,
          order: i + 1,
          avatarId: request.avatarId,
          productId: request.productId,
          prompt: sceneConfig.script ?? `${sceneConfig.action} action for ${productData.name}`,
          script: sceneConfig.script,
          duration: sceneConfig.duration,
          status: "PENDING",
        })
        .returning();

      if (sceneRecord) {
        sceneRecords.push({
          id: sceneRecord.id,
          order: i + 1,
          action: sceneConfig.action,
          script: sceneConfig.script,
          duration: sceneConfig.duration,
          setting: sceneConfig.setting,
        });
      }
    }

    // 6. Process each scene
    const outputs: Array<{ sceneIndex: number; url: string }> = [];
    let hasError = false;

    for (const sceneRecord of sceneRecords) {
      // Update scene to PROCESSING
      await db
        .update(scene)
        .set({ status: "PROCESSING" })
        .where(eq(scene.id, sceneRecord.id));

      try {
        // Build the video prompt
        const videoPrompt = buildProductVideoPrompt({
          productName: productData.name,
          productDescription: productData.description ?? undefined,
          action: sceneRecord.action,
          script: sceneRecord.script,
          includeAvatar: !!avatarData,
          avatarDescription: avatarData?.description ?? avatarData?.name,
          setting: sceneRecord.setting,
        });

        // Build reference images array
        const referenceImages: Array<{ url: string; type: "avatar" | "product" | "reference" }> = [
          {
            url: productData.imageUrl,
            type: "product" as const,
          },
        ];

        // Add avatar reference if present
        if (avatarData) {
          referenceImages.push({
            url: avatarData.referenceImageUrl,
            type: "avatar" as const,
          });
        }

        // Add reference image if present
        if (referenceImageData) {
          referenceImages.push({
            url: referenceImageData.imageUrl,
            type: "reference" as const,
          });
        }

        // Generate the video
        const videoGenerator = request.videoGenerator || "veo";
        const result = await generateVideoWithProvider(
          videoGenerator,
          {
            prompt: videoPrompt,
            referenceImages,
            aspectRatio: aspectRatio as "16:9" | "9:16" | "1:1",
            duration: sceneRecord.duration as 5 | 6 | 8,
            audioEnabled: request.audioEnabled ?? true,
          },
          (status, attempt) => {
            console.log(`Scene ${sceneRecord.order}: ${status} (attempt ${attempt})`);
          }
        );

        if (result.status !== "COMPLETED" || !result.videoData) {
          // Mark scene as failed
          await db
            .update(scene)
            .set({
              status: "FAILED",
              errorMessage: result.error ?? "Video generation failed",
            })
            .where(eq(scene.id, sceneRecord.id));
          hasError = true;
          continue;
        }

        // Upload the video
        const timestamp = Date.now();
        const filename = `mode-c-${job.id}-scene-${sceneRecord.order}-${timestamp}.mp4`;
        const uploadResult = await upload(result.videoData, filename, "outputs");

        // Create output record
        const [output] = await db
          .insert(outputAsset)
          .values({
            jobId: job.id,
            sceneId: sceneRecord.id,
            type: "VIDEO",
            url: uploadResult.url,
            durationSeconds: sceneRecord.duration,
            metadata: {
              format: result.mimeType ?? "video/mp4",
            },
          })
          .returning();

        if (output) {
          outputs.push({
            sceneIndex: sceneRecord.order,
            url: output.url,
          });
        }

        // Mark scene as completed
        await db
          .update(scene)
          .set({ status: "COMPLETED" })
          .where(eq(scene.id, sceneRecord.id));
      } catch (error) {
        console.error(`Scene ${sceneRecord.order} generation error:`, error);
        await db
          .update(scene)
          .set({
            status: "FAILED",
            errorMessage: error instanceof Error ? error.message : "Unknown error",
          })
          .where(eq(scene.id, sceneRecord.id));
        hasError = true;
      }
    }

    // 7. Update job status
    const finalStatus = hasError
      ? outputs.length > 0
        ? "COMPLETED" // Partial success
        : "FAILED"
      : "COMPLETED";

    await db
      .update(generationJob)
      .set({
        status: finalStatus,
        completedAt: new Date(),
        errorMessage: hasError ? "Some scenes failed to generate" : null,
      })
      .where(eq(generationJob.id, job.id));

    // 8. Deduct credits based on successful scene generations
    if (outputs.length > 0) {
      await deductCredits(userId, "MODE_C", outputs.length, request.videoGenerator);
    }

    // 9. Generate concat script if we have multiple outputs
    let concatScript: string | undefined;
    if (outputs.length > 1) {
      const sortedUrls = outputs
        .sort((a, b) => a.sceneIndex - b.sceneIndex)
        .map((o) => o.url);
      concatScript = generateConcatScript(sortedUrls);
    }

    return {
      success: outputs.length > 0,
      jobId: job.id,
      outputs,
      concatScript,
      error: hasError && outputs.length === 0 ? "All scenes failed to generate" : undefined,
    };
  } catch (error) {
    console.error("Product video generation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Generation failed",
    };
  }
}
