import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { outputAsset, generationJob, user } from '@/lib/schema';
import { eq, and, desc, isNull, or, gt, sql } from 'drizzle-orm';

/**
 * GET /api/outputs/persistent
 * Get user's persistent outputs
 * 
 * Query params:
 * - limit: number (default: 50, max: 100)
 * - offset: number (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100);
    const offset = Number(searchParams.get('offset')) || 0;

    // Get persistent outputs (not removed and either has persist_until in future or null)
    const outputs = await db
      .select({
        id: outputAsset.id,
        type: outputAsset.type,
        url: outputAsset.url,
        thumbnailUrl: outputAsset.thumbnailUrl,
        durationSeconds: outputAsset.durationSeconds,
        metadata: outputAsset.metadata,
        persistUntil: outputAsset.persistUntil,
        createdAt: outputAsset.createdAt,
        jobId: outputAsset.jobId,
        jobMode: generationJob.mode,
        jobTitle: generationJob.title,
      })
      .from(outputAsset)
      .innerJoin(generationJob, eq(outputAsset.jobId, generationJob.id))
      .where(
        and(
          eq(generationJob.userId, session.user.id),
          eq(outputAsset.isRemoved, false),
          or(
            isNull(outputAsset.persistUntil),
            gt(outputAsset.persistUntil, new Date())
          )
        )
      )
      .orderBy(desc(outputAsset.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [countResult] = await db
      .select({ count: sql`count(*)` })
      .from(outputAsset)
      .innerJoin(generationJob, eq(outputAsset.jobId, generationJob.id))
      .where(
        and(
          eq(generationJob.userId, session.user.id),
          eq(outputAsset.isRemoved, false),
          or(
            isNull(outputAsset.persistUntil),
            gt(outputAsset.persistUntil, new Date())
          )
        )
      );

    const totalCount = Number(countResult?.count || 0);

    return NextResponse.json({
      outputs,
      totalCount,
      limit,
      offset,
      hasMore: offset + outputs.length < totalCount,
    });
  } catch (error) {
    console.error('Error fetching persistent outputs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}