import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['i.ibb.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'zhrlwnjbkaaautzeysuf.supabase.co',
      },
    ],
  },
};

export default nextConfig;
