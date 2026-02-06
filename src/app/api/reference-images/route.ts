import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { referenceImage } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { put } from "@vercel/blob";

/**
 * GET /api/reference-images - List user's reference images
 */
export async function GET() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const images = await db
      .select()
      .from(referenceImage)
      .where(eq(referenceImage.userId, session.user.id))
      .orderBy(desc(referenceImage.createdAt));

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Failed to fetch reference images:", error);
    return NextResponse.json(
      { error: "Failed to fetch reference images" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reference-images - Upload a new reference image
 *
 * Body (multipart/form-data):
 * - file: File (required) - The image file to upload
 * - name: string (required) - Name for the reference image
 * - description: string (optional) - Description of the image
 */
export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const name = formData.get("name") as string | null;
    const description = formData.get("description") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, GIF, WebP" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB" },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const timestamp = Date.now();
    const sanitizedName = name.replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase();
    const filename = `reference-${session.user.id}-${timestamp}-${sanitizedName}.${file.name.split(".").pop()}`;

    const blob = await put(filename, buffer, {
      access: "public",
      contentType: file.type,
    });

    // Create database record
    const [image] = await db
      .insert(referenceImage)
      .values({
        userId: session.user.id,
        name,
        description: description ?? undefined,
        imageUrl: blob.url,
        metadata: {
          format: file.type,
        },
      })
      .returning();

    return NextResponse.json({ image }, { status: 201 });
  } catch (error) {
    console.error("Failed to upload reference image:", error);
    return NextResponse.json(
      { error: "Failed to upload reference image" },
      { status: 500 }
    );
  }
}