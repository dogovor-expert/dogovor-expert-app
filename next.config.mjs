/** @type {import('next').NextConfig} */
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer =
  process.env.ANALYZE === 'true'
    ? bundleAnalyzer({ enabled: true })
    : (config) => config;

const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/:path*', has: [{ type: 'host', value: 'www.dogovor.expert' }], destination: 'https://dogovor.expert/:path*', permanent: true },
      { source: '/constructor', destination: '/builder', permanent: false },
      { source: '/constructor/:path*', destination: '/builder/:path*', permanent: false },
    ]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          // Отдельные чанки для тяжёлых библиотек — загружаются только при динамическом импорте
          tesseract: {
            test: /[\\/]node_modules[\\/]tesseract\.js[\\/]/,
            name: 'tesseract',
            chunks: 'async',
            priority: 30,
            enforce: true,
          },
          pdfLib: {
            test: /[\\/]node_modules[\\/]pdf-lib[\\/]/,
            name: 'pdf-lib',
            chunks: 'async',
            priority: 30,
            enforce: true,
          },
          docxLib: {
            test: /[\\/]node_modules[\\/]docx[\\/]/,
            name: 'docx',
            chunks: 'async',
            priority: 30,
            enforce: true,
          },
          pdfjs: {
            test: /[\\/]node_modules[\\/]pdfjs-dist[\\/]/,
            name: 'pdfjs',
            chunks: 'async',
            priority: 30,
            enforce: true,
          },
          fontkit: {
            test: /[\\/]node_modules[\\/]@pdf-lib[\\/]fontkit[\\/]/,
            name: 'fontkit',
            chunks: 'async',
            priority: 30,
            enforce: true,
          },
          // Баррельные импорты — выносим в отдельные чанки
          lucide: {
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            name: 'lucide',
            chunks: 'all',
            priority: 20,
            enforce: true,
          },
          dateFns: {
            test: /[\\/]node_modules[\\/]date-fns[\\/]/,
            name: 'date-fns',
            chunks: 'all',
            priority: 20,
            enforce: true,
          },
        },
      };
    }
    return config;
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
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://inzuro.polis.online https://*.inzuro.ru https://polis.online https://api.polis.online https://cdn.jsdelivr.net https://unpkg.com https://mc.yandex.ru https://mc.yandex.md https://*.jivo.ru https://*.jivosite.com https://www.cryptopro.ru https://download.rutoken.ru; worker-src 'self' blob: https://cdn.jsdelivr.net https://unpkg.com https://*.jivo.ru https://*.jivosite.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.jivo.ru https://*.jivosite.com http://code.jivosite.com https://code.jivosite.com; img-src 'self' data: blob: https://*.inzuro.ru https://polis.online https://api.polis.online https://dkbm-web.autoins.ru https://xkakhztknlpzqarklewq.supabase.co https://lh3.googleusercontent.com https://avatars.yandex.net https://avatars.mds.yandex.net https://mc.yandex.ru https://mc.yandex.md https://*.jivo.ru https://*.jivosite.com http://code.jivosite.com https://code.jivosite.com; font-src 'self' data: https://fonts.gstatic.com https://*.jivo.ru https://*.jivosite.com; connect-src 'self' https://inzuro.polis.online https://*.inzuro.ru https://polis.online https://api.polis.online https://dkbm-web.autoins.ru https://xkakhztknlpzqarklewq.supabase.co https://cdn.jsdelivr.net https://unpkg.com https://tessdata.projectnaptha.com https://mc.yandex.ru https://mc.yandex.md https://yandex.ru https://*.jivo.ru https://*.jivosite.com http://code.jivosite.com wss://*.jivo.ru wss://*.jivosite.com wss://mc.yandex.ru; frame-src 'self' blob: https://widget.inzuro.ru https://*.inzuro.ru https://polis.online https://api.polis.online https://dkbm-web.autoins.ru https://*.jivo.ru https://*.jivosite.com https://mc.yandex.ru; media-src 'self' https://*.jivo.ru https://*.jivosite.com;",
          },
        ],
      },
    ]
  },
}

export default withBundleAnalyzer(nextConfig);
