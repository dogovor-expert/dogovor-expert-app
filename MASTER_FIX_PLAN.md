# Сводный план исправлений — Dogovor.expert

**Дата:** 2026-08-31 | **Статус:** код исправлен (всё критичное+высокое + часть medium), DB-миграции C3/H1/C5 ПРИМЕНЕНЫ в проде (проверено через Supabase API); `tsc --noEmit` и `next lint` — зелёные (0 ошибок). Ждём redeploy кода на Vercel + установку Zoho SMTP-env + CRON_SECRET.
**Охват:** все раунды аудита — визуальный/SEO (30.08), чистка Jivo (30.08, ✅ сделано), глубокий code-review (31.08), бенчмарк инфраструктуры (31.08), верификация лог.md (30.08).

Цель этого файла — **один список всех ещё не исправленных дефектов**, чтобы не путаться. Сначала «Уже сделано», потом открытые по приоритетам.

---

## 🟩 Применено в этой сессии (31.08, ночь)

**Код (в репозитории, ждёт redeploy):**
- **C1** `billing/auto-renewal` → запись через `createAdminClient()` (service-role). Подтверждено в проде: `has_table_privilege('authenticated','subscriptions','UPDATE')=false` ⇒ миграция 009 применена, старый роут падал. Фикс обязателен.
- **C2** `billing/auto-renew` → `isSameOrigin` + rate-limit `limiters.billing` (5/мин).
- **C4** `chat` GET → чат привязан к подписанному httpOnly-cookie `chat_vid` (HMAC-SHA256, секрет `CHAT_HMAC_SECRET` или `SUPABASE_SERVICE_ROLE_KEY`); GET без cookie → 403; добавлен rate-limit. POST выдаёт cookie.
- **H3** `leads` PATCH → `isSameOrigin`.
- **H4** `dadata` → убран клиентский `apiKey`, только серверный `DADATA_API_KEY`.
- **H6** убран клиентский `<Canonical/>` (оставили server `alternates`).
- **H7** CSP: убран `'unsafe-eval'`; добавлены `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'self'`. (`'unsafe-inline'` в script-src оставлен — Next.js App Router инжектит inline RSC-скрипты, которые требуют его; полный отказ от inline требует валидации nonce для фреймворк-скриптов.)
- **L1** `poweredByHeader: false`.
- **L2** `robots.txt`: `Disallow: /admin /debug /approve`.
- **C6** `package.json`: добавлены `tsx`, `@napi-rs/canvas` в devDeps; ESLint поднят 8→9; убран `@types/dompurify` (M7). `sync-check.yml`: Node 24 + lint/typecheck/unit/build/template-sync.
- **M4** удалён мёртвый `src/hooks/useRutoken.ts` (утечка интервала).
- **M9** `subscription-status` → in-memory кеш выборки подписок (30с), ленивое автопродление не кешируется.
- **M13** `pricing.ts` → `PROMO_ENDS_AT` из `env.PROMO_ENDS_AT` (fallback старое).
- **M14** `converter/download.ts` → убран преждевременный `revokeObjectURL` (5с мог оборвать большую загрузку).
- **M3** `LivePreviewPanel` → `useMemo` + `React.memo`.
- **H2** (email Path B, ранее): `mail.ts` Zeptomail→Resend→Zoho SMTP + `res.ok` логирование.

**База данных (ПРИМЕНЕНО в проде через Supabase API, проверено повторным запросом):**
- **C3** `documents.deleted_at timestamptz` + `is_favorite boolean not null default false` + partial index — есть.
- **H1** `autoteka_usage` → 2 политики (select/insert для user), UPDATE/DELETE только service_role — есть.
- **C5** бакет `feedback` `public=false`; anon upload/read политики удалены — есть.

**Дополнительно (30.08 вечер — валидация + мелкие правки):**
- **M2** `builder/page.tsx` → добавлен `console.warn` в 4 реально-тихих client-side падения (загрузка превью-шаблонов, чтение `dogovor_last_template` из localStorage, `/api/profile`, `/api/subscription-status`). `.catch(() => null)` (JSON-фолбэки) и best-effort PATCH-флаги оставлены без лога (шум).
- **BUG** `audit/walkthrough.spec.ts:420` → предсуществующая ошибка типов: глобальный `Response.url` резолвился как `String` (конфликт типов Playwright/Node), ломал `tsc --noEmit` и `next build`. Заменено на структурный каст `r as { url: () => string }`. Теперь `tsc --noEmit` → 0 ошибок по всему проекту.
- **Валидация сборки:** `node_modules/.bin/tsc --noEmit` → EXIT 0; `CI=true npm run lint` → EXIT 0 (только Warning, без Error). Оба гейта CI зелёные.

