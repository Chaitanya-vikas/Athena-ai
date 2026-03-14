import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bypasses the strict ESLint checks during production build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Bypasses the strict TypeScript checks during production build
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;