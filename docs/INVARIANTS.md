# 🛡️ АРХИТЕКТУРНЫЕ ИНВАРИАНТЫ (НЕ НАРУШАТЬ)

Этот документ фиксирует **непререкаемые правила** проекта dogovor-expert, нарушение которых недопустимо ни при каких обстоятельствах. Каждый инвариант либо подкреплён автоматическим тестом (`src/lib/__tests__/invariants/`), либо описан в `AGENTS.md` (проектно-специфичные детали), либо закреплён в CI.

> **См. также:** `AGENTS.md` (проектно-специфичные правила PDF-экспорта, шаблонов, сканера, RLS, SEO, платежей).

---

## 1. Безопасность данных (RLS & Access Control)

- `SUPABASE_SERVICE_ROLE_KEY` используется **ТОЛЬКО** в server-side коде (`src/lib/supabase/admin.ts`) для административных задач. Запрещено импортировать `@/lib/supabase/admin` в client-компонентах и публичных API-роутах.
- Любая выборка/мутация пользовательских данных (`documents`, `profiles`, `contractors`, `persons`, `payments`, `subscriptions`) ОБЯЗАНА фильтроваться по `user_id` авторизованной сессии **либо** через RLS-политику **либо** явной проверкой `user_id` в коде.
- Миграции **не должны** добавлять клиентские GRANT'ы и политики на `subscriptions`/`payments` (write-lock миграции 009 + 20260902). Подписки и платежи создаются **ТОЛЬКО** через service_role.
- Токен Supabase **не** передаётся в URL (только в httpOnly cookie). Исключение — PKCE code exchange на `/auth/callback` (короткоживущий одноразовый код).

## 2. Аутентификация (CSRF, Rate-Limit, Sessions)

- Каждый мутирующий эндпоинт в `src/app/api/**/route.ts` ОБЯЗАН быть обёрнут в `withCsrf()` **И** иметь проверку `isSameOrigin` (двойной барьер).
- Rate-limits в `src/lib/ratelimit.ts` (Upstash sliding window) — это **обязательный** барьер на `/api/auth/login`, `/api/auth/mfa/verify`, `/api/persons`, `/api/contractors`, `/api/trash`, `/api/feedback`, `/api/leads`, `/api/telegram/webhook` и т.п. Без `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` лимитеры `null` и `checkRateLimit()` **FAIL-CLOSED** (429) в проде; fail-open только в dev при явном `RATELIMIT_DISABLED=1`.
- Вебхук YooKassa: HMAC-подпись (`x-yookassa-signature`, `YOOKASSA_NOTIFICATION_SECRET`, fail-closed) + IP-allowlist (подсети YooKassa + env `YOOKASSA_IP_ALLOWLIST`) + верификация через `GET /v3/payments/{id}` (Basic auth) + сверка `amount`/`currency`. Временный сбой verifyPayment → 5xx (ретрай ЮKassa); недостоверное уведомление → 200.
- `params` и `searchParams` в Next 15 — `Promise` (использовать `await` или `use()`/`React.use`).

## 3. SEO и индексация

- Каждая публичная страница (`page.tsx` в публичных сегментах) обязана экспортировать `metadata` или `generateMetadata` с уникальными `title`/`description` и явным `alternates.canonical`. Предпочтительно через `withSeo(...)` из `@/lib/seo/withSeo` (helper добавляет OG/Twitter); часть страниц использует обычный `export const metadata` с ручным `canonical` — это допустимо, но `canonical` обязателен.
- Запрещено прописывать `canonical` на главную страницу (`/`) для внутренних страниц и страниц ошибок 404. Корневой `layout.tsx` НЕ должен иметь `alternates.canonical` — canonical задаётся **только** на уровне page.
- `not-found.tsx` не должен наследовать канонические ссылки родительских макетов. Обязательно указывать `robots: { index: false, follow: false }` явно.
- Публичные каталожные страницы (`/templates`, `/blanks`, `/utils`, `/blog`) кешируются через `export const revalidate = N` (ISR; на VDS — standalone-режим Next, кеш в рантайме контейнера). Приватные страницы (`/dashboard`, `/billing`, `/settings`, `/trash`, `/admin`, `/security`, `/connections`, `/builder`, `/documents`, `/login*`) **никогда** не должны получать заголовки `public, s-maxage`.
- В `robots.txt` **обязательно** сохранять:
  - блок `User-agent: Yandex` с `Clean-param` для фильтров;
  - параметр `page` в `Clean-param` НЕ допускается (иначе Яндекс не индексирует 2+ страницу пагинации);
  - точные `Disallow: /documents$` (НЕ `Disallow: /documents`, иначе убьёт 369 посадочных).
- Sitemap (`src/app/sitemap.ts`, динамический) — единственный источник. Статический `public/sitemap.xml` **удалён** — не создавать заново.

## 4. Архитектура и SSR

- Все компоненты по умолчанию — серверные (RSC). `"use client"` — только на нижних узлах дерева, где нужна интерактивность (формы, калькуляторы, модалки).
- Supabase-клиенты:
  - `createClient()` из `@/lib/supabase/server` — async, всегда `await`. Используется в Server Components, Server Actions, Route Handlers.
  - `createBrowserClient()` из `@/lib/supabase/client` — только в Client Components.
  - `createClient()` из `@/lib/supabase/admin` — только в server-side коде, **никогда** в Client Components.