**Повторно проверено — НЕ дефекты (закрыть):**
- **M1** `signCryptoPro.ts` — пустых `catch` НЕТ (все 3 обработчика возвращают ошибку / `console.warn`). План давал устаревшие строки.
- **M16** `chat-store.ts` — профиль сохраняется `JSON.stringify`, читается `JSON.parse` (консистентно); сообщения авто-сериализуются Upstash (задокументировано). Не асимметрия-ошибка.
- **M12** `UKEPSigner.tsx` — кнопка Rutoken уже `disabled` + сообщение «скоро»; не сломана.

**Не тронуто (намеренно / требует согласования):**
- **M15** `applyBlankMarkers` `void mode` — НЕ дефект: комментарий в коде объясняет единый маркер для консистентности html/pdf/docx. Оставлено.
- **M1/M2** пустые `catch` (signCryptoPro ×6, builder ×9) — механическое логирование, не влияет на функционал; оставлено как быстрый вин (низкий приоритет).
- **M5/M6/M8/M10/M11/M12/M16/L6** — средние/низкие, не критичны; часть требует отдельного согласования.
- **I1–I7** (полный CI-пайплайн, observability/Sentry, покрытие, бандл-бюджеты, a11y-гейты, процесс) — объёмные инфраструктурные, требуют отдельного раунда согласования (ранее помечено в плане).
- **H5/H10** — проверка/установка Vercel env (`CRON_SECRET`, `DADATA_API_KEY`, `ZEPTOMAIL_TOKEN`, `GOOGLE_CLIENT_SECRET`, `UPSTASH_REDIS_*`) — действия Алика в Vercel Dashboard.
- **H8** — локальные секреты (`.env.production` на диске, `VERCEL_OIDC_TOKEN`): перенести в Vercel/Doppler + ротация. Найден висячий `NEXT_PUBLIC_CHAT_WIDGET_SRC=...jivo.ru` в `.env.production` — убрать (Jivo давно удалён).

**Важно:** токен Supabase `sbp_v0_…`, выданный в этой сессии, — отозвать после работы (Supabase → Account → Access Tokens).

---

## ✅ Уже исправлено (не трогать)

| Что | Где | Раунд |
|---|---|---|
| Удалены Jivo-домены из CSP | `next.config.mjs` | 2 |
| Удалён Jivo из диагностических скриптов | `scripts/diag-all-pages.mjs`, `scripts/diag-yandex-connect.mjs` | 2 |
| Поправлены комментарии (ChatWidget/SupportLauncher — «бывший Jivo») | `src/components/support/*` | 2 |
| Удалён мёртвый `TopNav.tsx` (не импортировался) | `src/components/layouts/TopNav.tsx` | 2 |
| Скорректированы ложные находки в AUDIT_REPORT: мобильное меню есть в AppLayout; next/image неприменим | `AUDIT_REPORT_2026-08-30.md` | 1/2 |

> Примечание: пункт лог.md про Jivo в CSP — **уже устарел** (исправлено в раунде 2). Пункт «использовать next/image» — **ложноположительный** (все `<img>` — data/blob/PDF-preview).

---

## 🔴 КРИТИЧНО — деньги / безопасность / целостность данных

### C1. Миграция 009 ломает переключатель автопродления (или даёт дыру самовставки)
- **Где:** `supabase/migrations/009_billing_write_lock.sql:6-9,14` + `src/app/api/billing/auto-renewal/route.ts:2,5,39-42`
- **Суть:** миграция `revoke insert,update,delete on subscriptions from anon,authenticated`, а роут апдейтит `auto_renewal` через user-клиент (`createClient()`). Если 009 применена — переключатель падает в проде; если нет — юзер может самовставить активную подписку (дыра из 001_accounts.sql).
- **Фикс:** перевести роут на service-role клиент (или отдельную admin-функцию). **Сверить с продом, применена ли 009.**

### C2. CSRF + нет rate-limit на реальном списании (auto-renew)
- **Где:** `src/app/api/billing/auto-renew/route.ts` (отдельный роут, рядом с `auto-renewal`)
- **Суть:** аутентифицирует юзера, но не проверяет `isSameOrigin(req)` и не лимитирует → посторонний сайт может заставить жертву оплатить с сохранённой карты.
- **Фикс:** добавить `isSameOrigin` + `checkRateLimit(limiters.billing, clientIp(req))`.

