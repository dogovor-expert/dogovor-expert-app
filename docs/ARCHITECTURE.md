# 🗺️ КАРТА АРХИТЕКТУРЫ DOGOVOR.EXPERT

## 1. Стек технологий

| Слой | Технология |
|------|-----------|
| Framework | Next.js 15.5 (App Router, RSC, ISR, Server Actions) |
| Язык | TypeScript 5.5 (strict mode) |
| UI | React 19, Tailwind CSS 3.4, Radix UI |
| БД / Auth | Supabase (PostgreSQL, RLS, Auth) |
| Кеш / rate-limit | Upstash Redis |
| Платежи | ЮKassa (REST API v3) |
| PDF | pdf-lib + pdfjs-dist |
| DOCX | docx (npm) |
| OCR-сканер | tesseract.js, mrz, onnxruntime-web (client-side) |
| Тесты | Vitest 4.1 (unit, integration), Playwright 1.62 (e2e, prod) |
| Линт | ESLint 9 + eslint-config-next + Prettier |
| CI/CD | CapRover push-webhook (ветка `production`) → сборка и деплой на VDS |
| Мониторинг | Sentry (@sentry/nextjs) |
| Аналитика | Яндекс.Метрика |

## 2. Структура директорий

```
src/
├── app/                                 # App Router (роуты, страницы, layouts, API)
│   ├── (admin)/                         # ❌ НЕ route group — папка admin/ (защищена middleware + is_admin)
│   │   └── ...
│   ├── admin/                           # /admin/users, /admin/subscriptions и т.д. (is_admin)
│   ├── api/                             # Backend API Routes (39 роутов)
│   │   ├── auth/login/                  # POST: логин email+password (CSRF, rate-limit, Zod)
│   │   ├── billing/                     # create-payment, auto-renew, auto-renewal, history, webhook
│   │   ├── documents/                   # CRUD черновиков пользователя
│   │   ├── persons/                     # GET/POST/DELETE сохранённых физлиц
│   │   ├── contractors/                 # GET/POST/DELETE сохранённых юрлиц
│   │   ├── trash/                       # GET/POST/DELETE корзины (с soft-delete)
│   │   ├── cron/                        # tsl-refresh, daily-maintenance (внешний crontab, CRON_SECRET)
│   │   ├── sign/                        # accept, prepare, status, download (УКЭП)
│   │   ├── cloud/refresh-token/         # Google Drive / Yandex Disk / Dropbox токены
│   │   ├── dadata/                      # Прокси для DaData (find-party, suggest-party, suggest-address, suggest-fms_unit)
│   │   ├── chat/                        # Виджет чата
│   │   ├── telegram/webhook/            # Telegram Bot webhook
│   │   ├── leads/                       # Лиды (форма обратной связи)
│   │   ├── feedback/                    # Отзывы
│   │   ├── approval/                    # Approve-токены для подписания
│   │   ├── import/                      # Импорт черновиков
│   │   ├── ocr-proxy/, ocr-status/      # ⚠️ ЗАБЛОКИРОВАНО владельцем (occular)
│   │   └── health/                      # GET: liveness check
│   ├── approve/[token]/                 # /approve/:token — страница подписания
│   ├── auth/confirm/                    # /auth/confirm — обработка PKCE / OTP
│   ├── billing/                         # /billing — PRO-подписка
│   ├── blanks/                          # /blanks, /blanks/[slug] — каталог пустых бланков
│   ├── blog/                            # /blog, /blog/[slug], /blog/page/[page]
│   ├── builder/                         # /builder, /builder/export-pdf — конструктор документов
│   ├── connections/                     # /connections — облачные диски (Google Drive, Yandex Disk, Dropbox)
│   ├── contacts/                        # /contacts
│   ├── converter/                       # /converter — утилиты PDF (merge, split, images, docx, sign)
│   ├── dashboard/                       # /dashboard — главная ЛК
│   ├── debug/pdf/                       # /debug/pdf — отладочная страница (только для владельца)
│   ├── documents/                       # /documents — ЛИЧНЫЕ черновики (auth-only), /documents/[slug] — публичные посадочные
│   ├── help/                            # /help
│   ├── login/                           # /login, /login/forgot, /login/reset
│   ├── not-found/                       # /not-found — не путать с app/not-found.tsx (это страница 404 для URL)
│   ├── preview/                         # /preview — предпросмотр документа
│   ├── privacy/, terms/                 # Юридические страницы
│   ├── security/                        # /security — управление сессиями и паролем
│   ├── settings/                        # /settings, /settings/profile
│   ├── templates/                       # /templates — каталог шаблонов
│   ├── trash/                           # /trash — корзина
│   ├── utils/                           # /utils — калькуляторы и проверки
│   ├── utils/[tool]/                    # 22 SEO-страницы калькуляторов (SSG, /utils/nds и т.д.)
│   ├── sravnenie-dogovorov/             # /sravnenie-dogovorov — сравнение редакций + протокол разногласий
│   ├── about/                           # /about
│   ├── autoteka/, osago/, dkp/,         # Лендинги услуг
│   ├── techosmotr/, tahograph/
│   ├── layout.tsx                       # Корневой layout (Inter, JSON-LD Org+WebSite+SearchAction)
│   ├── not-found.tsx                    # 404 fallback (явный noindex, без canonical)
│   ├── page.tsx                         # Главная (canonical=/)
│   ├── sitemap.ts                       # Динамический sitemap.xml (служебные + 369 документов + 36 вариаций + 14 конвертера + 22 калькулятора + блог)
│   └── global-error.tsx                 # Error boundary
│
├── components/                          # Переиспользуемые компоненты
│   ├── analytics/                       # Яндекс.Метрика
│   ├── auth/                            # LoginForm, TurnstileCaptcha
│   ├── builder/                         # DocScanner, OcrScanner, FieldRenderer
│   ├── converter/                       # MergePdf, SplitPdf, PdfToImages, SignPdf, ImagesToPdf, DocxToPrint, OcrTool
│   ├── contract/                        # Рендерер договора
│   ├── layouts/                         # AppLayout, Footer, Header, Breadcrumbs, PromoPill
│   ├── seo/                             # JsonLd, Canonical, FaqBlock
│   ├── ui/                              # Базовые UI-компоненты (Button, Modal, Input, Tabs, etc.)
│   └── ...                              # другие (PromoPill, PromoTimer, CountdownTimer, etc.)
│
├── lib/                                 # Утилиты и сервисный слой
│   ├── supabase/                        # server.ts (RSC), client.ts (browser), admin.ts (service_role), middleware.ts
│   ├── seo/                             # withSeo.ts, faq.ts, intro.ts — конструкторы метаданных
│   ├── ratelimit.ts                     # Upstash sliding window (5/60s для auth)
│   ├── rate-limit.ts                    # Legacy rate-limiter (НЕ использовать для нового кода)
│   ├── csrf.ts                          # withCsrf() wrapper
│   ├── bytes.ts                         # uint8ToBase64 (чанкован, без RangeError)
│   ├── docOcr.ts                        # Извлечение паспорта/ВУ/ПТС из текста (regex с контекстными якорями)
│   ├── docRequirements.ts                # Слоты сканера, PERSON_ROLES
│   ├── docDesign.ts                     # Токены дизайна (3 стиля: classic/minimal/brand)
│   ├── format.ts                        # applyFieldFormat, buildTemplateDefaults, truncateWord, formatRub
│   ├── renderDocument.ts                # Рендеринг документа в HTML (escape только Mustache {{}})
│   ├── pricing.ts                       # PRO_PRICE=299, PRO_PRICE_OLD=990, isPromoActive(), currentProPrice()
│   ├── personMapping.ts                 # roleToPerson / personToFields
│   ├── signatures.ts                    # Работа с УКЭП (embedSignature удалён)
│   ├── sign-prepare.ts                  # Подготовка к подписи: шаблон из LEGAL_TEMPLATES, текст из TEMPLATE_PREVIEWS, values из documents.fields
│   ├── withSecurityHeaders.ts           # security headers wrapper
│   ├── withCsrf.ts                      # CSRF wrapper (включая safeNext)
│   ├── withOrigin.ts                    # isSameOrigin
│   ├── withRateLimit.ts                 # Rate-limit wrapper
│   ├── withZod.ts                       # Zod validation wrapper
│   ├── env.ts                           # Типизированный process.env
│   ├── site.ts                          # SITE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_CONTACT_EMAIL
│   ├── authActions.ts                   # server actions для auth
│   └── __tests__/                       # Unit-тесты vitest (см. п.5)
│
├── data/                                # Статические данные
│   ├── templates/                       # 369 шаблонов (AUTO, FINANCE, REALTY, BUSINESS, RENTALS, SALES, CONTRACTS, HR, CLAIMS, FINANCE_ACTS, CORPORATE_WEB, FAMILY, OTHER, MIGRATION, LEGAL, POSTAL)
│   │   ├── parts.ts                     # Общие блоки (pageShell, pairIntro, sideFields, commonClauses, ...)
│   │   ├── finance-act.ts               # repeating-таблицы для актов
│   │   ├── corporate-web.ts             # foundersSign, operatorSign
│   │   └── ...                          # другие специализированные части
│   ├── templates.ts                     # LEGAL_TEMPLATES (re-exports)
│   ├── blog/                            # posts.ts (BLOG_POSTS — единый источник)
│   ├── typeTemplates.ts                 # Типы шаблонов
│   └── types.ts                         # LegalTemplate, FieldDef, FieldOption и пр.
│
├── styles/                              # Глобальные стили
│   └── globals.css                      # Tailwind + CSS-переменные
│
├── types/                               # Глобальные типы (если есть)
│
├── middleware.ts                        # Глобальный middleware (auth, security headers, rate-limit, MFA)
│
├── instrumentation.ts                   # Sentry init
└── instrumentation-client.ts            # Sentry client init
```

