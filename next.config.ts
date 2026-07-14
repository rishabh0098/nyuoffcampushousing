import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Static CSP — works with Next.js, the inline theme-init script, and Google OAuth
 * redirects (top-level navigations).
 * 'unsafe-inline' is required for the beforeInteractive theme script without
 * a per-request nonce; 'unsafe-eval' only in development for Next/React tooling.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https:",
  "font-src 'self'",
  "connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com https://vercel.live wss://ws-us3.pusher.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
]
  .join("; ")
  .replace(/\s{2,}/g, " ")
  .trim();

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]),
];

const nextConfig: NextConfig = {
  images: {
    // KTD6 — listing photos are served from Vercel Blob's public storage.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      { source: "/my-listings", destination: "/listings?tab=mine", permanent: false },
      { source: "/glossary", destination: "/listings?tab=glossary", permanent: false },
      { source: "/my-listings/new", destination: "/listings?tab=mine&new=1", permanent: false },
      {
        source: "/my-listings/:id/edit",
        destination: "/listings?tab=mine&edit=:id",
        permanent: false,
      },
      { source: "/listings/:id", destination: "/listings?listing=:id", permanent: false },
    ];
  },
};

export default nextConfig;
