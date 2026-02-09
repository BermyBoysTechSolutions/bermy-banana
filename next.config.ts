import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Minimal config to avoid build issues
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  
  // External packages for server components
  serverExternalPackages: ['@polar-sh/sdk'],
};

export default nextConfig;
