import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { eq, desc, sql } from "drizzle-orm";

/**
 * GET /api/admin/users - List all users (admin only)
 *
 * Query params:
 * - status: filter by status (PENDING, APPROVED, DENIED, SUSPENDED)
 * - limit: number (default 50)
 * - offset: number (default 0)
 */
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const [currentUser] = await db
      .select({ role: user.role })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse query params
    const url = new URL(request.url);
    const statusFilter = url.searchParams.get("status");
    const limitParam = url.searchParams.get("limit");
    const offsetParam = url.searchParams.get("offset");

    const limit = Math.min(Math.max(1, parseInt(limitParam || "50")), 100);
    const offset = Math.max(0, parseInt(offsetParam || "0"));

    // Build query
    let query = db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        status: user.status,
        role: user.role,
        dailyVideoQuota: user.dailyVideoQuota,
        dailyImageQuota: user.dailyImageQuota,
        videosGeneratedToday: user.videosGeneratedToday,
        imagesGeneratedToday: user.imagesGeneratedToday,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .orderBy(desc(user.createdAt))
      .limit(limit)
      .offset(offset);

    // Apply status filter if provided
    if (statusFilter && ["PENDING", "APPROVED", "DENIED", "SUSPENDED"].includes(statusFilter)) {
      query = query.where(eq(user.status, statusFilter)) as typeof query;
    }

    const users = await query;

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(user);

    // Get counts by status
    const statusCounts = await db
      .select({
        status: user.status,
        count: sql<number>`count(*)::int`,
      })
      .from(user)
      .groupBy(user.status);

    const counts = {
      total: countResult?.count || 0,
      pending: 0,
      approved: 0,
      denied: 0,
      suspended: 0,
    };

    for (const row of statusCounts) {
      const key = row.status.toLowerCase() as keyof typeof counts;
      if (key in counts) {
        counts[key] = row.count;
      }
    }

    return NextResponse.json({
      users,
      pagination: {
        limit,
        offset,
        total: counts.total,
      },
      counts,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
