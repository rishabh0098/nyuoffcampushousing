import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // KTD6 — listing photos are served from Vercel Blob's public storage.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
};

export default nextConfig;
