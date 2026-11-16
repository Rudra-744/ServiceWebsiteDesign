import type { NextConfig } from "next";
import path from "node:path";
import "./src/lib/env"; // fail the build early on a malformed environment

const nextConfig: NextConfig = {
  poweredByHeader: false,
  trailingSlash: false,
  images: { formats: ["image/avif", "image/webp"] },
  // web/ sits inside another folder that has its own lockfile; pin the workspace root to this app
  turbopack: { root: path.join(__dirname) },
};

export default nextConfig;
