import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  generateInfluencerPhoto,
  generateUGCVideo,
  generateProductVideo,
  type SceneConfig,
  type ProductSceneConfig,
} from "@/lib/services/generation";
import { logGeneration } from "@/lib/services/audit";
import type { GenerationMode } from "@/lib/providers/types";

/**
 * POST /api/generate - Generate content based on mode
 *
 * Body (JSON):
 * - mode: "MODE_A" | "MODE_B" | "MODE_C" (required)
 * - avatarId: string (required for MODE_A, MODE_B; optional for MODE_C)
 * - productId: string (required for MODE_C; optional for MODE_A)
 * - prompt: string (required for MODE_B)
 * - scenes: SceneConfig[] (required for MODE_A)
 * - productScenes: ProductSceneConfig[] (required for MODE_C)
 * - title: string (optional)
 * - style: string (optional, for MODE_B)
 * - aspectRatio: string (optional)
 * - audioEnabled: boolean (optional, for MODE_A and MODE_C)
 */
export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      mode,
      avatarId,
      productId,
      referenceImageId,
      prompt,
      scenes,
      productScenes,
      title,
      style,
      aspectRatio,
      audioEnabled,
      videoGenerator,
    } = body as {
      mode: GenerationMode;
      avatarId?: string;
      productId?: string;
      referenceImageId?: string;
      prompt?: string;
      scenes?: SceneConfig[];
      productScenes?: ProductSceneConfig[];
      title?: string;
      style?: "casual" | "professional" | "lifestyle" | "selfie";
      aspectRatio?: string;
      audioEnabled?: boolean;
      videoGenerator?: "veo" | "kling-standard" | "kling-pro";
    };

    // Validate mode
    if (!mode || !["MODE_A", "MODE_B", "MODE_C"].includes(mode)) {
      return NextResponse.json(
        { error: "Invalid mode. Must be MODE_A, MODE_B, or MODE_C" },
        { status: 400 }
      );
    }

    // Validate aspect ratio if provided
    const validAspectRatios = ["16:9", "9:16", "1:1"];
    if (aspectRatio && !validAspectRatios.includes(aspectRatio)) {
      return NextResponse.json(
        { error: "Invalid aspect ratio. Must be 16:9, 9:16, or 1:1" },
        { status: 400 }
      );
    }

    // Get request metadata for audit logging
    const ipAddress = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    // Route to appropriate handler based on mode
    switch (mode) {
      case "MODE_A": {
        // UGC Video - requires avatar and scenes
        if (!avatarId) {
          return NextResponse.json(
            { error: "Avatar ID is required for Mode A" },
            { status: 400 }
          );
        }

        if (!scenes || scenes.length === 0) {
          return NextResponse.json(
            { error: "At least one scene is required for Mode A" },
            { status: 400 }
          );
        }

        // Validate scenes
        for (let i = 0; i < scenes.length; i++) {
          const currentScene = scenes[i];
          if (!currentScene) {
            return NextResponse.json(
              { error: `Scene ${i + 1} is missing` },
              { status: 400 }
            );
          }
          if (!currentScene.script || !currentScene.script.trim()) {
            return NextResponse.json(
              { error: `Scene ${i + 1} must have a script` },
              { status: 400 }
            );
          }
          if (!currentScene.type || !["hook", "demo", "cta", "custom"].includes(currentScene.type)) {
            return NextResponse.json(
              { error: `Scene ${i + 1} must have a valid type (hook, demo, cta, custom)` },
              { status: 400 }
            );
          }
          if (!currentScene.duration || ![5, 6, 8].includes(currentScene.duration)) {
            return NextResponse.json(
              { error: `Scene ${i + 1} must have a valid duration (5, 6, or 8 seconds)` },
              { status: 400 }
            );
          }
        }

        const result = await generateUGCVideo(session.user.id, {
          avatarId,
          productId,
          scenes,
          title,
          aspectRatio: (aspectRatio as "16:9" | "9:16" | "1:1") || "9:16",
          audioEnabled: audioEnabled ?? true,
          videoGenerator: videoGenerator || "veo",
          ...(referenceImageId ? { referenceImageId } : {}),
        });

        // Log the generation attempt
        if (result.jobId) {
          await logGeneration({
            userId: session.user.id,
            mode: "MODE_A",
            jobId: result.jobId,
            success: result.success,
            ipAddress,
            userAgent,
          });
        }

        if (!result.success) {
          const statusCode = result.error?.includes("approved")
            ? 403
            : result.error?.includes("quota")
              ? 429
              : 500;

          return NextResponse.json(
            { error: result.error, jobId: result.jobId },
            { status: statusCode }
          );
        }

        return NextResponse.json({
          success: true,
          jobId: result.jobId,
          outputs: result.outputs,
          concatScript: result.concatScript,
        });
      }

      case "MODE_B": {
        // Influencer Photo - requires avatar OR reference image, plus prompt
        if (!avatarId && !referenceImageId) {
          return NextResponse.json(
            { error: "Either Avatar ID or Reference Image ID is required for Mode B" },
            { status: 400 }
          );
        }

        if (!prompt || !prompt.trim()) {
          return NextResponse.json(
            { error: "Prompt is required for Mode B" },
            { status: 400 }
          );
        }

        const result = await generateInfluencerPhoto(session.user.id, {
          avatarId,
          prompt: prompt.trim(),
          style: style || "casual",
          aspectRatio: (aspectRatio as "9:16" | "16:9" | "1:1") || "9:16",
          ...(title ? { title } : {}),
          ...(productId ? { productId } : {}),
          ...(referenceImageId ? { referenceImageId } : {}),
        });

        // Log the generation attempt
        if (result.jobId) {
          await logGeneration({
            userId: session.user.id,
            mode: "MODE_B",
            jobId: result.jobId,
            success: result.success,
            ipAddress,
            userAgent,
          });
        }

        if (!result.success) {
          const statusCode = result.error?.includes("approved")
            ? 403
            : result.error?.includes("quota")
              ? 429
              : 500;

          return NextResponse.json(
            { error: result.error, jobId: result.jobId },
            { status: statusCode }
          );
        }

        return NextResponse.json({
          success: true,
          jobId: result.jobId,
          outputUrl: result.outputUrl,
        });
      }

      case "MODE_C": {
        // Product Video - requires product and scenes
        if (!productId) {
          return NextResponse.json(
            { error: "Product ID is required for Mode C" },
            { status: 400 }
          );
        }

        if (!productScenes || productScenes.length === 0) {
          return NextResponse.json(
            { error: "At least one scene is required for Mode C" },
            { status: 400 }
          );
        }

        // Validate product scenes
        const validActions = ["hold", "point", "use", "unbox", "demo"];
        for (let i = 0; i < productScenes.length; i++) {
          const currentScene = productScenes[i];
          if (!currentScene) {
            return NextResponse.json(
              { error: `Scene ${i + 1} is missing` },
              { status: 400 }
            );
          }
          if (!currentScene.action || !validActions.includes(currentScene.action)) {
            return NextResponse.json(
              { error: `Scene ${i + 1} must have a valid action (hold, point, use, unbox, demo)` },
              { status: 400 }
            );
          }
          if (!currentScene.duration || ![5, 6, 8].includes(currentScene.duration)) {
            return NextResponse.json(
              { error: `Scene ${i + 1} must have a valid duration (5, 6, or 8 seconds)` },
              { status: 400 }
            );
          }
        }

        const productResult = await generateProductVideo(session.user.id, {
          productId,
          avatarId,
          scenes: productScenes,
          title,
          aspectRatio: (aspectRatio as "16:9" | "9:16" | "1:1") || "9:16",
          audioEnabled: audioEnabled ?? true,
          videoGenerator: videoGenerator || "veo",
          ...(referenceImageId ? { referenceImageId } : {}),
        });

        // Log the generation attempt
        if (productResult.jobId) {
          await logGeneration({
            userId: session.user.id,
            mode: "MODE_C",
            jobId: productResult.jobId,
            success: productResult.success,
            ipAddress,
            userAgent,
          });
        }

        if (!productResult.success) {
          const statusCode = productResult.error?.includes("approved")
            ? 403
            : productResult.error?.includes("quota")
              ? 429
              : 500;

          return NextResponse.json(
            { error: productResult.error, jobId: productResult.jobId },
            { status: statusCode }
          );
        }

        return NextResponse.json({
          success: true,
          jobId: productResult.jobId,
          outputs: productResult.outputs,
          concatScript: productResult.concatScript,
        });
      }

      default:
        return NextResponse.json(
          { error: "Invalid mode" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Generation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
