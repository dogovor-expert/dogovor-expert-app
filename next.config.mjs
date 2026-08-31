/** @type {import('next').NextConfig} */
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer =
  process.env.ANALYZE === 'true'
    ? bundleAnalyzer({ enabled: true })
    : (config) => config;

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [
      { source: '/:path*', has: [{ type: 'host', value: 'www.dogovor.expert' }], destination: 'https://dogovor.expert/:path*', permanent: true },
      { source: '/constructor', destination: '/builder', permanent: false },
      { source: '/constructor/:path*', destination: '/builder/:path*', permanent: false },
    ]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Emscripten-сборки (onnxruntime-web, opencv-js) статически ссылаются
      // на Node-модули (fs/path) только в небраузерных ветках. Webpack
      // анализирует их и падает «Can't resolve 'fs'». Отключаем фолбэки —
      // фикс, официально рекомендованный и onnxruntime-web, и TechStark.
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        child_process: false,
        net: false,
        tls: false,
        http2: false,
        stream: false,
        buffer: false,
        process: false,
      };
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
    // React Fast Refresh (dev-инструмент Next.js) использует eval — без
    // 'unsafe-eval' в dev ломаются HMR и превью. В production react-refresh
    // не входит в бандл, поэтому CSP остаётся строгой (см. H7 в MASTER_FIX_PLAN).
    const isDev = process.env.NODE_ENV !== "production";
    const cspScriptSrc = isDev ? "'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'" : "'self' 'unsafe-inline' 'wasm-unsafe-eval'";
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '0' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
{
              key: 'Content-Security-Policy',
              value:
                `default-src 'self'; script-src ${cspScriptSrc} https://inzuro.polis.online https://*.inzuro.ru https://polis.online https://api.polis.online https://cdn.jsdelivr.net https://unpkg.com https://challenges.cloudflare.com https://mc.yandex.ru https://mc.yandex.md https://www.cryptopro.ru https://download.rutoken.ru; worker-src 'self' blob: https://cdn.jsdelivr.net https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https://*.inzuro.ru https://polis.online https://api.polis.online https://dkbm-web.autoins.ru https://xkakhztknlpzqarklewq.supabase.co https://lh3.googleusercontent.com https://avatars.yandex.net https://avatars.mds.yandex.net https://mc.yandex.ru https://mc.yandex.md https://mc.yandex.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://inzuro.polis.online https://*.inzuro.ru https://polis.online https://api.polis.online https://dkbm-web.autoins.ru https://xkakhztknlpzqarklewq.supabase.co https://cdn.jsdelivr.net https://unpkg.com https://tessdata.projectnaptha.com https://challenges.cloudflare.com https://mc.yandex.ru https://mc.yandex.md https://mc.yandex.com https://yandex.ru https://huggingface.co https://*.huggingface.co wss://mc.yandex.ru; frame-src 'self' blob: https://widget.inzuro.ru https://*.inzuro.ru https://polis.online https://api.polis.online https://dkbm-web.autoins.ru https://mc.yandex.ru https://challenges.cloudflare.com; media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self';`,
            },
        ],
      },
    ]
  },
}

export default withBundleAnalyzer(nextConfig);
