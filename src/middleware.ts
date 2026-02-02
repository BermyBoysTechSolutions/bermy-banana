import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Log all API requests for debugging
  if (request.nextUrl.pathname.startsWith("/api/")) {
    console.log("[MIDDLEWARE] API Request:", {
      method: request.method,
      path: request.nextUrl.pathname,
      timestamp: new Date().toISOString(),
    });
  }

  // Special logging for avatar endpoints
  if (request.nextUrl.pathname.startsWith("/api/avatars")) {
    console.log("[MIDDLEWARE] Avatar API hit:", {
      method: request.method,
      path: request.nextUrl.pathname,
      hasCookie: request.cookies.has("better-auth.session_token"),
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
