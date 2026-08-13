/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  async redirects() {
    return [
      { source: '/constructor', destination: '/builder', permanent: false },
      { source: '/constructor/:path*', destination: '/builder/:path*', permanent: false },
    ]
  },
}

module.exports = nextConfig