- `cookies.setAll()` в Server Components может глотать ошибку (Next.js игнорирует cookies в Server Components) — это корректное поведение, не баг.
- Hydration mismatch между server и client запрещён. Если состояние нужно синхронизировать — `useEffect` + `useState`.

## 5. Валидация входящих данных

- Любой эндпоинт в `src/app/api/**/route.ts` обязан парсить и валидировать тело запроса через **Zod-схему** ДО передачи данных в сервисный слой или БД. Схемы лежат рядом с route или в `@/lib/schemas`.
- Динамические параметры (`[id]`, `[slug]`, `[token]`) — валидировать regex/UUID (например, `UUID_RE` для id документов).
- Content-Type заголовок на POST/PUT/PATCH: ожидаем `application/json` (или `multipart/form-data` для загрузки файлов). При mismatch — 415 Unsupported Media Type.

## 6. Целостность тестирования

- Если функционал меняется, тесты обновляются в соответствии с новыми требованиями. **Запрещено** удалять или "глушить" (`test.skip`, `it.skip`) упавшие тесты без согласования.
- Шаблон `src/data/templates/*.ts` изменился → обновить счётчик в `src/lib/__tests__/templates.test.ts` (текущее значение 369).
- Любое изменение в `src/components/builder/DocScanner.tsx`, `OcrScanner.tsx`, `src/lib/docOcr.ts`, `src/lib/docRequirements.ts` → прогнать `src/lib/__tests__/docScanner.test.ts`.
- Любое изменение в `src/lib/docDesign.ts` → прогнать `src/lib/__tests__/docDesign.test.ts` (токены дизайна зафиксированы тестами).
- Любое изменение в `src/lib/renderDocument.ts` → прогнать `src/lib/__tests__/renderDocument.test.ts` (escape, totals, _total_pretty).

## 7. Деплой и инфраструктура

- Запрещено коммитить `.env`, `.env.local`, `.env.production`, `.env.development`, `*.pem`, `*.key`, секреты Vercel/Supabase/Upstash/YooKassa/DaData/Telegram в git. `.gitignore` покрывает это.
- Запрещено заливать в деплой папки `.vercel`, `.vercel/output`, `.next/cache` (см. AGENTS.md, "Деплой"): в Docker-деплое это контролируется `.dockerignore` и штатной сборкой `next build` (не robocopy).
- `og-image.png` (1200×630) и `apple-icon.png` (180×180) обязаны присутствовать в `public/` — они попадают в Docker-образ вместе с `public/` (в standalone рантайм `public/` копируется явно).
- Версия Next.js: 15.x. **Не обновлять до 16** без согласования (ломает middleware → proxy, Turbopack).

## 8. Запрещённые операции

- ❌ Создавать серверный OCR на базе `occular-*` (блокировано владельцем). Файлы `src/app/api/ocr-proxy/`, `src/app/api/ocr-status/`, `src/lib/occular/*`, `src/lib/docProfiles.ts`, `src/lib/docPlanner.ts`, `src/lib/ocrStatus.ts` — не расширять.
- ❌ Использовать `any` в TypeScript (строгий режим). Для сложных типов — явный `interface`/`type` или `unknown` + type-guard.
- ❌ Добавлять `console.log` в production-коде (только через `@/lib/logger` если нужно).
- ❌ Хардкодить URL/секреты/токены — только через `process.env.*` или импорт из `@/lib/site` / `@/lib/env`.
- ❌ Добавлять новые пакеты без согласования с владельцем (аудит зависимостей — ежемесячно).
- ❌ Менять SEO-инварианты (`/documents/[slug]` SSG, `disallow /documents$` точное, `sitemap.ts` динамический) без отдельного решения.

## 9. Активный скрипт проверки

Перед коммитом запускать:
```bash
npm run verify
# = npm run typecheck && npm run lint && npm run test:unit
```

Pre-commit хук (`.husky/pre-commit`) автоматически запускает `npm run verify`. Если `verify` падает — коммит заблокирован. Это **обязательный** gate, не рекомендация.

## 10. Анти-паттерны, замеченные в проекте (фиксируем как урок)

- **Soft-404:** `canonical=/` на 404-страницах → путаница для Googlebot. Исправлено в `not-found.tsx` (явный `noindex` без canonical).
- **Yandex Clean-param с `page`:** приводит к неиндексации 2+ страницы пагинации. Clean-param использует только фильтры (`cat`, `q`, `view`, `order`, `category`).
- **`--max-warnings=0` в lint-staged:** блокирует ВСЕ коммиты из-за pre-existing warnings. Убран, теперь только `prettier --write`. ESLint запускается на pre-commit целиком.
- **Использование `truncateWord` через `slice`:** обрезает слова посередине. Использовать `truncateWord(str, N)` из `@/lib/format` (обрезание по границе слова + «…»).
- **PDF-баги «на глаз»:** Исправления PDF-экспорта без прогона `pdf-export-verify` skill — гарантия регрессий. Всегда гонять скрипты `e2e-prod-*.cjs` + программный анализ через `pdfjs-dist`.

---

**Последнее обновление:** 2026-09-04 (внедрение системы guardrails).