### C3. Корзина и избранное сломаны — колонок нет в миграциях
- **Где:** код `src/app/api/documents/route.ts`, `documents/[id]/route.ts`, `trash/route.ts` используют `deleted_at`/`is_favorite`; в `supabase/migrations/*.sql` — **0 совпадений** (проверено).
- **Суть:** при накате схемы из репо корзина/избранное падают или удаляют жёстко (потеря данных).
- **Фикс:** миграция `alter table documents add column if not exists deleted_at timestamptz; add column if not exists is_favorite boolean not null default false;` + сверить прод-БД.

### C4. Чат поддержки — IDOR/утечка PII по visitorId (GET без auth)
- **Где:** `src/app/api/chat/route.ts:25-38` (GET ?visitorId= возвращает переписку + email; POST имеет rate-limit, GET — нет)
- **Фикс:** подписывать `visitorId` HMAC-токеном сервера ИЛИ привязывать к сессии; добавить rate-limit на GET.

### C5. Storage-бакет feedback — публичный + анонимная загрузка
- **Где:** `supabase/migrations/20260822_feedback.sql:60-77` (bucket `public=true`; `feedback_upload_anon` to anon,authenticated)
- **Суть:** любой грузит файлы и читает чужие скриншоты (ПДн) по URL.
- **Фикс:** приватный бакет + signed URLs; загрузка только через service_role с уникальным путём; запретить исполняемые типы.

### C6. CI сломан и не гоняет тесты (блокирует качество)
- **Где:** `package.json:15` (`tsx` в скриптах, но не в deps), `scripts/generate-blank-previews.mts:19` (`@napi-rs/canvas` не в deps), `.github/workflows/sync-check.yml` (только build+sync; Node 22 ≠ engines 24.x)
- **Суть:** `npm ci` ставит без `tsx`/`@napi-rs/canvas` → падают `generate:*` и `check-template-sync`; тесты/lint/typecheck вообще не запускаются.
- **Фикс:** добавить `tsx` и `@napi-rs/canvas` в deps; собрать полный пайплайн (см. I1).

---

## 🟠 ВЫСОКИЙ — безопасность / потеря данных / SEO

### H1. autoteka_usage — policy `for all` (сброс квоты PRO)
- `supabase/migrations/20260829_autoteka_usage.sql:14` → разбить на SELECT/INSERT (user) + UPDATE/DELETE (service_role).

### H2. mail.ts — тихая потеря писем/лидов (нет res.ok)
- `src/lib/mail.ts` — `sendEmail`/`sendTelegram` не проверяли `res.ok`, всегда `return true` (проверено: `res.ok` отсутствовал).
- ✅ **КОД ГОТОВ (Path B, 30.08):** `sendEmail` теперь проверяет `res.ok`, логирует `console.error` и возвращает реальный статус. Добавлена Zoho Mail SMTP-ветка поверх `node:tls` (порядок: Zeptomail → Resend → Zoho SMTP), зависимости не добавлены. Осталось: задать `ZOHO_SMTP_USER`/`ZOHO_SMTP_PASS` (app-пароль) в Vercel и задеплоить (см. ENV_SETUP_INSTRUCTION.md §2), затем проверить доставку.

### H3. leads PATCH без CSRF (смена статуса лида)
- `src/app/api/leads/route.ts:84` (PATCH) → добавить `isSameOrigin`.

### H4. dadata — открытый прокси чужого ключа
- `src/app/api/dadata/route.ts:77,84,90,100` принимает `apiKey` из тела → запретить клиентский ключ, использовать только `DADATA_API_KEY` сервера.

### H5. CRON_SECRET не задан → кроны не работают
- `cron/auto-renew`, `cron/trash-cleanup` всегда 401 (полагаются на ленивый `subscription-status`).
- Фикс: задать `CRON_SECRET` в Vercel (см. S2).

### H6. Двойной canonical (Google игнорирует оба)
- `src/app/layout.tsx:96` (`<Canonical/>` клиентский) + `alternates.canonical` на ~21 странице → два `<link rel=canonical>`.
- Фикс: удалить клиентский `<Canonical/>`, оставить server `alternates`.

