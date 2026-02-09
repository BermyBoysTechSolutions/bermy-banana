import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { outputAsset, generationJob } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { transaction, PersistenceTransaction } from '@/lib/services/db-transaction';

/**
 * DELETE /api/outputs/:id
 * Soft delete an output (set is_removed = true)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Use transaction for atomic operation
    await transaction(async (tx) => {
      await PersistenceTransaction.softDeleteOutput(tx, id, session.user.id);
    });

    return NextResponse.json({
      success: true,
      message: 'Output deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting output:', error);
    
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