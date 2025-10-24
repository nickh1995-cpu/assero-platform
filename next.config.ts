import type { NextConfig } from "next";
import path from "path";
const isStaticExport = process.env.NEXT_STATIC_EXPORT === 'true';

const nextConfig: NextConfig = {
  // SSR by default; allow optional static export for local preview
  ...(isStaticExport ? { output: 'export', trailingSlash: true, images: { unoptimized: true } } : {}),
  trailingSlash: true,
  reactStrictMode: false,
  images: isStaticExport ? { unoptimized: true } : undefined,
  
  // Silence monorepo root inference warning
  // outputFileTracingRoot: path.join(__dirname, ".."),
  
  // Performance optimizations - Disable turbopack to avoid EMFILE issues
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js'],
    scrollRestoration: true,
  },
  
  // Transpile packages for better compatibility
  transpilePackages: ['@supabase/supabase-js'],
  
  // Webpack configuration - Optimize file watching for macOS
  webpack: (config, { isServer, dev }) => {
    // Fix for undefined call errors
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // Optimize file watching to prevent EMFILE errors on macOS
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000, // Check for changes every second
        aggregateTimeout: 300,
        ignored: ['**/node_modules', '**/.next', '**/.git'],
      };
    }
    
    return config;
  },
  
  // Ignore ESLint and TypeScript errors during build for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
};

export default nextConfig;
