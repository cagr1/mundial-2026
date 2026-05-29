import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  images: {
    remotePatterns: [
      { hostname: "crests.football-data.org" },
      { hostname: "www.thesportsdb.com" },
      { hostname: "upload.wikimedia.org" },
    ],
  },
};

export default nextConfig;
