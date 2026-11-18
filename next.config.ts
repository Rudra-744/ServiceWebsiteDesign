import type { NextConfig } from "next";
import path from "node:path";
import "./src/lib/env"; // fail the build early on a malformed environment

const nextConfig: NextConfig = {
  poweredByHeader: false,
  trailingSlash: false,
  images: { formats: ["image/avif", "image/webp"] },
  // web/ sits inside another folder that has its own lockfile; pin the workspace root to this app
  turbopack: { root: path.join(__dirname) },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // shortcut: no script-src/style-src yet (inline head script, JSON-LD and Next's inline scripts would need nonces,
          // which force dynamic rendering); add a nonce-based CSP if the site starts handling sensitive data
          { key: "Content-Security-Policy", value: "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // the 360° planet's "Tilt to look around" uses the device orientation sensors
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), accelerometer=(self), gyroscope=(self), magnetometer=(self)" },
        ],
      },
    ];
  },
};

export default nextConfig;
