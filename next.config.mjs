/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  webpack: (config) => {
    config.externals = [...config.externals, { canvas: "canvas" }];  // required for JWT handling
    return config;
  },
};

export default nextConfig; 