## 3. Слои данных (как течёт запрос)

```
User request
    ↓
[next.config.mjs] — headers(), redirects(), images (AVIF/WebP, remotePatterns)
    ↓
[src/middleware.ts] — auth, security headers, rate-limit, AAL2 MFA, geo-redirects
    ↓
[Route Handler / Page]
    ↓
[Server Component]   ───── RSC default, async
    ↓ (если нужен Supabase)
[createClient() from @/lib/supabase/server]  — cookie-based, RLS через session
    ↓
[Service layer]      — @/lib/* (ratelimit, csrf, withZod, etc.)
    ↓
[Supabase REST]      — через anon key (RLS) или service_role (admin)
    ↓
[PostgreSQL]         — RLS политики, triggers, миграции (supabase/migrations/*.sql)
```

## 4. Карта API-роутов (56 route-файлов в `src/app/api`)

| Метод | Путь | Назначение | Auth | CSRF | Rate-limit | Zod |
|-------|------|------------|------|------|-----------|-----|
| POST | `/api/auth/login` | Логин email+password | – | ✓ | 5/60s IP+email | ✓ |
| POST | `/api/billing/create-payment` | Создание платежа ЮKassa | ✓ | ✓ | – | ✓ |
| POST | `/api/billing/auto-renew` | Ручной auto-renew | ✓ | ✓ | – | ✓ |
| POST | `/api/billing/auto-renewal` | Cron auto-renewal | service_role | ✓ | – | ✓ |
| GET | `/api/billing/history` | История платежей | ✓ | – | – | – |
| POST | `/api/billing/webhook` | Вебхук ЮKassa | IP+HMAC+verify | – | webhook | ✓ |
| GET,POST,DELETE | `/api/documents` | CRUD черновиков | ✓ | ✓ | – | ✓ |
| GET,PATCH,DELETE | `/api/documents/[id]` | Один черновик | ✓ | ✓ | – | ✓ |
| GET,POST,DELETE | `/api/persons` | Сохранённые физлица | ✓ | ✓ | – | ✓ |
| GET,POST,DELETE | `/api/contractors` | Сохранённые юрлица | ✓ | ✓ | – | ✓ |
| GET,POST,DELETE | `/api/trash` | Корзина | ✓ | ✓ | – | ✓ |
| POST | `/api/feedback` | Обращения/тикеты обратной связи | – | ✓ | feedbackForm | ✓ |
| POST | `/api/leads` | Лиды | – | ✓ | – | ✓ |
| POST | `/api/dadata` | Прокси DaData | – | ✓ | – | ✓ |
| POST | `/api/chat` | Виджет чата | – | ✓ | – | – |
| POST | `/api/autoteka/check` | Проверка ТС | ✓ | ✓ | 5/60s | ✓ |
| GET | `/api/autoteka/history` | История проверок | ✓ | – | – | – |
| POST | `/api/autoteka/pay` | Оплата проверки | ✓ | ✓ | – | ✓ |
| GET | `/api/subscription-status` | Статус подписки | ✓ | – | – | – |
| POST | `/api/cloud/refresh-token` | Refresh OAuth токенов облачных дисков | ✓ | ✓ | – | – |
| GET,POST | `/api/approval` | Approve-токены | ✓ | ✓ | – | ✓ |
| GET,POST | `/api/approval/[token]` | Конкретный токен | mixed | mixed | – | ✓ |
| POST | `/api/sign/prepare` | Подготовка подписания | ✓ | ✓ | – | ✓ |
| POST | `/api/sign/accept` | Принятие подписи | ✓ | ✓ | – | ✓ |
| GET | `/api/sign/[id]/status` | Статус подписания | ✓ | – | – | – |
| GET | `/api/sign/[id]/download` | Скачивание подписанного | ✓ | – | – | – |
| POST | `/api/import` | Импорт черновиков | ✓ | ✓ | – | – |
| POST | `/api/export/email` | Отправка документа на email | ✓ | ✓ | – | ✓ |
| POST | `/api/cron/auto-renew` | Cron auto-renew | service_role | ✓ | – | – |
| POST | `/api/cron/trash-cleanup` | Cron очистка корзины | service_role | ✓ | – | – |
| POST | `/api/telegram/webhook` | Telegram Bot | secret | – | – | ✓ |
| GET | `/api/health` | Liveness | – | – | – | – |
| GET,POST,DELETE | `/api/profile` | Профиль | ✓ | ✓ | – | – |
| POST | `/api/profile/export` | Экспорт данных | ✓ | ✓ | – | – |
| GET | `/api/templates/summary` | Сводка по шаблонам | – | – | – | – |
| GET,POST | `/api/admin/export` | Админ-экспорт | admin | ✓ | – | – |
| ❌ | `/api/ocr-proxy`, `/api/ocr-status` | **ЗАБЛОКИРОВАНО** | – | – | – | – |

