import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  integer,
  jsonb,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// IMPORTANT! ID fields should ALWAYS use UUID types, EXCEPT the BetterAuth tables.

// ============================================================================
// User Status & Role Enums (stored as text, validated in app layer)
// ============================================================================
// User status: PENDING | APPROVED | DENIED | SUSPENDED
// User role: USER | ADMIN

// ============================================================================
// BetterAuth Tables (use text IDs as required by BetterAuth)
// ============================================================================

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    // Bermy Banana extensions
    status: text("status").default("PENDING").notNull(), // PENDING | APPROVED | DENIED | SUSPENDED
    role: text("role").default("USER").notNull(), // USER | ADMIN
    // Legacy quota fields (kept for migration, will be deprecated)
    dailyVideoQuota: integer("daily_video_quota").default(50).notNull(),
    dailyImageQuota: integer("daily_image_quota").default(200).notNull(),
    videosGeneratedToday: integer("videos_generated_today").default(0).notNull(),
    imagesGeneratedToday: integer("images_generated_today").default(0).notNull(),
    quotaResetAt: timestamp("quota_reset_at"),
    // New subscription/credit fields
    subscriptionTier: text("subscription_tier").default("free").notNull(), // free | starter | pro | agency
    subscriptionStatus: text("subscription_status").default("inactive").notNull(), // inactive | active | cancelled | past_due
    creditsRemaining: integer("credits_remaining").default(0).notNull(),
    creditsTotal: integer("credits_total").default(0).notNull(),
    polarCustomerId: text("polar_customer_id"),
    polarSubscriptionId: text("polar_subscription_id"),
  },
  (table) => [index("user_email_idx").on(table.email)]
);

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("session_user_id_idx").on(table.userId),
    index("session_token_idx").on(table.token),
  ]
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("account_user_id_idx").on(table.userId),
    index("account_provider_account_idx").on(table.providerId, table.accountId),
  ]
);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// ============================================================================
// Bermy Banana Application Tables (use UUID IDs)
// ============================================================================

// Avatar - User's AI personas
export const avatar = pgTable(
  "avatar",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"), // Detailed description of avatar's appearance for video generation
    referenceImageUrl: text("reference_image_url").notNull(),
    metadata: jsonb("metadata").$type<{
      gender?: string;
      ageRange?: string;
      ethnicity?: string;
      style?: string;
    }>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("avatar_user_id_idx").on(table.userId)]
);

// Product Asset - Products for demos
export const productAsset = pgTable(
  "product_asset",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    imageUrl: text("image_url").notNull(),
    brand: text("brand"),
    category: text("category"),
    description: text("description"),
    metadata: jsonb("metadata").$type<{
      color?: string;
      size?: string;
      price?: string;
      sku?: string;
    }>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("product_asset_user_id_idx").on(table.userId)]
);

// Scene Template - Pre-built templates (hook → demo → CTA)
export const sceneTemplate = pgTable("scene_template", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  sceneCount: integer("scene_count").notNull(),
  defaultScenes: jsonb("default_scenes")
    .$type<
      Array<{
        order: number;
        name: string;
        type: "hook" | "demo" | "cta" | "custom";
        defaultDuration: number;
        promptTemplate?: string;
      }>
    >()
    .notNull(),
  isPublic: boolean("is_public").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Generation Job - Master job record
export const generationJob = pgTable(
  "generation_job",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    mode: text("mode").notNull(), // MODE_A | MODE_B | MODE_C
    status: text("status").default("PENDING").notNull(), // PENDING | PROCESSING | COMPLETED | FAILED
    title: text("title"),
    config: jsonb("config").$type<{
      aspectRatio?: "9:16" | "16:9" | "1:1";
      audioEnabled?: boolean;
      templateId?: string;
    }>(),
    errorMessage: text("error_message"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("generation_job_user_id_idx").on(table.userId),
    index("generation_job_status_idx").on(table.status),
  ]
);

// Scene - Individual scenes within a job
export const scene = pgTable(
  "scene",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => generationJob.id, { onDelete: "cascade" }),
    order: integer("order").notNull(),
    avatarId: uuid("avatar_id").references(() => avatar.id, {
      onDelete: "set null",
    }),
    productId: uuid("product_id").references(() => productAsset.id, {
      onDelete: "set null",
    }),
    prompt: text("prompt").notNull(),
    script: text("script"), // For talking head videos - what the avatar will say
    action: text("action"), // What the avatar will do (e.g., "talking to camera", "holding product")
    setting: text("setting"), // Where the scene takes place (e.g., "modern kitchen", "outdoor patio")
    duration: integer("duration").default(6).notNull(), // 5, 6, or 8 seconds
    status: text("status").default("PENDING").notNull(), // PENDING | PROCESSING | COMPLETED | FAILED
    providerJobId: text("provider_job_id"), // External job ID from Veo/Nano Banana
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("scene_job_id_idx").on(table.jobId),
    index("scene_status_idx").on(table.status),
  ]
);

