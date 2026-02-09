/**
 * Checkout API Route - Polar Next.js SDK
 *
 * Creates a Polar checkout session and redirects user.
 */

import { Checkout } from "@polar-sh/nextjs";

export const GET = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN || "",
  successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
  returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
  server: process.env.NODE_ENV === "production" ? "production" : "sandbox",
});
