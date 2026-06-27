/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
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
