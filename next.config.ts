import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // This project lives in a OneDrive-synced folder. OneDrive locks
  // .next/cache/webpack/*.pack.gz while webpack renames them, which corrupts
  // the dev build and throws "TypeError: __webpack_modules__[moduleId] is not a
  // function" in the browser. Disabling webpack's on-disk cache in dev avoids
  // those writes entirely. (Production builds keep caching.)
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  }
};

export default nextConfig;
