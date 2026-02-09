import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { outputAsset, referenceImages, generationJob } from '@/lib/schema';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';
import { transaction } from '@/lib/services/db-transaction';

// Validation schemas
const persistOutputSchema = z.object({
  outputId: z.string().uuid(),
  persistUntil: z.string().datetime().optional(), // ISO datetime string
});

/**
 * POST /api/outputs/persist
 * Mark an output as persistent
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = persistOutputSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { outputId, persistUntil } = validation.data;

    // Use transaction for atomic operation
    const updatedOutput = await transaction(async (tx) => {
      return await PersistenceTransaction.persistOutput(
        tx,
        outputId,
        session.user.id,
        persistUntil
      );
    });

    return NextResponse.json({
      success: true,
      output: updatedOutput,
    });
  } catch (error) {
    console.error('Error persisting output:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found or access denied')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}