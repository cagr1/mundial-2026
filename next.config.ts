import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  images: {
    remotePatterns: [
      { hostname: "a.espncdn.com" },         // ESPN team logos
      { hostname: "www.thesportsdb.com" },    // Player photos (legacy)
      { hostname: "r2.thesportsdb.com" },     // Player photos (CDN R2)
      { hostname: "upload.wikimedia.org" },   // Wikipedia player photos
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

export default withNextIntl(nextConfig);
