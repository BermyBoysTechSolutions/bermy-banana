import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { productAsset, user } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { upload } from "@/lib/storage";

/**
 * GET /api/products - List all products for the current user
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await db
      .select()
      .from(productAsset)
      .where(eq(productAsset.userId, session.user.id))
      .orderBy(desc(productAsset.createdAt));

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products - Create a new product
 * Requires: user.status === "APPROVED"
 *
 * Body (multipart/form-data):
 * - name: string (required)
 * - image: File (required) - Product image
 * - brand: string (optional)
 * - category: string (optional)
 * - description: string (optional)
 * - metadata: JSON string (optional) - { color?, size?, price?, sku? }
 */
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

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
            "Your account must be approved by an admin before you can create products.",
        },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const imageFile = formData.get("image") as File | null;
    const brand = formData.get("brand") as string | null;
    const category = formData.get("category") as string | null;
    const description = formData.get("description") as string | null;
    const metadataStr = formData.get("metadata") as string | null;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!imageFile) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    // Upload the image
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    const timestamp = Date.now();
    const sanitizedName = name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const ext = imageFile.name.split(".").pop() || "png";
    const filename = `${sanitizedName}-${timestamp}.${ext}`;

    const uploadResult = await upload(imageBuffer, filename, "products");

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

    // Create the product record
    const [newProduct] = await db
      .insert(productAsset)
      .values({
        userId: session.user.id,
        name: name.trim(),
        imageUrl: uploadResult.url,
        brand: brand?.trim() || null,
        category: category?.trim() || null,
        description: description?.trim() || null,
        metadata,
      })
      .returning();

    return NextResponse.json({ product: newProduct }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
