import postgres from 'postgres';

const connectionString = process.env.POSTGRES_URL;
if (!connectionString) throw new Error("POSTGRES_URL is required");
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