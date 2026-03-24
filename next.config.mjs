/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production: strip X-Powered-By header
  poweredByHeader: false,

  // Compress responses with gzip
  compress: true,

  async redirects() {
    return [
      // Canonical: redirect non-www to www
      {
        source: "/:path*",
        has: [{ type: "host", value: "silverline925.in" }],
        destination: "https://www.silverline925.in/:path*",
        permanent: true,
      },
    ]
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    // Aggressive caching: images cached for 1 year at CDN, stale-while-revalidate 1 week
    minimumCacheTTL: 60 * 60 * 24 * 365,
    remotePatterns: [
      { protocol: 'https', hostname: 'silverline925.in', pathname: '/uploads/**' },
      { protocol: 'https', hostname: 'www.silverline925.in', pathname: '/uploads/**' },
      { protocol: 'https', hostname: '**.blob.vercel-storage.com', pathname: '/**' },
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
    ],
    unoptimized: false,
  },

  // Reduce bundle size — exclude heavy server-only packages from client bundle
  serverExternalPackages: ['@prisma/client', 'bcryptjs', 'jsonwebtoken', 'nodemailer'],

  // HTTP headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // Cache static assets aggressively
        source: '/images/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
}

export default nextConfig
