import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // Enable React strict mode for better error checking
  swcMinify: true, // Enable SWC minification for improved performance
  
  // Add Vercel analytics
  // For more details, see https://vercel.com/docs/analytics/quickstart
};

export default nextConfig;
