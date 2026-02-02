import postgres from 'postgres';

const connectionString = "postgresql://neondb_owner:npg_ypY4OfoMgGm5@ep-withered-credit-ah2i9hjw-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require";
const sql = postgres(connectionString);

async function approveUser(email: string) {
  try {
    const result = await sql`
      UPDATE "user" 
      SET 
        status = 'APPROVED', 
        role = 'ADMIN', 
        email_verified = true,
        daily_video_quota = 100,
        daily_image_quota = 500
      WHERE email = ${email}
      RETURNING id, email, status, role
    `;
    
    if (result.length === 0) {
      console.log("NOT_FOUND: No user found with that email. Make sure you signed up first!");
    } else {
      console.log("SUCCESS:", result[0]);
    }
    process.exit(0);
  } catch (e) {
    console.error("SQL_ERROR:", e);
    process.exit(1);
  }
}

approveUser("iansims16@gmail.com");