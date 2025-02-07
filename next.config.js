/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["lh3.googleusercontent.com", "firebasestorage.googleapis.com"],
  },
  webpack: (config) => {
    // Provide fallbacks for Node.js core modules
    config.resolve.fallback = {
      fs: false,
      net: false,
      child_process: false,
      tls: false,
      events: false,
      process: false,
      util: false,
      stream: false,
    };

    // Add a plugin to handle 'node:' URIs
    config.module.rules.push({
      test: /^node:/,
      use: 'null-loader',
    });

    return config;
  },
}

module.exports = nextConfig