## 5. Карта тестов

```
src/lib/__tests__/
├── format.test.ts                # applyFieldFormat, buildTemplateDefaults, truncateWord, formatRub
├── docDesign.test.ts             # Токены дизайна (3 стиля, диапазоны)
├── docScanner.test.ts            # Слоты сканера, regex-безопасность
├── renderDocument.test.ts        # escape, totals, _total_pretty
├── templates.test.ts             # Счётчик 369 шаблонов, категории, имена
├── validation.test.ts            # isFieldVisible, dependsOn
├── gen-samples.test.ts           # (ИСКЛЮЧЁН из vitest.config.ts) — восстанавливать только вручную
├── gen-samples-docs.test.ts      # (ИСКЛЮЧЁН из vitest.config.ts)
└── invariants/                   # 🆕 Тесты архитектурных инвариантов (auto-pilot)
    ├── seo-routes.test.ts        # canonical, robots, sitemap
    ├── security-routes.test.ts   # CSRF, rate-limit, auth на мутирующих эндпоинтах
    ├── data-safety.test.ts       # Запрет `any`, service_role не на клиенте
    └── architecture.test.ts      # Структура каталогов, конвенции именования

e2e/                              # Playwright e2e
├── auth.spec.ts                  # OAuth, forgot-password, reset
├── builder.spec.ts               # Конструктор документов
├── converter-*.spec.ts           # PDF-утилиты
├── prod-*.cjs                    # Скрипты проверки прода (вне Playwright)
└── ...
```

