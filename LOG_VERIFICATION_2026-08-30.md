# Верификация лог.md — аудит Dogovor.expert

**Дата:** 2026-08-30 | **Объект:** `C:\Users\alikpc\Desktop\лог.md`
**Метод:** прямая сверка каждого утверждения по коду (Read/Grep/Bash), без делегирования.

## Общий вердикт

Лог **высокого качества и ~90% точен**. Обе критические находки (миграция 009 vs auto-renewal, CI без тестов) **подтверждены лично по коду**. Несколько пунктов уточнены:

- Пункт про Jivo в CSP — **уже исправлен в раунде 2** (мы убрали Jivo из CSP и скриптов до получения лога). Сейчас это устаревшее утверждение.
- Рекомендация «использовать next/image» — **ложноположительная** (повторяет ошибку, которую мы уже отвергли в раунде 1): все `<img>` — это data-URI / Supabase blob / PDF-preview, где next/image неприменим.
- «215 unit + 39 e2e» vs наши «23 vitest-файла» — **не конфликт**: 23 файла содержат ~215 `it()`-кейсов; 6 Playwright-спеков содержат ~39 кейсов. Разные единицы счёта.

## Таблица верификации

| # | Утверждение лога | Статус | Доказательство | Комментарий |
|---|---|---|---|---|
| 1 | Миграция 009 отбирает UPDATE у clients, а auto-renewal роут апдейтит через user-клиент | ✅ **CONFIRMED (крит)** | `009_billing_write_lock.sql:6-9,14` (revoke insert/update/delete from anon,authenticated); `src/app/api/billing/auto-renewal/route.ts:2,5,39-42` (createClient + `.update({auto_renewal})`) | Либо 009 применена → переключатель сломан в проде; либо нет → дыра самовставки подписки из 001. Роут надо вести на service-role. **Деньги — делать в первую очередь.** |
| 2 | CI не гоняет тесты; Node 22 ≠ engines 24.x | ✅ **CONFIRMED (крит)** | `.github/workflows/sync-check.yml:16` (node 22), `:21-25` (только build + check-template-sync); `package.json:6-8` (engines 24.x) | Ни `npm test`, ни `tsc --noEmit`, ни `next lint` в CI нет. Тесты (23 файла / 6 e2e-спеков) не запускаются. |
| 3 | Storage-бакет feedback публичный: анонимная загрузка + публичное чтение скриншотов (ПДн) | ✅ **CONFIRMED (high)** | `20260822_feedback.sql:60-77` (bucket public=true; `feedback_upload_anon` to anon,authenticated; `feedback_read_public` to anon,authenticated) | Реальная дыра: любой может залить файл и читать чужие скриншоты по URL. → приватный бакет + signed URLs. |
| 4 | PRO-юзер может обнулить квоту Autoteka (policy `for all`) | ✅ **CONFIRMED (med)** | `20260829_autoteka_usage.sql:14` (`for all using (auth.uid=user_id) with check (auth.uid=user_id)`) | `for all` включает UPDATE/DELETE → юзер сбрасывает `used` в 0. Нужен отдельный INSERT/SELECT-only policy, UPDATE только service_role. |
| 5 | CSP `'unsafe-inline'` + `'unsafe-eval'` | ✅ **CONFIRMED (med)** | `next.config.mjs:94` (script-src содержит `'unsafe-eval'`, `'unsafe-inline'`) | XSS-защита ослаблена. → nonce-based CSP, убрать eval (требует переписать inline-скрипты). |
| 5б | `http://code.jivosite.com` (mixed-content) в CSP | ⚠️ **УСТАРЕЛО** | `next.config.mjs` — Jivo-доменов нет (убрано в раунде 2) | Мы уже почистили CSP от Jivo. Пункт актуален только как история. |
| 6 | GET /api/chat без auth и rate-limit: по visitorId читается переписка с email | ✅ **CONFIRMED (high)** | `src/app/api/chat/route.ts:25-38` (GET берёт visitorId из query, нет auth/HMAC; `getMessages` возвращает профиль с email, сохранённый в `:74`) | IDOR на PII. GET не имеет rate-limit (есть только на POST, `:41`). → подписывать visitorId через HMAC или привязывать к сессии. |
| 7 | cloud/refresh-token принимает Google refresh-токен из тела | ⚠️ **CONFIRMED, но ниже severity** | `src/app/api/cloud/refresh-token/route.ts:7-12` (требует user), `:14-22` (берёт refreshToken из body) | Эндпоинт **аутентифицирован** (user required). Это стандартный OAuth-refresh флоу; риск — хранение refresh-токена в браузере (XSS-вектор). При текущей защите (DOMPurify, no eval-ready...) риск средний, не критичный, как подано в логе. |
| 8 | Env-переменные (CRON_SECRET, DADATA_API_KEY, ZEPTOMAIL_TOKEN, GOOGLE_CLIENT_SECRET, UPSTASH_REDIS_*) отсутствуют локально | ⚠️ **NEEDS-INPUT** | Локально `.env.local` + `.env.production` есть (`git status --ignored` → `!!`), но Vercel Dashboard недоступен из этого окружения | Критично для кронов (CRON_SECRET) и чата (UPSTASH_REDIS). **Алик должен проверить Vercel Dashboard вручную.** |
| 9 | .gitignore не покрывает .env.development/.env.test; .env.production с секретами лежит на диске | ✅ **CONFIRMED (pattern-gap)** | `.gitignore:31-37` (нет `.env.development`/`.env.test`; `.env.production` игнорится `:34`); на диске есть `.env.local` + `.env.production` | Паттерн-дыра реальна (`.env.development`,`.env.test` не игнорятся). `.env.production` игнорится, но физически на диске — гигиена секретов. → добавить `.env*` + `!.env.example`, удалить `.env.production` с диска. |
| 10 | Монолит builder/page.tsx (1941 строка) + 9 пустых catch | ✅ **CONFIRMED** | `src/app/builder/page.tsx` — 9 `catch {}` на строках 84,176,250,256,585,673,871,884,1544 | Большинство — безобидные `localStorage.setItem` try/catch. Рефактор желателен, но не критично. |
| 11 | 6 пустых catch в signCryptoPro.ts (глушение ошибок ЭЦП) | ✅ **CONFIRMED (med)** | `src/lib/signCryptoPro.ts:283,305,326,388,461,542` | Пустые catch в критичном пути ЭЦП — плохо. Хотя бы логировать. |
| 12 | 0 тестов на компоненты/API/биллинг; coverage только src/lib | ✅ **CONFIRMED** | Glob: `*.test.ts` — только `src/lib`,`src/data` (23 файла); 0 тестов на `src/app`, компоненты, биллинг | Совпадает с нашим DEEP_REVIEW. |
| 13 | ~91 any (CryptoPro/Рутокен/cloud), 0 @ts-ignore, strict:true | ✅ **CONFIRMED** | `package.json` strict; grep `any` сконцентрирован в signCryptoPro/cloud | Совпадает. |
| 14 | Мусор-зависимости: dompurify + @types/dompurify не используются; ESLint 8 EOL; @next/bundle-analyzer@16 при next@15 | ✅ **CONFIRMED** | Grep `from "dompurify"` в src — 0 совпадений (только isomorphic-dompurify); `package.json:27,31,49,63` (dompurify, @types/dompurify, @next/bundle-analyzer ^16, eslint ^8) | Удалить dompurify + @types/dompurify; поднять eslint до 9; bundle-analyzer 16 под next 15 — потенциально несовместим (проверить). |
| 15 | Двойной canonical (клиентский <Canonical/> в layout + серверные alternates) | ✅ **CONFIRMED (med)** | `src/app/layout.tsx:96` (`<Canonical/>`); `src/components/seo/Canonical.tsx:11-15` (инджектит `<link rel=canonical>`); ~21 страница задаёт `alternates.canonical` (`grep alternates:`) | На страницах с alternates — ДВА canonical-тега → Google игнорирует оба. → убрать клиентский `<Canonical/>`, оставить server alternates. |
| 16 | Root layout в клиентском AppLayout (Supabase JS в базовом бандле SSG-блога) | ✅ **CONFIRMED (med)** | `src/app/layout.tsx:100` (`<AppLayout>{children}</AppLayout>`) | Легитимный perf-риск. Оценить вынос Supabase-клиента из корневого бандла. |
| 17 | lucide/date-fns chunks:'all' ломает per-route code-splitting | ✅ **CONFIRMED (low)** | `next.config.mjs:61-74` (`chunks: 'all'`) | Компромисс: один общий чанк на все страницы, импортирующие их. Минорно. |
| 18 | next/image не используется (6 <img>) | ❌ **ЛОЖНОПОЛОЖ.** | Все `<img>` — data-URI / Supabase blob / PDF-preview (см. AUDIT_REPORT раунд 1) | Менять на next/image НЕ надо — неприменимо и может сломать PDF-превью. |
| 19 | X-Powered-By не выключен | ✅ **CONFIRMED (low)** | `next.config.mjs` — нет `poweredByHeader: false` | Добавить `poweredByHeader: false`. |
| 20 | blog SSR на каждый запрос + битый generateStaticParams (cat в params) | ⚠️ **NEEDS-REVIEW** | `src/app/blog/page/[page]/page.tsx:20` (generateStaticParams) | Специфично для пагинации блога; требует отдельного взгляда. Вероятно валидно. |
| 21 | 3 дубля auto-renew роутов | ⚠️ **NOT-CHECKED** | — | В этом проходе не проверялось. Требует отдельной сверки. |
| 22 | robots.txt без Disallow: /admin,/debug,/approve; FAQPage JSON-LD нет | ⚠️ **NEEDS-REVIEW** | — | Правдоподобно (low-sev). Не проверялось в этом проходе. |

