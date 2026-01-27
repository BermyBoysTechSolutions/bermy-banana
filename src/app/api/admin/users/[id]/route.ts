import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user, auditLog } from "@/lib/schema";
import { eq } from "drizzle-orm";
import type { UserStatus, UserRole } from "@/lib/schema";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/admin/users/[id] - Get a single user (admin only)
 */
export async function GET(_request: Request, context: RouteContext) {
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

    const { id } = await context.params;

    const [foundUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    if (!foundUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: foundUser });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users/[id] - Update user status/role/quotas (admin only)
 *
 * Body (JSON):
 * - status: "PENDING" | "APPROVED" | "DENIED" | "SUSPENDED" (optional)
 * - role: "USER" | "ADMIN" (optional)
 * - dailyVideoQuota: number (optional)
 * - dailyImageQuota: number (optional)
 */
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

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

    const { id } = await context.params;

    // Find the target user
    const [targetUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();
    const { status, role, dailyVideoQuota, dailyImageQuota } = body as {
      status?: UserStatus;
      role?: UserRole;
      dailyVideoQuota?: number;
      dailyImageQuota?: number;
    };

    // Validate status
    if (status && !["PENDING", "APPROVED", "DENIED", "SUSPENDED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Validate role
    if (role && !["USER", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Prevent self-demotion from admin
    if (id === session.user.id && role === "USER") {
      return NextResponse.json(
        { error: "Cannot demote yourself from admin" },
        { status: 400 }
      );
    }

    // Build update object
    const updates: Record<string, unknown> = {};
    if (status) updates.status = status;
    if (role) updates.role = role;
    if (dailyVideoQuota !== undefined) updates.dailyVideoQuota = dailyVideoQuota;
    if (dailyImageQuota !== undefined) updates.dailyImageQuota = dailyImageQuota;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No updates provided" },
        { status: 400 }
      );
    }

    // Update the user
    const [updatedUser] = await db
      .update(user)
      .set(updates)
      .where(eq(user.id, id))
      .returning();

    // Log the action
    const ipAddress = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    let auditAction: string;
    if (status === "APPROVED") {
      auditAction = "ADMIN_APPROVE_USER";
    } else if (status === "DENIED") {
      auditAction = "ADMIN_DENY_USER";
    } else if (status === "SUSPENDED") {
      auditAction = "ADMIN_SUSPEND_USER";
    } else {
      auditAction = "ADMIN_UPDATE_USER";
    }

    await db.insert(auditLog).values({
      userId: session.user.id,
      action: auditAction,
      resourceType: "USER",
      resourceId: id,
      metadata: {
        targetUserId: id,
        targetUserEmail: targetUser.email,
        changes: updates,
        previousStatus: targetUser.status,
        previousRole: targetUser.role,
      },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
