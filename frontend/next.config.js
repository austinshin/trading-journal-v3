/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  // Configure image domains if needed
  images: {
    domains: [],
  },
}

module.exports = nextConfig 