// Output Asset - Generated outputs (images/videos)
export const outputAsset = pgTable(
  "output_asset",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => generationJob.id, { onDelete: "cascade" }),
    sceneId: uuid("scene_id").references(() => scene.id, {
      onDelete: "set null",
    }),
    type: text("type").notNull(), // VIDEO | IMAGE
    url: text("url").notNull(),
    thumbnailUrl: text("thumbnail_url"),
    durationSeconds: integer("duration_seconds"),
    metadata: jsonb("metadata").$type<{
      width?: number;
      height?: number;
      format?: string;
      fileSize?: number;
    }>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("output_asset_job_id_idx").on(table.jobId),
    index("output_asset_scene_id_idx").on(table.sceneId),
  ]
);

// Audit Log - Activity tracking
export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    action: text("action").notNull(), // GENERATE_VIDEO | GENERATE_IMAGE | APPROVE_USER | etc.
    mode: text("mode"), // MODE_A | MODE_B | MODE_C
    resourceType: text("resource_type"), // JOB | USER | AVATAR | PRODUCT
    resourceId: text("resource_id"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("audit_log_user_id_idx").on(table.userId),
    index("audit_log_action_idx").on(table.action),
    index("audit_log_created_at_idx").on(table.createdAt),
  ]
);

// Reference Image - User uploaded images for iterative editing
export const referenceImage = pgTable(
  "reference_image",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    imageUrl: text("image_url").notNull(),
    description: text("description"),
    metadata: jsonb("metadata").$type<{
      width?: number;
      height?: number;
      format?: string;
      sourceJobId?: string; // Link to original generation job if derived from output
    }>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("reference_image_user_id_idx").on(table.userId)]
);

// Promo Code - For promotional credits
export const promoCode = pgTable(
  "promo_code",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull().unique(),
    credits: integer("credits").notNull(),
    maxUses: integer("max_uses").notNull(),
    usedCount: integer("used_count").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    expiresAt: timestamp("expires_at"),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("promo_code_code_idx").on(table.code)]
);

// Redeemed Promo Code - Track which users have redeemed which codes
export const redeemedPromoCode = pgTable(
  "redeemed_promo_code",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    promoCodeId: uuid("promo_code_id")
      .notNull()
      .references(() => promoCode.id, { onDelete: "cascade" }),
    redeemedAt: timestamp("redeemed_at").defaultNow().notNull(),
    creditsAwarded: integer("credits_awarded").notNull(),
  },
  (table) => [
    index("redeemed_promo_user_idx").on(table.userId),
    index("redeemed_promo_code_idx").on(table.promoCodeId),
  ]
);

// ============================================================================
// Relations
// ============================================================================

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  avatars: many(avatar),
  products: many(productAsset),
  jobs: many(generationJob),
  auditLogs: many(auditLog),
  referenceImages: many(referenceImage),
}));

export const avatarRelations = relations(avatar, ({ one, many }) => ({
  user: one(user, {
    fields: [avatar.userId],
    references: [user.id],
  }),
  scenes: many(scene),
}));

