import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Removed output: 'export' for SSR support
  images: {
    unoptimized: true, // Cloudflare doesn't support Next.js Image Optimization API
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

// Bundle analyzer configuration
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

export default withBundleAnalyzer(nextConfig)


import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
