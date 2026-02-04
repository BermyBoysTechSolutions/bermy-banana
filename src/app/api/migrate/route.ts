import { NextRequest, NextResponse } from "next/server";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "@/lib/db";

/**
 * One-time migration endpoint
 * Run this once to apply pending migrations, then delete this file
 */
export async function GET(request: NextRequest) {
  // Simple auth check - only allow in development or with secret header
  const authHeader = request.headers.get("x-migration-secret");
  if (process.env.NODE_ENV === "production" && authHeader !== "migrate-now-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Starting database migration...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Migration completed successfully");
    
    return NextResponse.json({ 
      success: true, 
      message: "Migration completed successfully" 
    });
  } catch (error) {
    console.error("Migration failed:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}