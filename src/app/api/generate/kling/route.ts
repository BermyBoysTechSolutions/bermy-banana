import { NextRequest, NextResponse } from 'next/server';
import { createKlingProvider } from '@/lib/providers/kling';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { user } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

/**
 * Kling AI Video Generation API
 * Supports both Standard (150 credits) and Pro (300 credits) tiers
 */

// Request validation schemas
const generateSchema = z.object({
  prompt: z.string().min(10).max(1000),
  duration: z.number().min(5).max(10).optional(),
  aspectRatio: z.enum(['9:16', '16:9']).optional(),
  tier: z.enum(['standard', 'pro']).default('standard'),
});

/**
 * POST /api/generate/kling
 * Start Kling video generation
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const validation = generateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error },
        { status: 400 }
      );
    }

    const { prompt, duration = 7, aspectRatio = '9:16', tier } = validation.data;

    // Check user credits
    const userResult = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);
    const userRecord = userResult[0];
    
    if (!userRecord) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const creditsRequired = tier === 'pro' ? 300 : 150;
    if (userRecord.creditsRemaining < creditsRequired) {
      return NextResponse.json(
        { error: 'Insufficient credits', required: creditsRequired, available: userRecord.creditsRemaining },
        { status: 402 }
      );
    }

    // Create Kling provider
    const provider = createKlingProvider();

    // Start generation
    const { taskId, creditsUsed } = await provider.generate({
      prompt,
      duration,
      aspectRatio,
      tier,
    });

    // Deduct credits immediately
    await db.update(user)
      .set({ creditsRemaining: userRecord.creditsRemaining - creditsUsed })
      .where(eq(user.id, session.user.id));

    return NextResponse.json({
      success: true,
      taskId,
      creditsUsed,
      estimatedTime: '2-5 minutes',
      statusUrl: `/api/generate/kling?taskId=${taskId}`,
      provider: 'kling',
      tier,
    });

  } catch (error) {
    console.error('Kling generate error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/generate/kling?taskId=xxx
 * Poll for task status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'taskId parameter required' },
        { status: 400 }
      );
    }

    const provider = createKlingProvider();
    const statusUpdates = [];

    // Poll for status
    for await (const update of provider.poll(taskId)) {
      statusUpdates.push(update);
      
      if (update.status === 'completed' || update.status === 'failed') {
        break;
      }
    }

    const finalStatus = statusUpdates[statusUpdates.length - 1];

    if (!finalStatus) {
      return NextResponse.json({
        success: true,
        taskId,
        status: 'pending',
        progress: 0,
        resultUrl: null,
        error: null,
        updates: statusUpdates,
      });
    }

    return NextResponse.json({
      success: true,
      taskId,
      status: finalStatus.status,
      progress: finalStatus.progress,
      resultUrl: finalStatus.resultUrl,
      error: finalStatus.error,
      updates: statusUpdates,
    });

  } catch (error) {
    console.error('Kling poll error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}