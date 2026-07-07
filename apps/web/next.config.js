/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  env: {
    VITE_GOOGLE_CLIENT_ID: process.env.VITE_GOOGLE_CLIENT_ID || '947961081206-0sh2q9fja06hcc65gj8o2tghhd164uia.apps.googleusercontent.com',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || ''
  },
  images: {
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Flatten chunk filenames to remove square brackets from path segments
      config.output.chunkFilename = 'static/chunks/[id].[chunkhash].js';
    }
    return config;
  }
};

export default nextConfig;
