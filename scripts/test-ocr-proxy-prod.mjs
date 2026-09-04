// E2E test: dogovor.expert /api/ocr-proxy через Supabase-сессию e2e-pro-пользователя
import { readFile } from 'node:fs/promises';

const SUPABASE_URL = 'https://xkakhztknlpzqarklewq.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrYWtoenRrbmxwenFhcmtsZXdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyNzc3NzYsImV4cCI6MjEwMTg1Mzc3Nn0.W28fD0iTeLxGKoMvJnqTv9VYfG-5IG6UYRAcD2HVDR8';

async function supabaseLogin() {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'e2e-pro-6858@test.dogovor.expert',
      password: 'E2e!Pass164413',
    }),
  });
  if (!r.ok) throw new Error(`login ${r.status}: ${await r.text()}`);
  return r.json();
}

async function callRoute(path, { method = 'GET', headers = {}, body, cookies = '' } = {}) {
  const r = await fetch(`https://dogovor.expert${path}`, {
    method,
    headers: { ...headers, cookie: cookies },
    body,
  });
  return { status: r.status, headers: r.headers, body: await r.text(), setCookie: r.headers.getSetCookie?.() ?? [] };
}

(async () => {
  console.log('=== 1) Login to Supabase ===');
  const sb = await supabaseLogin();
  const access = sb.access_token;
  const refresh = sb.refresh_token;
  // @supabase/ssr-compatible cookie format:
  const cookies = [
    `sb-xkakhztknlpzqarklewq-auth-token=${encodeURIComponent(JSON.stringify([{ access_token: access, refresh_token: refresh, expires_in: sb.expires_in, expires_at: sb.expires_at, token_type: 'bearer', user: sb.user }]))}`,
    `sb-xkakhztknlpzqarklewq-auth-token-code-verifier=`,
  ].join('; ');
  console.log(`JWT len=${access.length}, user_id=${sb.user.id}`);

  console.log('\n=== 2) GET /api/ocr-status ===');
  const st = await callRoute('/api/ocr-status', { cookies });
  console.log('Status:', st.status);
  console.log('Body:', st.body.slice(0, 600));

  console.log('\n=== 3) POST /api/ocr-proxy (real test image) ===');
  const png = await readFile('D:/occular-server/tmp/test_russian.png');
  const fd = new FormData();
  fd.append('file', new Blob([png], { type: 'image/png' }), 'test_russian.png');
  const t0 = Date.now();
  const oc = await callRoute('/api/ocr-proxy', {
    method: 'POST',
    cookies,
    body: fd,
  });
  const elapsed = Date.now() - t0;
  console.log(`Status: ${oc.status} in ${elapsed}ms`);
  console.log('Body:', oc.body.slice(0, 1500));
})().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
