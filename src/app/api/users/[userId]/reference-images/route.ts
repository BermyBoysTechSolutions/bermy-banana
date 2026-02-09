import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { referenceImages, outputAsset, generationJob, user } from '@/lib/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

/**
 * GET /api/users/:userId/reference-images
 * Get user's reference images
 * 
 * Query params:
 * - isAvatar: boolean (filter by avatar images only)
 * - limit: number (default: 50, max: 100)
 * - offset: number (default: 0)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { userId } = params;
    const { searchParams } = new URL(request.url);
    const isAvatar = searchParams.get('isAvatar') === 'true';
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100);
    const offset = Number(searchParams.get('offset')) || 0;

    // Users can only view their own reference images unless they're admins
    if (session.user.id !== userId) {
      // Check if user is admin
      const [userData] = await db
        .select({ role: user.role })
        .from(user)
        .where(eq(user.id, session.user.id))
        .limit(1);
      
      if (userData?.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    // Build query conditions
    const conditions = [eq(referenceImages.userId, userId)];
    if (isAvatar) {
      conditions.push(eq(referenceImages.isAvatar, true));
    }

    // Get reference images with output details
    const images = await db
      .select({
        id: referenceImages.id,
        imageUrl: referenceImages.imageUrl,
        isAvatar: referenceImages.isAvatar,
        createdAt: referenceImages.createdAt,
        outputId: referenceImages.outputId,
        outputType: outputAsset.type,
        jobId: outputAsset.jobId,
        jobMode: generationJob.mode,
        jobTitle: generationJob.title,
      })
      .from(referenceImages)
      .leftJoin(outputAsset, eq(referenceImages.outputId, outputAsset.id))
      .leftJoin(generationJob, eq(outputAsset.jobId, generationJob.id))
      .where(and(...conditions))
      .orderBy(desc(referenceImages.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [countResult] = await db
      .select({ count: sql`count(*)` })
      .from(referenceImages)
      .where(and(...conditions));

    const totalCount = Number(countResult?.count || 0);

    return NextResponse.json({
      images,
      totalCount,
      limit,
      offset,
      hasMore: offset + images.length < totalCount,
    });
  } catch (error) {
    console.error('Error fetching reference images:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}