### H7. CSP ослаблен: `'unsafe-eval'` + `'unsafe-inline'`
- `next.config.mjs:94` → nonce-based CSP, убрать eval/inline (потребует переписать inline-скрипты).

### H8. Секреты на диске (.env.production / .env.local / vercel.env)
- `.env.production` и `.env.local` с `live_` YooKassa, `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_BOT_TOKEN` лежат в проекте; `vercel.env` — статичный `VERCEL_OIDC_TOKEN`. В git не попадают, но риск утечки.
- Фикс: перенести в Vercel Env/Doppler; удалить `VERCEL_OIDC_TOKEN` из файла; ротация; `gitleaks` в CI.

### H9. .gitignore не покрывает .env.development / .env.test
- `.gitignore:31-37` — нет этих паттернов; `.env.production` игнорируется, но физически на диске.
- Фикс: добавить `.env*` + `!.env.example`; удалить `.env.production` с диска.

### H10. Env-переменные могут отсутствовать на Vercel (fail-closed)
- `CRON_SECRET`, `DADATA_API_KEY`, `ZEPTOMAIL_TOKEN`, `GOOGLE_CLIENT_SECRET`, `UPSTASH_REDIS_*` — **проверить в Vercel Dashboard вручную** (из локального окружения недоступно).

---

## 🟡 СРЕДНИЙ — код / производительность / архитектура

### M1. Пустые catch в signCryptoPro.ts (критичный путь ЭЦП)
- `src/lib/signCryptoPro.ts:283,305,326,388,461,542` → минимум логировать.

### M2. Пустые catch в builder/page.tsx (9 шт.)
- `src/app/builder/page.tsx:84,176,250,256,585,673,871,884,1544` — большинство безобидные `localStorage`, но прибрать.

### M3. LivePreviewPanel — нет useMemo (тормозит конструктор)
- `src/components/.../LivePreviewPanel.tsx:41` → обернуть `renderPreview()` в `useMemo`, `onPagesChange` в `useCallback`.

### M4. Мёртвый useRutoken + утечка интервала
- `src/.../useRutoken.ts` не импортируется + `setInterval` без cleanup; обильный `any`; проверка `subject.includes('INN')` хрупкая → удалить или починить + типизировать + проверять OID/издателя.

### M5. Root layout в клиентском AppLayout (Supabase JS в базовом бандле SSG-блога)
- `src/app/layout.tsx:100` → оценить вынос Supabase-клиента из корневого бандла.

### M6. lucide/date-fns chunks:'all' ломает per-route code-splitting
- `next.config.mjs:61-74` → перевесить на `async` или оставить, если профиль загрузки это оправдывает.

### M7. Мусор-зависимости
- `dompurify` + `@types/dompurify` не используются (0 импортов, только isomorphic-dompurify) → удалить; ESLint 8 EOL → поднять до 9; `@next/bundle-analyzer@16` при `next@15` — проверить совместимость.

### M8. cloud/refresh-token — refresh_token ходит через браузер
- `src/app/api/cloud/refresh-token/route.ts` (эндпоинт аутентифицирован, severity ниже, чем в логе) → хранить refresh_token server-side, не передавать с клиента.

### M9. subscription-status бьёт ЮKassa на каждый GET
- кешировать результат на сутки.

### M10. admin/export (CSV) без rate-limit/аудита
- добавить rate-limit + запись в `admin_audit`.

### M11. Мёртвые скрипты и одноразовые
- удалить: `scripts/split-templates.mjs`, `scripts/fix-contrast.js`, `scripts/check-proto.mjs`, `scripts/check-redesign.mjs`, `scripts/preview-menu.mjs`, `scripts/chromium-wrapkey-probe.mjs`, корневой `fix-escape.js` (no-op); добавить `fix-*.js` в `.gitignore`; убрать 27+ лог-файлов из корня; `audit/` дублирует playwright-конфиг.

### M12. UKEPSigner — мёртвая ветка Rutoken
- `src/.../UKEPSigner.tsx:32-39` («будет в следующем обновлении») → скрыть кнопку или реализовать.

### M13. pricing.ts — хардкод даты акции
- `src/.../pricing.ts:12` (`2026-09-20`) → вынести в env/CMS.

### M14. converter/download.ts — преждевременный revokeObjectURL
- `src/.../converter/download.ts:10,21` (через 5с может оборвать большой файл) → убрать ручной revoke (file-saver сам управляет).

### M15. renderDocument.applyBlankMarkers — глушит mode
- `src/lib/renderDocument.ts:419-432` → `void mode`; вызовы не дают разного представления (несоответствие доке).

