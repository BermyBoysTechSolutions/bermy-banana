import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { productAsset } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { deleteFile } from "@/lib/storage";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/products/[id] - Get a single product by ID
 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const [foundProduct] = await db
      .select()
      .from(productAsset)
      .where(
        and(eq(productAsset.id, id), eq(productAsset.userId, session.user.id))
      )
      .limit(1);

    if (!foundProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product: foundProduct });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/[id] - Delete a product
 * Also deletes the associated image from storage
 */
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    // Find the product first to get the image URL
    const [foundProduct] = await db
      .select()
      .from(productAsset)
      .where(
        and(eq(productAsset.id, id), eq(productAsset.userId, session.user.id))
      )
      .limit(1);

    if (!foundProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Delete the image from storage
    try {
      await deleteFile(foundProduct.imageUrl);
    } catch (storageError) {
      console.error("Error deleting product image:", storageError);
      // Continue with deletion even if image deletion fails
    }

    // Delete the product record
    await db
      .delete(productAsset)
      .where(
        and(eq(productAsset.id, id), eq(productAsset.userId, session.user.id))
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
