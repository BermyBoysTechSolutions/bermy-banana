import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.POSTGRES_URL as string;

console.log("DB_DEBUG: Attempting to connect to database...");
if (!connectionString) {
  console.error("DB_DEBUG: POSTGRES_URL is missing!");
  throw new Error("POSTGRES_URL environment variable is not set");
}

const client = postgres(connectionString, { 
  ssl: 'require',
  connect_timeout: 10,
});
export const db = drizzle(client, { schema });
console.log("DB_DEBUG: Connection object initialized.");
