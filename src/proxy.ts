import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Protected routes that require auth
const PROTECTED_ROUTES = ["/dashboard", "/chat", "/profile", "/avatars"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Log all API requests for debugging
  if (pathname.startsWith("/api/")) {
    console.log("[MIDDLEWARE] API Request:", {
      method: request.method,
      path: pathname,
      timestamp: new Date().toISOString(),
    });
  }

  // Special logging for avatar endpoints
  if (pathname.startsWith("/api/avatars")) {
    console.log("[MIDDLEWARE] Avatar API hit:", {
      method: request.method,
      path: pathname,
      hasCookie: request.cookies.has("better-auth.session_token"),
    });
  }

  // Check if this is a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    const sessionCookie = getSessionCookie(request);

    // Redirect to home if no session cookie
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*", "/chat/:path*", "/profile/:path*", "/avatars/:path*"],
};