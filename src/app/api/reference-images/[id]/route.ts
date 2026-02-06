import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { referenceImage } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { del } from "@vercel/blob";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/reference-images/[id] - Get a specific reference image
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [image] = await db
      .select()
      .from(referenceImage)
      .where(
        and(
          eq(referenceImage.id, id),
          eq(referenceImage.userId, session.user.id)
        )
      )
      .limit(1);

    if (!image) {
      return NextResponse.json(
        { error: "Reference image not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ image });
  } catch (error) {
    console.error("Failed to fetch reference image:", error);
    return NextResponse.json(
      { error: "Failed to fetch reference image" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/reference-images/[id] - Update reference image metadata
 *
 * Body (JSON):
 * - name: string (optional) - New name for the image
 * - description: string (optional) - New description
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const [existing] = await db
      .select()
      .from(referenceImage)
      .where(
        and(
          eq(referenceImage.id, id),
          eq(referenceImage.userId, session.user.id)
        )
      )
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Reference image not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updates: Partial<{ name: string; description: string }> = {};

    if (body.name !== undefined) {
      updates.name = body.name;
    }
    if (body.description !== undefined) {
      updates.description = body.description;
    }

    const [updated] = await db
      .update(referenceImage)
      .set(updates)
      .where(eq(referenceImage.id, id))
      .returning();

    return NextResponse.json({ image: updated });
  } catch (error) {
    console.error("Failed to update reference image:", error);
    return NextResponse.json(
      { error: "Failed to update reference image" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reference-images/[id] - Delete a reference image
 */
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership and get image URL
    const [existing] = await db
      .select()
      .from(referenceImage)
      .where(
        and(
          eq(referenceImage.id, id),
          eq(referenceImage.userId, session.user.id)
        )
      )
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Reference image not found" },
        { status: 404 }
      );
    }

    // Delete from Vercel Blob if using blob storage
    if (existing.imageUrl.includes("blob.vercel-storage.com")) {
      try {
        await del(existing.imageUrl);
      } catch (err) {
        console.error("Failed to delete from blob storage:", err);
        // Continue with DB deletion even if blob deletion fails
      }
    }

    // Delete from database
    await db.delete(referenceImage).where(eq(referenceImage.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete reference image:", error);
    return NextResponse.json(
      { error: "Failed to delete reference image" },
      { status: 500 }
    );
  }
}