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

export default nextConfig

