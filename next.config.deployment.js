/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip ESLint during build for faster builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Skip TypeScript checking during build for faster builds
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Optimize for production deployment
  experimental: {
    optimizeCss: true,
    // Remove console logs in production (except errors)
    removeConsole: {
      exclude: ['error'],
    },
    // Enable SWC minification
    swcMinify: true,
    // Optimize images
    images: {
      allowFutureImage: true,
    },
  },
  
  // Disable source maps for faster build
  productionBrowserSourceMaps: false,
  
  // Enable compression
  compress: true,
  
  // Generate static pages when possible
  trailingSlash: true,
  
  // Optimize bundle size
  swcMinify: true,
  
  // Reduce build time by excluding unnecessary files
  modularizeImports: {
    '@radix-ui/react-icons': {
      transform: '@radix-ui/react-icons/dist/{{member}}',
    },
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}',
    },
  },
  
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Webpack configuration for optimization
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Optimize client bundle
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      };
    }
    
    return config;
  },
  
  // Headers for performance
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:all*(js|css)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Output configuration
  output: 'standalone',
  
  // Disable telemetry for privacy and performance
  telemetry: false,
  
  // React configuration
  reactStrictMode: true,
  
  // Powerfully optimize builds
  poweredByHeader: false,
  
  // Skip trailing slash redirect
  skipTrailingSlashRedirect: true,
};

module.exports = nextConfig;