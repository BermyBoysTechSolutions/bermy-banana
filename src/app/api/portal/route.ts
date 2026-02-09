/**
 * Customer Portal API Route - Polar Next.js SDK
 *
 * Creates a customer portal session for managing subscriptions.
 */

import { CustomerPortal } from "@polar-sh/nextjs";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const GET = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN || "",
  getCustomerId: async () => {
    const session = await auth.api.getSession({ headers: await headers() });
    return session?.user?.id || "";
  },
  returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  server: process.env.NODE_ENV === "production" ? "production" : "sandbox",
});
