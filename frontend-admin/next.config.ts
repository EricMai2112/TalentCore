import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compress responses with gzip
  compress: true,

  // Experimental performance features
  experimental: {
    // Minify CSS output during build
    optimizeCss: true,
  },

  // Logging: reduce noise in development
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

export default nextConfig;
