import * as Sentry from '@sentry/nextjs';

const DSN_OK = /^https?:\/\/[^/]+\/\d+([?/].*)?$/.test(process.env.NEXT_PUBLIC_SENTRY_DSN ?? "");

Sentry.init({
  dsn: DSN_OK ? process.env.NEXT_PUBLIC_SENTRY_DSN : undefined,
  enabled: process.env.NODE_ENV === 'production' && DSN_OK,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [Sentry.replayIntegration()],
});