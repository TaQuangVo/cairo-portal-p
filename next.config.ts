import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    dynamicIO: true,
    // allowedDevOrigins is not a valid property and has been removed
  }
};

export default nextConfig;
