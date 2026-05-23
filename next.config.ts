import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use Turbopack (Next.js 16 default)
  turbopack: {
    resolveAlias: {
      canvas: { browser: "" },
    },
  },
  // Webpack fallback for compatibility
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;
