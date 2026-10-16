import postgres from 'postgres';

const connectionString = process.env.POSTGRES_URL;
if (!connectionString) throw new Error("POSTGRES_URL is required");
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

const targetEmail = process.env.TARGET_USER_EMAIL;
if (!targetEmail) throw new Error("TARGET_USER_EMAIL is required");
approveUser(targetEmail);