import { db } from '@/lib/db';

/**
 * Execute database operations within a transaction
 */
export async function transaction<T>(
  operations: (tx: typeof db) => Promise<T>
): Promise<T> {
  return await db.transaction(operations);
}

/**
 * Transaction helpers for specific operations
 */
export class PersistenceTransaction {
  /**
   * Mark an output as persistent with atomic operation
   */
  static async persistOutput(
    tx: typeof db,
    outputId: string,
    userId: string,
    persistUntil?: string
  ) {
    // First verify ownership
    const [output] = await tx
      .select({
        id: outputAsset.id,
        jobId: outputAsset.jobId,
      })
      .from(outputAsset)
      .innerJoin(generationJob, eq(outputAsset.jobId, generationJob.id))
      .where(
        and(
          eq(outputAsset.id, outputId),
          eq(generationJob.userId, userId)
        )
      )
      .limit(1);

    if (!output) {
      throw new Error('Output not found or access denied');
    }

    // Update with persistence data
    const [updatedOutput] = await tx
      .update(outputAsset)
      .set({
        persistUntil: persistUntil ? new Date(persistUntil) : null,
        isRemoved: false,
      })
      .where(eq(outputAsset.id, outputId))
      .returning();

    return updatedOutput;
  }

  /**
   * Save output as avatar with atomic operation
   */
  static async saveOutputAsAvatar(
    tx: typeof db,
    outputId: string,
    userId: string
  ) {
    // First verify ownership and that it's an image
    const [output] = await tx
      .select({
        id: outputAsset.id,
        url: outputAsset.url,
        type: outputAsset.type,
        jobId: outputAsset.jobId,
      })
      .from(outputAsset)
      .innerJoin(generationJob, eq(outputAsset.jobId, generationJob.id))
      .where(
        and(
          eq(outputAsset.id, outputId),
          eq(generationJob.userId, userId)
        )
      )
      .limit(1);

    if (!output) {
      throw new Error('Output not found or access denied');
    }

    if (output.type !== 'IMAGE') {
      throw new Error('Only image outputs can be saved as avatars');
    }

    // Create reference image entry
    const [referenceImage] = await tx
      .insert(referenceImages)
      .values({
        userId,
        outputId,
        imageUrl: output.url,
        isAvatar: true,
      })
      .returning();

    return referenceImage;
  }

  /**
   * Soft delete output with atomic operation
   */
  static async softDeleteOutput(
    tx: typeof db,
    outputId: string,
    userId: string
  ) {
    // First verify ownership
    const [output] = await tx
      .select({
        id: outputAsset.id,
      })
      .from(outputAsset)
      .innerJoin(generationJob, eq(outputAsset.jobId, generationJob.id))
      .where(
        and(
          eq(outputAsset.id, outputId),
          eq(generationJob.userId, userId)
        )
      )
      .limit(1);

    if (!output) {
      throw new Error('Output not found or access denied');
    }

    // Soft delete the output
    await tx
      .update(outputAsset)
      .set({
        isRemoved: true,
      })
      .where(eq(outputAsset.id, outputId));

    return true;
  }
}