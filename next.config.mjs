/** @type {import('next').NextConfig} */
import bundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';

const withBundleAnalyzer =
  process.env.ANALYZE === 'true'
    ? bundleAnalyzer({ enabled: true })
    : (config) => config;

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
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
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
};

export default withBundleAnalyzer(withSentryConfig(nextConfig, sentryWebpackPluginOptions));
