import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "phkgprsgicxsktebhsnr.supabase.co" },
    ],
  },
};

export default nextConfig;
