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
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://inzuro.polis.online https://*.inzuro.ru https://polis.online; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.inzuro.ru https://polis.online https://dkbm-web.autoins.ru; font-src 'self' data:; connect-src 'self' https://inzuro.polis.online https://*.inzuro.ru https://polis.online https://dkbm-web.autoins.ru; frame-src 'self' https://widget.inzuro.ru https://*.inzuro.ru https://polis.online https://dkbm-web.autoins.ru;",
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
