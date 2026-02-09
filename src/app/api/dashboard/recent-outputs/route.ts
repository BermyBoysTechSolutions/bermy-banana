import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { outputAsset, generationJob, user } from '@/lib/schema';
import { eq, and, desc, gte, lte, like, or, isNull } from 'drizzle-orm';
import { z } from 'zod';

// Validation schemas for query parameters
const dashboardQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  modelType: z.enum(['MODE_A', 'MODE_B', 'MODE_C']).optional(),
  userEmail: z.string().email().optional(),
});

/**
 * GET /api/dashboard/recent-outputs
 * Get recent outputs with pagination and filters
 * For admin users only
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

    // Check if user is admin
    const [userData] = await db
      .select({ role: user.role })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);
    
    if (userData?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      limit: searchParams.get('limit') || '50',
      offset: searchParams.get('offset') || '0',
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      modelType: searchParams.get('modelType') || undefined,
      userEmail: searchParams.get('userEmail') || undefined,
    };

    const validation = dashboardQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { limit, offset, startDate, endDate, modelType, userEmail } = validation.data;

    // Build query conditions
    const conditions = [];
    
    if (startDate) {
      conditions.push(gte(outputAsset.createdAt, new Date(startDate)));
    }
    
    if (endDate) {
      conditions.push(lte(outputAsset.createdAt, new Date(endDate)));
    }
    
    if (modelType) {
      conditions.push(eq(generationJob.mode, modelType));
    }
    
    if (userEmail) {
      conditions.push(like(user.email, `%${userEmail}%`));
    }

    // Get recent outputs with user information
    const outputs = await db
      .select({
        id: outputAsset.id,
        type: outputAsset.type,
        url: outputAsset.url,
        thumbnailUrl: outputAsset.thumbnailUrl,
        durationSeconds: outputAsset.durationSeconds,
        metadata: outputAsset.metadata,
        persistUntil: outputAsset.persistUntil,
        isRemoved: outputAsset.isRemoved,
        createdAt: outputAsset.createdAt,
        jobId: outputAsset.jobId,
        jobMode: generationJob.mode,
        jobTitle: generationJob.title,
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
      })
      .from(outputAsset)
      .innerJoin(generationJob, eq(outputAsset.jobId, generationJob.id))
      .innerJoin(user, eq(generationJob.userId, user.id))
      .where(and(...conditions))
      .orderBy(desc(outputAsset.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [countResult] = await db
      .select({ count: sql`count(*)` })
      .from(outputAsset)
      .innerJoin(generationJob, eq(outputAsset.jobId, generationJob.id))
      .innerJoin(user, eq(generationJob.userId, user.id))
      .where(and(...conditions));

    const totalCount = Number(countResult?.count || 0);

    return NextResponse.json({
      outputs,
      totalCount,
      limit,
      offset,
      hasMore: offset + outputs.length < totalCount,
      filters: {
        startDate,
        endDate,
        modelType,
        userEmail,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard outputs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}