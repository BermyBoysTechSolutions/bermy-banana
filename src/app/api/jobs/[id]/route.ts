import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getJob } from "@/lib/services/generation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/jobs/[id] - Get a specific job with its scenes and outputs
 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const jobData = await getJob(session.user.id, id);

    if (!jobData) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(jobData);
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}
