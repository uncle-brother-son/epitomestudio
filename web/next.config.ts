import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Removed output: 'export' for SSR support
  images: {
    unoptimized: true, // Cloudflare doesn't support Next.js Image Optimization API
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'private, no-store' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/book-a-slot',
        destination: '/studio-hire',
        permanent: true,
      },
      {
        source: '/terms',
        destination: '/legal/terms-and-conditions',
        permanent: true,
      },
      {
        source: '/privacy-policy',
        destination: '/legal/privacy-policy',
        permanent: true,
      },
      {
        source: '/backdrops',
        destination: '/',
        permanent: true,
      },
    ]
  },
}

// Bundle analyzer configuration
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

export default withBundleAnalyzer(nextConfig)


import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
