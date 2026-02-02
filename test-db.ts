import postgres from 'postgres';

const connectionString = "postgresql://neondb_owner:npg_ypY4OfoMgGm5@ep-withered-credit-ah2i9hjw-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require";
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