/** @type {import('next').NextConfig} */
import bundleAnalyzer from '@next/bundle-analyzer';
// Sentry 10: withSentryConfig переехал в подпуть '/config'. Импорт из корня
// '@sentry/nextjs' помечен deprecated и перестанет работать в v11
// (предупреждение было в каждой сборке).
import { withSentryConfig } from '@sentry/nextjs/config';

const withBundleAnalyzer =
  process.env.ANALYZE === 'true'
    ? bundleAnalyzer({ enabled: true })
    : (config) => config;

// Self-hosted Supabase: добавляем env-хост в remotePatterns аддитивно,
// чтобы собирать один и тот же конфиг и для Vercel (облако), и для
// self-hosted развёртывания (свой API-шлюз).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseHost = supabaseUrl.replace(/^https?:\/\//, '').split('/')[0] || '';

const nextConfig = {
  output: 'standalone',
  // ⚠️ Здесь НЕЛЬЗЯ отключать встроенный линт Next (опция ignoreDuringBuilds).
  // Инвариант src/lib/__tests__/invariants/architecture.test.ts запрещает её
  // прямым текстом: линт обязан блокировать сборку. Предупреждение Next «The
  // Next.js plugin was not detected» — ложное (Next 15 не читает ESLint 9 flat
  // config), но гейт отключать нельзя: это осознанное проектное решение.
  // sharp грузится динамическим import() внутри /api/avatar — file-tracing не всегда
  // включает нативные бинарники @img/*; для standalone/Docker добираем явно.
  outputFileTracingIncludes: {
    '/api/avatar': ['./node_modules/sharp/**', './node_modules/@img/**'],
  },
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'xkakhztknlpzqarklewq.supabase.co' },
      ...(supabaseHost
        ? [{
            protocol: supabaseUrl.startsWith('http:') ? 'http' : 'https',
            hostname: supabaseHost,
          }]
        : []),
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.yandex.net' },
      { protocol: 'https', hostname: 'avatars.mds.yandex.net' },
    ],
  },
  
  async redirects() {
    return [
      { source: '/:path*', has: [{ type: 'host', value: 'www.dogovor.expert' }], destination: 'https://dogovor.expert/:path*', permanent: true },
      { source: '/constructor', destination: '/builder', permanent: false },
      { source: '/constructor/:path*', destination: '/builder/:path*', permanent: false },
    ]
  },
  webpack: (config, { isServer }) => {
    // linkedom опционально резолвит 'canvas' (commonjs/canvas.cjs делает
    // require('canvas') в try/catch). Для DOMPurify-санитизации canvas не
    // нужен — заглушка вместо модуля, чтобы webpack не падал на резолве.
    config.resolve.alias = { ...config.resolve.alias, canvas: false };
    if (!isServer) {
      // Клиентская санитизация идёт через нативный window (см. src/lib/dompurify.ts),
      // linkedom нужен только на сервере — исключаем из клиентских бандлов.
      config.resolve.alias = { ...config.resolve.alias, linkedom: false };
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
            chunks: 'async',
            priority: 20,
            enforce: true,
          },
          dateFns: {
            test: /[\\/]node_modules[\\/]date-fns[\\/]/,
            name: 'date-fns',
            chunks: 'async',
            priority: 20,
            enforce: true,
          },
        },
      };
    }
    return config;
  },
  // CSP и security-заголовки теперь управляются через middleware (с nonce)
  // Для production используем nonce-based CSP
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
    'date-fns': {
      transform: 'date-fns/{{member}}',
    },
  },
}

const sentryWebpackPluginOptions = {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  // v10: sourcemaps удаляются после загрузки (hideSourceMaps как отдельная опция убран).
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
  // v10: прежние top-level disableLogger/automaticVercelMonitors переехали под webpack.
  webpack: {
    automaticVercelMonitors: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
};

export default withBundleAnalyzer(withSentryConfig(nextConfig, sentryWebpackPluginOptions));
