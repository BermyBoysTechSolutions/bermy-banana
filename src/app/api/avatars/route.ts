import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { avatar, user } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { upload } from "@/lib/storage";

/**
 * GET /api/avatars - List all avatars for the current user
 */
export async function GET() {
  console.log("[AVATAR_GET] Route handler started");
  try {
    console.log("[AVATAR_GET] Getting session...");
    const session = await auth.api.getSession({ headers: await headers() });
    console.log("[AVATAR_GET] Session result:", session ? "found" : "null");

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const avatars = await db
      .select()
      .from(avatar)
      .where(eq(avatar.userId, session.user.id))
      .orderBy(desc(avatar.createdAt));

    return NextResponse.json({ avatars });
  } catch (error) {
    console.error("[AVATAR_GET] ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch avatars" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/avatars - Create a new avatar
 * Requires: user.status === "APPROVED"
 *
 * Body (multipart/form-data):
 * - name: string (required)
 * - description: string (optional) - Detailed description of avatar's appearance
 * - image: File (required) - Reference image for the avatar
 * - metadata: JSON string (optional) - { gender?, ageRange?, ethnicity?, style? }
 */
export async function POST(request: Request) {
  console.log("[AVATAR_POST] ========== ROUTE HANDLER STARTED ==========");
  console.log("[AVATAR_POST] Request URL:", request.url);
  console.log("[AVATAR_POST] Request method:", request.method);
  
  try {
    console.log("[AVATAR_POST] Step 1: Getting headers...");
    const reqHeaders = await headers();
    console.log("[AVATAR_POST] Step 2: Headers retrieved, calling auth.api.getSession...");
    
    const session = await auth.api.getSession({ headers: reqHeaders });
    console.log("[AVATAR_POST] Step 3: Session result:", session ? `User ID: ${session.user.id}` : "null");

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check user approval status
    const [currentUser] = await db
      .select({ status: user.status })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (!currentUser || currentUser.status !== "APPROVED") {
      return NextResponse.json(
        {
          error: "Account not approved",
          message:
            "Your account must be approved by an admin before you can create avatars.",
        },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string | null;
    const imageFile = formData.get("image") as File | null;
    const metadataStr = formData.get("metadata") as string | null;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!imageFile) {
      return NextResponse.json(
        { error: "Image is required" },
        { status: 400 }
      );
    }

    // Upload the image
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    const timestamp = Date.now();
    const sanitizedName = name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const ext = imageFile.name.split(".").pop() || "png";
    const filename = `${sanitizedName}-${timestamp}.${ext}`;

    const uploadResult = await upload(imageBuffer, filename, "avatars");

    // Parse metadata if provided
    let metadata = null;
    if (metadataStr) {
      try {
        metadata = JSON.parse(metadataStr);
      } catch {
        return NextResponse.json(
          { error: "Invalid metadata format" },
          { status: 400 }
        );
      }
    }

    // Create the avatar record
    console.log("DB_DEBUG: Attempting to insert avatar with userId:", session.user.id);
    const [newAvatar] = await db
      .insert(avatar)
      .values({
        userId: session.user.id,
        name: name.trim(),
        description: description?.trim() || null,
        referenceImageUrl: uploadResult.url,
        metadata,
      })
      .returning();

    if (!newAvatar) {
      return NextResponse.json(
        { error: "Failed to create avatar" },
        { status: 500 }
      );
    }
    console.log("DB_DEBUG: Avatar created successfully:", newAvatar.id);
    return NextResponse.json({ avatar: newAvatar }, { status: 201 });
  } catch (error) {
    console.error("CRITICAL_ERROR creating avatar:", error);
    if (error instanceof Error) {
      console.error("ERROR_STACK:", error.stack);
    }
    return NextResponse.json(
      { error: "Failed to create avatar", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
