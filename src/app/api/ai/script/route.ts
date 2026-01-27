import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";

type ScriptType = "hook" | "demo" | "cta" | "full";

interface ScriptRequest {
  type: ScriptType;
  productName?: string;
  productDescription?: string;
  targetAudience?: string;
  tone?: "casual" | "professional" | "energetic" | "friendly";
  duration?: number; // seconds
  existingHook?: string; // For generating demo/cta that follows a hook
}

interface ScriptResponse {
  scripts: string[];
  type: ScriptType;
}

/**
 * POST /api/ai/script - Generate script variants using OpenRouter
 *
 * Body:
 * - type: "hook" | "demo" | "cta" | "full"
 * - productName: string (optional)
 * - productDescription: string (optional)
 * - targetAudience: string (optional)
 * - tone: "casual" | "professional" | "energetic" | "friendly" (optional)
 * - duration: number in seconds (optional, default 6)
 * - existingHook: string (optional, for generating follow-up scenes)
 */
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if OpenRouter is configured
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "Script Assistant is not configured" },
        { status: 503 }
      );
    }

    const body = (await request.json()) as ScriptRequest;
    const {
      type,
      productName,
      productDescription,
      targetAudience,
      tone = "casual",
      duration = 6,
      existingHook,
    } = body;

    // Validate type
    if (!type || !["hook", "demo", "cta", "full"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid script type" },
        { status: 400 }
      );
    }

    // Build the prompt based on type
    const prompt = buildScriptPrompt({
      type,
      productName,
      productDescription,
      targetAudience,
      tone,
      duration,
      existingHook,
    });

    // Generate scripts using OpenRouter
    const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

    const result = await generateText({
      model: openrouter(model),
      prompt,
      maxOutputTokens: 1000,
    });

    // Parse the response to extract script variants
    const scripts = parseScriptResponse(result.text, type);

    return NextResponse.json({
      scripts,
      type,
    } as ScriptResponse);
  } catch (error) {
    console.error("Script generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate scripts" },
      { status: 500 }
    );
  }
}

function buildScriptPrompt(options: {
  type: ScriptType;
  productName?: string | undefined;
  productDescription?: string | undefined;
  targetAudience?: string | undefined;
  tone: string;
  duration: number;
  existingHook?: string | undefined;
}): string {
  const {
    type,
    productName,
    productDescription,
    targetAudience,
    tone,
    duration,
    existingHook,
  } = options;

  const wordsPerSecond = 2.5; // Average speaking rate
  const targetWords = Math.round(duration * wordsPerSecond);

  let baseContext = `You are a UGC (User-Generated Content) script writer for social media ads (TikTok, Instagram Reels).

Write scripts that:
- Are spoken directly to camera in first person
- Feel authentic and natural, not salesy
- Are exactly around ${targetWords} words (${duration} seconds when spoken)
- Use a ${tone} tone

`;

  if (productName) {
    baseContext += `Product: ${productName}\n`;
  }
  if (productDescription) {
    baseContext += `Product Description: ${productDescription}\n`;
  }
  if (targetAudience) {
    baseContext += `Target Audience: ${targetAudience}\n`;
  }

  let specificInstructions = "";

  switch (type) {
    case "hook":
      specificInstructions = `
Generate 3 different HOOK scripts. Hooks are the first 2-3 seconds that grab attention.

Great hooks:
- Start with a question, bold statement, or relatable problem
- Create curiosity or FOMO
- Stop the scroll immediately

Examples of hook styles:
- "Wait, you need to see this..."
- "POV: You just found the solution to..."
- "I can't believe I didn't know about this sooner"
- "Stop scrolling if you struggle with..."

Format your response as:
HOOK 1:
[script text]

HOOK 2:
[script text]

HOOK 3:
[script text]`;
      break;

    case "demo":
      specificInstructions = `
Generate 3 different DEMO scripts. Demos show the product in action and explain benefits.

${existingHook ? `This follows the hook: "${existingHook}"` : ""}

Great demos:
- Show, don't just tell
- Focus on benefits, not features
- Be specific and authentic
- Include a personal experience or result

Format your response as:
DEMO 1:
[script text]

DEMO 2:
[script text]

DEMO 3:
[script text]`;
      break;

    case "cta":
      specificInstructions = `
Generate 3 different CTA (Call-to-Action) scripts. CTAs tell viewers what to do next.

${existingHook ? `This follows content about: "${existingHook}"` : ""}

Great CTAs:
- Create urgency without being pushy
- Be specific about the action
- Remind them of the benefit
- Feel natural, not salesy

Format your response as:
CTA 1:
[script text]

CTA 2:
[script text]

CTA 3:
[script text]`;
      break;

    case "full":
      specificInstructions = `
Generate 3 different FULL scripts with Hook → Demo → CTA structure.

Each script should have:
- Hook (2-3 seconds): Grab attention
- Demo (${duration - 4} seconds): Show product/benefit
- CTA (2 seconds): Tell them what to do

Format your response as:
SCRIPT 1:
[Hook]
[Demo]
[CTA]

SCRIPT 2:
[Hook]
[Demo]
[CTA]

SCRIPT 3:
[Hook]
[Demo]
[CTA]`;
      break;
  }

  return baseContext + specificInstructions;
}

function parseScriptResponse(text: string, _type: ScriptType): string[] {
  const scripts: string[] = [];

  // Try to extract numbered scripts
  const patterns = [
    /(?:HOOK|DEMO|CTA|SCRIPT)\s*\d+:\s*\n?([\s\S]*?)(?=(?:HOOK|DEMO|CTA|SCRIPT)\s*\d+:|$)/gi,
    /\d+[.)]\s*([\s\S]*?)(?=\d+[.)]|$)/g,
  ];

  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const script = match[1]?.trim();
      if (script && script.length > 10) {
        scripts.push(script);
      }
    }
    if (scripts.length >= 3) break;
  }

  // If we couldn't parse, split by double newlines
  if (scripts.length === 0) {
    const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 20);
    scripts.push(...paragraphs.slice(0, 3));
  }

  // Ensure we have at least one script
  if (scripts.length === 0) {
    scripts.push(text.trim());
  }

  return scripts.slice(0, 3);
}
