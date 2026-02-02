import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { avatar } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { deleteFile } from "@/lib/storage";
import { isValidUUID } from "@/lib/validation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/avatars/[id] - Get a single avatar by ID
 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid avatar ID" }, { status: 400 });
    }

    const [foundAvatar] = await db
      .select()
      .from(avatar)
      .where(and(eq(avatar.id, id), eq(avatar.userId, session.user.id)))
      .limit(1);

    if (!foundAvatar) {
      return NextResponse.json({ error: "Avatar not found" }, { status: 404 });
    }

    return NextResponse.json({ avatar: foundAvatar });
  } catch (error) {
    console.error("Error fetching avatar:", error);
    return NextResponse.json(
      { error: "Failed to fetch avatar" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/avatars/[id] - Update an avatar
 * Body (JSON):
 * - name: string (optional)
 * - description: string (optional) - Detailed description for video generation
 */
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid avatar ID" }, { status: 400 });
    }

    const body = await request.json();

    // Check if avatar exists and belongs to user
    const [existingAvatar] = await db
      .select()
      .from(avatar)
      .where(and(eq(avatar.id, id), eq(avatar.userId, session.user.id)))
      .limit(1);

    if (!existingAvatar) {
      return NextResponse.json({ error: "Avatar not found" }, { status: 404 });
    }

    // Build update object
    const updates: { name?: string; description?: string | null } = {};
    if (body.name !== undefined) {
      updates.name = body.name.trim();
    }
    if (body.description !== undefined) {
      updates.description = body.description?.trim() || null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // Update the avatar
    const [updatedAvatar] = await db
      .update(avatar)
      .set(updates)
      .where(and(eq(avatar.id, id), eq(avatar.userId, session.user.id)))
      .returning();

    return NextResponse.json({ avatar: updatedAvatar });
  } catch (error) {
    console.error("Error updating avatar:", error);
    return NextResponse.json(
      { error: "Failed to update avatar" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/avatars/[id] - Delete an avatar
 * Also deletes the associated image from storage
 */
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    // Find the avatar first to get the image URL
    const [foundAvatar] = await db
      .select()
      .from(avatar)
      .where(and(eq(avatar.id, id), eq(avatar.userId, session.user.id)))
      .limit(1);

    if (!foundAvatar) {
      return NextResponse.json({ error: "Avatar not found" }, { status: 404 });
    }

    // Delete the image from storage
    try {
      await deleteFile(foundAvatar.referenceImageUrl);
    } catch (storageError) {
      console.error("Error deleting avatar image:", storageError);
      // Continue with deletion even if image deletion fails
    }

    // Delete the avatar record
    await db
      .delete(avatar)
      .where(and(eq(avatar.id, id), eq(avatar.userId, session.user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting avatar:", error);
    return NextResponse.json(
      { error: "Failed to delete avatar" },
      { status: 500 }
    );
  }
}
