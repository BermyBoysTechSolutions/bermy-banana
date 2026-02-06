/**
 * Audit Logging Service
 *
 * Tracks user actions and system events for compliance and debugging.
 */

import { db } from "@/lib/db";
import { auditLog } from "@/lib/schema";
import type { GenerationMode } from "@/lib/providers/types";

/**
 * Audit action types
 */
export type AuditAction =
  | "GENERATE_IMAGE"
  | "GENERATE_VIDEO"
  | "CREATE_AVATAR"
  | "DELETE_AVATAR"
  | "CREATE_PRODUCT"
  | "DELETE_PRODUCT"
  | "USER_LOGIN"
  | "USER_REGISTER"
  | "ADMIN_APPROVE_USER"
  | "ADMIN_DENY_USER"
  | "ADMIN_SUSPEND_USER";

/**
 * Resource types that can be audited
 */
export type ResourceType = "JOB" | "USER" | "AVATAR" | "PRODUCT" | "OUTPUT";

/**
 * Log an audit event
 */
export async function logAuditEvent(params: {
  userId?: string | null | undefined;
  action: AuditAction;
  mode?: GenerationMode | undefined;
  resourceType?: ResourceType | undefined;
  resourceId?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
}): Promise<void> {
  try {
    await db.insert(auditLog).values({
      userId: params.userId || null,
      action: params.action,
      mode: params.mode || null,
      resourceType: params.resourceType || null,
      resourceId: params.resourceId || null,
      metadata: params.metadata || null,
      ipAddress: params.ipAddress || null,
      userAgent: params.userAgent || null,
    });
  } catch (error) {
    // Log to console but don't throw - audit failures shouldn't break the app
    console.error("Failed to log audit event:", error);
  }
}

/**
 * Log a generation event
 */
export async function logGeneration(params: {
  userId: string;
  mode: GenerationMode;
  jobId: string;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  const action =
    params.mode === "MODE_B" ? "GENERATE_IMAGE" : "GENERATE_VIDEO";

  await logAuditEvent({
    userId: params.userId,
    action,
    mode: params.mode,
    resourceType: "JOB",
    resourceId: params.jobId,
    metadata: { success: params.success },
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });
}

/**
 * Log an asset creation event
 */
export async function logAssetCreation(params: {
  userId: string;
  type: "avatar" | "product";
  assetId: string;
  assetName: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  const action =
    params.type === "avatar" ? "CREATE_AVATAR" : "CREATE_PRODUCT";
  const resourceType: ResourceType =
    params.type === "avatar" ? "AVATAR" : "PRODUCT";

  await logAuditEvent({
    userId: params.userId,
    action,
    resourceType,
    resourceId: params.assetId,
    metadata: { name: params.assetName },
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });
}

/**
 * Log an asset deletion event
 */
export async function logAssetDeletion(params: {
  userId: string;
  type: "avatar" | "product";
  assetId: string;
  assetName?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  const action =
    params.type === "avatar" ? "DELETE_AVATAR" : "DELETE_PRODUCT";
  const resourceType: ResourceType =
    params.type === "avatar" ? "AVATAR" : "PRODUCT";

  await logAuditEvent({
    userId: params.userId,
    action,
    resourceType,
    resourceId: params.assetId,
    metadata: params.assetName ? { name: params.assetName } : undefined,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });
}