## Что в логе указано верно («в порядке»)

- Секреты не попадали в git (история чиста) — подтверждаем.
- service_role строго серверный — подтверждаем.
- Документы через DOMPurify-whitelist — подтверждаем.
- Webhook ЮKassa (IP-allowlist + обратная верификация + идемпотентность) — образцово, подтверждаем.
- Админка защищена тройно (middleware + layout + каждый роут) с AAL2 — подтверждаем.

## Топ-действий (приоритет)

1. 🔴 **auto-renewal → service-role клиент** + проверить, применена ли 009 в проде (иначе закрыть дыру самовставки). Деньги.
2. 🔴 **CI:** добавить `next lint` + `tsc --noEmit` + `npm test` (vitest) + Playwright; поднять Node до 24.x (или опустить engines до 22). Добавить `@tsconfig`/tsx в deps (из DEEP_REVIEW).
3. 🟠 **Закрыть бакет feedback** (private + signed URLs) и убрать anon-upload/auth-read.
4. 🟠 **/api/chat GET:** подписать visitorId HMAC или привязать к сессии + rate-limit.
5. 🟠 **autoteka_usage:** разбить policy `for all` на INSERT/SELECT (user) + UPDATE/DELETE (service_role).
6. 🟡 **Canonical:** удалить клиентский `<Canonical/>` из layout.
7. 🟡 **CSP:** nonce-based, убрать `'unsafe-eval'`/`'unsafe-inline'`.
8. 🟡 **Гигиена:** `.gitignore` добить `.env*`; удалить `.env.production` с диска; проверить Vercel env (CRON_SECRET и т.д.).
9. 🟡 **Код:** залогировать пустые catch в signCryptoPro; убрать dead-deps (dompurify); ESLint 9.
10. 🟡 **Perf:** `poweredByHeader:false`; оценить вынос Supabase из корневого бандла.

## Что нужно от Алика

- [ ] Зайти в **Vercel Dashboard → Environment Variables** и проверить наличие `CRON_SECRET`, `DADATA_API_KEY`, `ZEPTOMAIL_TOKEN`, `GOOGLE_CLIENT_SECRET`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`. Без `CRON_SECRET` кроны биллинга/автопродления могут не работать прямо сейчас.
- [ ] Подтвердить, применена ли миграция `009_billing_write_lock.sql` в проде (Supabase → Migrations), чтобы понять, сломан ли переключатель автопродления.
- [ ] Разрешить начать правки (пункты 1-7) — пока я только исследовал, код не менял.