export const productAssetRelations = relations(productAsset, ({ one, many }) => ({
  user: one(user, {
    fields: [productAsset.userId],
    references: [user.id],
  }),
  scenes: many(scene),
}));

export const generationJobRelations = relations(generationJob, ({ one, many }) => ({
  user: one(user, {
    fields: [generationJob.userId],
    references: [user.id],
  }),
  scenes: many(scene),
  outputs: many(outputAsset),
}));

export const sceneRelations = relations(scene, ({ one, many }) => ({
  job: one(generationJob, {
    fields: [scene.jobId],
    references: [generationJob.id],
  }),
  avatar: one(avatar, {
    fields: [scene.avatarId],
    references: [avatar.id],
  }),
  product: one(productAsset, {
    fields: [scene.productId],
    references: [productAsset.id],
  }),
  outputs: many(outputAsset),
}));

export const outputAssetRelations = relations(outputAsset, ({ one }) => ({
  job: one(generationJob, {
    fields: [outputAsset.jobId],
    references: [generationJob.id],
  }),
  scene: one(scene, {
    fields: [outputAsset.sceneId],
    references: [scene.id],
  }),
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  user: one(user, {
    fields: [auditLog.userId],
    references: [user.id],
  }),
}));

export const referenceImageRelations = relations(referenceImage, ({ one }) => ({
  user: one(user, {
    fields: [referenceImage.userId],
    references: [user.id],
  }),
}));

export const promoCodeRelations = relations(promoCode, ({ many }) => ({
  redemptions: many(redeemedPromoCode),
}));

export const redeemedPromoCodeRelations = relations(redeemedPromoCode, ({ one }) => ({
  user: one(user, {
    fields: [redeemedPromoCode.userId],
    references: [user.id],
  }),
  promoCode: one(promoCode, {
    fields: [redeemedPromoCode.promoCodeId],
    references: [promoCode.id],
  }),
}));

// ============================================================================
// Type Exports
// ============================================================================

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export type Avatar = typeof avatar.$inferSelect;
export type NewAvatar = typeof avatar.$inferInsert;

export type ProductAsset = typeof productAsset.$inferSelect;
export type NewProductAsset = typeof productAsset.$inferInsert;

export type SceneTemplate = typeof sceneTemplate.$inferSelect;
export type NewSceneTemplate = typeof sceneTemplate.$inferInsert;

export type GenerationJob = typeof generationJob.$inferSelect;
export type NewGenerationJob = typeof generationJob.$inferInsert;

export type Scene = typeof scene.$inferSelect;
export type NewScene = typeof scene.$inferInsert;

export type OutputAsset = typeof outputAsset.$inferSelect;
export type NewOutputAsset = typeof outputAsset.$inferInsert;

export type AuditLog = typeof auditLog.$inferSelect;
export type NewAuditLog = typeof auditLog.$inferInsert;

export type ReferenceImage = typeof referenceImage.$inferSelect;
export type NewReferenceImage = typeof referenceImage.$inferInsert;

export type PromoCode = typeof promoCode.$inferSelect;
export type NewPromoCode = typeof promoCode.$inferInsert;

export type RedeemedPromoCode = typeof redeemedPromoCode.$inferSelect;
export type NewRedeemedPromoCode = typeof redeemedPromoCode.$inferInsert;

// Status and Role types
export type UserStatus = "PENDING" | "APPROVED" | "DENIED" | "SUSPENDED";
export type UserRole = "USER" | "ADMIN";
export type JobStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
export type GenerationMode = "MODE_A" | "MODE_B" | "MODE_C";
export type OutputType = "VIDEO" | "IMAGE";
export type SceneAction = "hold" | "point" | "use" | "unbox" | "demo";
export type SubscriptionTier = "free" | "trial" | "starter" | "pro" | "agency";
export type SubscriptionStatus = "inactive" | "trial" | "active" | "cancelled" | "past_due";