## 6. Supabase клиенты — где какой использовать

| Клиент | Файл | Используется в | Cookies | RLS |
|--------|------|----------------|---------|-----|
| `createServerClient` (server) | `src/lib/supabase/server.ts` | RSC, Server Actions, Route Handlers | да (httpOnly) | через session |
| `createBrowserClient` (client) | `src/lib/supabase/client.ts` | Client Components | да (httpOnly) | через session |
| `createClient` (admin) | `src/lib/supabase/admin.ts` | server-side admin tasks | нет | bypass (service_role) |

**Правила:**
- `server.ts` — async, всегда `await`.
- `client.ts` — placeholder при отсутствии env (для PR-превью без секретов).
- `admin.ts` — **ТОЛЬКО** в server-side коде. Если видишь импорт в Client Component — это баг.
- Cookies: `httpOnly: true`, `secure` в production, `sameSite: "lax"`, `path: "/"`.

## 7. Публичные сегменты (URL-схема)

| Сегмент | URL | robots | middleware | SEO |
|---------|-----|--------|------------|-----|
| `/` | Главная | index,follow | – | canonical=/ |
| `/templates` | Каталог шаблонов | index,follow | – | canonical=/templates, CollectionPage JSON-LD |
| `/blanks`, `/blanks/[slug]` | Каталог бланков | index,follow | – | canonical=self, Breadcrumb+FAQ+WebPage |
| `/documents/[slug]` | **Публичные** посадочные документов | index,follow | – | SSG, canonical=self, JSON-LD FAQ |
| `/documents` (без slug) | ЛК черновики | **Disallow /documents$** | auth-only | noindex |
| `/utils` | Калькуляторы | index,follow | – | canonical=/utils |
| `/utils/[tool]` | **22 калькулятора** (SSG) | index,follow | – | canonical=self, Breadcrumb+FAQ+WebApplication JSON-LD |
| `/sravnenie-dogovorov` | Сравнение редакций договора + протокол разногласий | index,follow | – | canonical=self, Breadcrumb+FAQ+WebApplication JSON-LD |
| `/blog`, `/blog/[slug]` | Блог | index,follow | – | canonical=self, Article JSON-LD |
| `/contacts`, `/about`, `/help` | Информационные | index,follow | – | – |
| `/preview` | Предпросмотр | **Disallow** | – | – |
| `/login`, `/login/forgot`, `/login/reset` | Авторизация | **Disallow /login** | redirect if auth | noindex |
| `/billing`, `/dashboard`, `/settings*`, `/trash`, `/admin*`, `/security`, `/connections`, `/builder` | ЛК | **Disallow** | auth-only | noindex |
| `/auth/*` | Callback | **Disallow /auth/** | – | – |
| `/api/*` | API | **Disallow /api/** | – | – |
| `/debug/*` | Debug (владелец) | **Disallow /debug** | middleware | – |
| `/approve/[token]` | Подписание | – | mixed | – |
| `/not-found` | Кастомная 404 (для нестандартных нужд) | – | – | – |

## 8. Защита через middleware (`src/middleware.ts`)

```
PROTECTED_PREFIXES = ["/dashboard", "/settings", "/trash", "/billing", "/security", "/connections", "/builder"]
ADMIN_PREFIXES = ["/admin"]
PUBLIC_API_PREFIXES = ["/api"]
PROTECTED_API_PREFIXES (по auth cookie) — все /api/* кроме /api/auth/*, /api/health
```

- `/login` авторизованного → redirect на `/dashboard`.
- `/admin/*` требует `is_admin = true` (cookie или DB fallback).
- AAL2 enforcement: если `aal !== "aal2"` и `requireMfa = true` → redirect на /settings/security.
- Security headers (`withSecurityHeaders()`) применяются ко всем ответам.

## 9. Фоновые задачи (Cron)

На VDS cron выполняется внешним crontab (не Vercel). Два эндпоинта, защищены `CRON_SECRET` (Bearer):

- `POST /api/cron/tsl-refresh` — ежедневно 03:00 MSK, синхронизация TSL Минцифры.
- `POST /api/cron/daily-maintenance` — ежедневно 03:05 MSK; объединяет прежние `/api/cron/auto-renew` (продление PRO-подписок) и `/api/cron/trash-cleanup` (чистка корзины).

Защита: проверка `CRON_SECRET` в заголовке (constant-time сравнение).

## 10. Окружения

| Окружение | URL | Branch | Supabase | Инфраструктура |
|-----------|-----|--------|----------|----------------|
| Local dev | `http://localhost:3100` (Playwright) / 3000 (Next) | feature/* | облачный `.env.local` (`xkakhztknlpzqarklewq.supabase.co`) | `next dev` |
| Production | `https://dogovor.expert` | `production` (CapRover-вебхук) | self-hosted `https://supabase.vds.dogovor.expert` (VDS 82.146.35.220) | VDS/CapRover (Docker standalone, порт 3000) |
| Staging | `https://test.dogovor.expert` | `master` | self-hosted (та же БД) | VDS/CapRover, приложение `dogovor` (деплой вручную из панели) |

**Supabase:** self-hosted на VDS — `https://supabase.vds.dogovor.expert` (прод). Облачный проект `xkakhztknlpzqarklewq.supabase.co` — только локальный dev/.env`.

**Стек .env:**
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — клиент + сервер.
- `SUPABASE_SERVICE_ROLE_KEY` — **ТОЛЬКО** сервер (admin.ts).
- `YOOKASSA_SHOP_ID`, `YOOKASSA_SECRET_KEY` — сервер.
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` — сервер.
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `TELEGRAM_SUPPORT_GROUP_ID` — сервер.
- `DADATA_API_KEY` — сервер.
- `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` — captcha.
- `CRON_SECRET` — защита cron-роутов.
- `RESEND_API_KEY` — email.
- `CHAT_HMAC_SECRET` — подпись чата.
- `SENTRY_*`, `NEXT_PUBLIC_SENTRY_DSN` — мониторинг.
- `NEXT_PUBLIC_APP_URL` (= `https://dogovor.expert`) — для CSRF-сравнения origin.
- `NEXT_PUBLIC_YANDEX_CLIENT_ID`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — OAuth.
- `NEXT_PUBLIC_CHAT_ENABLED` — флаг виджета чата.
- `ADMIN_REQUIRE_2FA` — обязательная 2FA для админа.
- `NEXT_PUBLIC_ADS_ENABLED` (=`1`) — master-флаг рекламы; `NEXT_PUBLIC_RTB_<SLOT>` (напр. `NEXT_PUBLIC_RTB_CONVERTER_FOOTER`) — RTB-блоки РСЯ по слотам (см. `src/lib/ads.ts`). Без них слоты резервируют место, но ничего не показывают.

---

**Последнее обновление:** 2026-09-04 (внедрение системы guardrails).
