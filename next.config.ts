import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  images: {
    remotePatterns: [
      { hostname: "www.thesportsdb.com" },
      { hostname: "upload.wikimedia.org" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/crests/:path*",
        destination: "https://crests.football-data.org/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/crests/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, s-maxage=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
