/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Cache headers for static assets (works with Cloudflare CDN) ──
  // Tells Cloudflare/browsers: cache these files for 1 year
  // Files get a unique hash in the name so cache is auto-busted on deploy
  async headers() {
    return [
      {
        // JS, CSS, images, fonts — all static assets
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // GeoJSON data file — cache for 1 hour, revalidate in background
        source: '/data/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // Document PDFs — cache for 7 days
        source: '/documents/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=2592000',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
