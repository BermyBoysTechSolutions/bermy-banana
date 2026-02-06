import postgres from 'postgres';

const connectionString = "postgresql://neondb_owner:[CONTACT_REMOVED]/neondb?sslmode=require";
const sql = postgres(connectionString);

async function test() {
  try {
    const result = await sql`SELECT 1 as connected`;
    console.log("SUCCESS:", result);
    process.exit(0);
  } catch (e) {
    console.error("FAILURE:", e);
    process.exit(1);
  }
}
test();