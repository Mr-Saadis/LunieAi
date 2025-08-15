// next.config.mjs - FIXED FOR NEXT.JS 15.4.3
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ESLint ignore for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // MOVED: serverComponentsExternalPackages to root level
  serverExternalPackages: ['pdf-parse', 'mammoth', 'xlsx'],
  
  experimental: {
    // Keep only valid experimental options
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Image optimization
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
  },

  // Enable compression
  compress: true,
  
  // REMOVED: swcMinify (default in Next.js 15)

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },

  // Bundle optimization (works with Turbopack)
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      }
    }
    return config
  },
}

export default nextConfig