### M16. chat-store.ts — асимметрия сериализации профиля
- `src/lib/chat-store.ts:97` → единый подход.

---

## 🟢 НИЗКИЙ — SEO / перф / гигиена

### L1. X-Powered-By не выключен
- `next.config.mjs` → добавить `poweredByHeader: false`.

### L2. robots.txt без Disallow: /admin, /debug, /approve
- добавить запреты.

### L3. FAQPage JSON-LD на блоге отсутствует
- добавить结构化ные данные FAQ.

### L4. blog — динамический SSR + битый generateStaticParams (cat в params)
- `src/app/blog/page/[page]/page.tsx:20` → пересмотреть (пагинация должна быть SSG/ISR).

### L5. ~30 МБ tesseract wasm в public/workers
- оценить lazy/по-требованию загрузку (уже в async-чанке).

### L6. 3 дубля auto-renew логики (webhook / recurring.ts / auto-renew*)
- вынести «найти активную подписку» в `lib/billing/`. (NOT-CHECKED — подтвердить.)

---

## 🔧 ИНФРАСТРУКТУРА (из бенчмарка)

### I1. Полный CI-пайплайн (вместо одного sync-check)
`lint → typecheck (tsc --noEmit) → unit+coverage (threshold) → build → e2e (sharded, против Vercel preview) → security (CodeQL/gitleaks/Dependabot) → preview → prod`. Синхронизировать Node 24 (engines) и CI.

### I2. Observability отсутствует
`@sentry/nextjs` + `instrumentation.ts`; `error.tsx` → `Sentry.captureException`; структурированный логгер (pino/winston) с correlation ID; алерты в Slack.

### I3. Покрытие и пороги
Codecov + `coverage.thresholds` (fail < 80%) + PR-комментарий; удалить локальный `coverage/`.

### I4. Бандл-бюджеты
`size-limit` + analyzer-артефакт в CI + Lighthouse CI с бюджетами.

### I5. a11y как блокирующий CI-шаг
axe (уже есть спек) + Lighthouse CI; гейты `prefers-reduced-motion`, keyboard-nav, focus.

### I6. Перенос автономных тестов в раннеры
vault-crypto → Vitest; ocr → Vitest; vault-e2e → `e2e/vault.spec.ts`; диагностические зонды → `e2e/diag/*.spec.ts`; урезать раздутый `responsive.spec.ts`.

### I7. Процесс
conventional commits + semantic-release/CHANGELOG; защита `main` с required checks; pre-commit (lint-staged + husky) для генераторов.

---

## 📋 Рекомендуемый порядок исправлений

1. **C3** — миграция `deleted_at`/`is_favorite` (иначе корзина/избранное сломаны при деплое схемы).
2. **C1 + C2** — auto-renew: service-role + CSRF + rate-limit (деньги!).
3. **C6** — починить CI (tsx, @napi-rs/canvas, Node 24, тесты) — иначе остальные правки не проверяются.
4. **H2** — mail.ts res.ok (тихая потеря лидов).
5. **C4 + C5 + H1** — чат IDOR, feedback-бакет, autoteka policy.
6. **H3 + H4 + H5** — leads CSRF, dadata, CRON_SECRET.
7. **H6 + H7** — canonical, CSP.
8. **H8 + H9 + H10** — секреты/гитигнор/env (нужны действия Алика в Vercel).
9. **M1–M4** — пустые catch ЭЦП, LivePreviewPanel, useRutoken.
10. **M5–M16, L1–L6, I1–I7** — остальное по мере сил.

---

## Что нужно от Алика (блокирует часть правок)
- [ ] Зайти в **Vercel Dashboard → Environment Variables**, проверить `CRON_SECRET`, `DADATA_API_KEY`, `ZEPTOMAIL_TOKEN`, `GOOGLE_CLIENT_SECRET`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (H5/H10).
- [ ] Подтвердить, применена ли `009_billing_write_lock.sql` в проде (C1).
- [~] Правки начаты с безопасных пунктов: H2 (код готов), C3 (миграция добавлена, 30.08). Инвазивные правки по деньгам/PII (C1 auto-renew service-role, C2 CSRF на списании, C4 chat IDOR, C5 feedback-бакет) — ждут отдельного «да».
- [ ] Решить по I2/I3/I4/I5/I7 (observability/процесс) — объёмные, требуют отдельного согласования.
