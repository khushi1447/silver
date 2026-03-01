/** @type {import('next').NextConfig} */
const nextConfig = {
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
    // Allow common storage/CDN hosts used by this app
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'silverline925.in',
        pathname: '/uploads/**'
      },
      {
        protocol: 'https',
        hostname: 'www.silverline925.in',
        pathname: '/uploads/**'
      },
      {
        protocol: 'https',
        hostname: '**.blob.vercel-storage.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**'
      }
    ],
    unoptimized: true,
  },
}

export default nextConfig
