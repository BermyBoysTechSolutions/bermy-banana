import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user, auditLog } from "@/lib/schema";
import { eq, desc, sql } from "drizzle-orm";

/**
 * GET /api/admin/audit - Get audit logs (admin only)
 *
 * Query params:
 * - action: filter by action type
 * - userId: filter by user ID
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
    const actionFilter = url.searchParams.get("action");
    const userIdFilter = url.searchParams.get("userId");
    const limitParam = url.searchParams.get("limit");
    const offsetParam = url.searchParams.get("offset");

    const limit = Math.min(Math.max(1, parseInt(limitParam || "50")), 100);
    const offset = Math.max(0, parseInt(offsetParam || "0"));

    // Build query with user join
    let baseQuery = db
      .select({
        id: auditLog.id,
        userId: auditLog.userId,
        action: auditLog.action,
        mode: auditLog.mode,
        resourceType: auditLog.resourceType,
        resourceId: auditLog.resourceId,
        metadata: auditLog.metadata,
        ipAddress: auditLog.ipAddress,
        userAgent: auditLog.userAgent,
        createdAt: auditLog.createdAt,
        userName: user.name,
        userEmail: user.email,
      })
      .from(auditLog)
      .leftJoin(user, eq(auditLog.userId, user.id))
      .orderBy(desc(auditLog.createdAt))
      .limit(limit)
      .offset(offset);

    // Apply filters
    if (actionFilter) {
      baseQuery = baseQuery.where(eq(auditLog.action, actionFilter)) as typeof baseQuery;
    }
    if (userIdFilter) {
      baseQuery = baseQuery.where(eq(auditLog.userId, userIdFilter)) as typeof baseQuery;
    }

    const logs = await baseQuery;

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(auditLog);

    return NextResponse.json({
      logs,
      pagination: {
        limit,
        offset,
        total: countResult?.count || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
