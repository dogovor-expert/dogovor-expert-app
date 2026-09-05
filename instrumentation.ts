import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const env = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV;
const enabled = process.env.NODE_ENV === 'production';

function initSentry() {
  if (!enabled || !dsn) return;
  Sentry.init({
    dsn,
    enabled,
    environment: env,
    tracesSampleRate: 0.1,
  });
}

export function register() {
  // Runs once on server startup (Node.js and Edge runtime)
  initSentry();
}

export function onRequestError(err: unknown, _request: Request) {
  // Optional: custom error handling for server components
  if (enabled && dsn) {
    Sentry.captureException(err);
  }
}