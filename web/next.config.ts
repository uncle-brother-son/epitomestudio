import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
      },
    ],
    minimumCacheTTL: 60,
  },
  // Disable static export for full Next.js features
  // output: 'export' is NOT used
}

export default nextConfig
