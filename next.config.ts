import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // KTD6 — listing photos are served from Vercel Blob's public storage.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
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
