import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { outputAsset, generationJob, referenceImages } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { transaction, PersistenceTransaction } from '@/lib/services/db-transaction';

// Validation schemas
const saveAsAvatarSchema = z.object({
  outputId: z.string().uuid(),
});

/**
 * POST /api/outputs/:id/save-as-avatar
 * Save an output as avatar (creates a reference image entry)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Use transaction for atomic operation
    const referenceImage = await transaction(async (tx) => {
      return await PersistenceTransaction.saveOutputAsAvatar(
        tx,
        id,
        session.user.id
      );
    });

    return NextResponse.json({
      success: true,
      referenceImage,
    });
  } catch (error) {
    console.error('Error saving output as avatar:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found or access denied')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      if (error.message.includes('Only image outputs')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}