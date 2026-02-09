import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { referenceImages, user } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

/**
 * DELETE /api/reference-images/:id
 * Remove a reference image
 */
export async function DELETE(
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

    // Verify the reference image belongs to the user
    const [image] = await db
      .select({
        id: referenceImages.id,
        userId: referenceImages.userId,
      })
      .from(referenceImages)
      .where(eq(referenceImages.id, id))
      .limit(1);

    if (!image) {
      return NextResponse.json(
        { error: 'Reference image not found' },
        { status: 404 }
      );
    }

    // Users can only delete their own reference images unless they're admins
    if (image.userId !== session.user.id) {
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

    // Delete the reference image
    await db
      .delete(referenceImages)
      .where(eq(referenceImages.id, id));

    return NextResponse.json({
      success: true,
      message: 'Reference image deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting reference image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}