# Глубокий code-review и аудит инструментов — Dogovor.expert

**Дата:** 31.08.2026
**Объект:** `D:\Мои сайты\site Dogovor`
**Метод:** параллельный статический анализ 3 агентами (код/баги, инструменты/тесты/CI, безопасность/биллинг). Все находки подтверждены чтением исходников. Правки НЕ вносились — только исследование.

---

## Сводка по серьёзности

| Категория | Критично | Средне | Низко/мелочи |
|---|---|---|---|
| Баги в коде (`src/`) | 1 (тихая потеря лидов/фидбека) | 6 | 11 |
| Инструменты/тесты/CI | 1 (битый CI: нет `tsx`) + 1 (нет `@napi-rs/canvas` в deps) | 2 (мёртвые скрипты, CI без тестов) | 6 |
| Безопасность/биллинг | 4 (CSRF-списание, миграции, IDOR-чат, storage anon-upload) | 9 | — |

**Итоговая оценка проекта снизилась до 7.9/10** — функционал и ядро сильные, но вскрылись реальные баги бэкенда и сломанный CI.

---

## 🔴 КРИТИЧЕСКИЕ — исправить в первую очередь

### A. Безопасность / биллинг

**1. `billing/auto-renew` — реальное списание без CSRF и rate-limit**
`src/app/api/billing/auto-renew/route.ts:7–12,43–57`. Роут аутентифицирует юзера, но не делает `isSameOrigin(req)` и не лимитирует. Сразу списывает с сохранённой карты.
→ CSRF: посторонний сайт заставляет авторизованную жертву оплатить. **Фикс:** добавить `isSameOrigin` + `checkRateLimit`.

**2. Колонки `deleted_at` / `is_favorite` используются в коде, но отсутствуют во ВСЕХ миграциях**
Код: `src/app/api/documents/route.ts:13,15`, `documents/[id]/route.ts:25,27,71`, `trash/route.ts:13–15,37,58,61`. Миграции `supabase/migrations/*.sql` — 0 совпадений по `deleted_at`/`is_favorite`.
→ Корзина и избранное падают (P0) либо удаляют жёстко вместо soft-delete (потеря данных) при накате схемы из репо. **Фикс:** миграция `alter table documents add column if not exists deleted_at timestamptz; add column if not exists is_favorite boolean not null default false;` + сверить прод-БД.

**3. Чат поддержки: чтение чужих сообщений по `visitorId` без аутентификации (IDOR/PII)**
`src/app/api/chat/route.ts:25–37`. `GET ?visitorId=` возвращает переписку (имя/email/текст), ID не привязан к сессии.
→ Утечка PII при известном/перехваченном ID. **Фикс:** привязать к сессии юзера или подписывать ID HMAC-токеном сервера.

**4. Storage `feedback`: любой anon может загружать файлы в ПУБЛИЧНЫЙ бакет**
`supabase/migrations/20260822_feedback.sql:65–77` — политика `feedback_upload_anon` проверяет только `bucket_id`, без привязки к юзеру; бакет `public=true`.
→ Хостинг вредоносного/фишингового контента на вашем домене. **Фикс:** загружать через service_role с уникальным путём ИЛИ ограничить политику путём/квотой и запретить исполняемые типы, ИЛИ сделать бакет приватным + подписанные URL.

### B. Инструменты / CI

**5. `tsx` НЕ установлен — падает CI и все `npm run generate:*`**
`package.json:15` (`generate:blank-previews": "tsx ...`), `scripts/check-template-sync.mts` (запускается в CI `.github/workflows/sync-check.yml`). `tsx` нет в deps, `node_modules/.bin/tsx` отсутствует.
→ `npm ci` ставит без tsx; CI-шаг `npx tsx scripts/check-template-sync.mts` нестабилен/упадёт. **Фикс:** добавить `tsx` в devDependencies ИЛИ переделать скрипт в `.mjs` без `@/`-алиасов и запускать через `node`.

**6. `@napi-rs/canvas` не объявлен в package.json**
`scripts/generate-blank-previews.mts:19` импортирует `@napi-rs/canvas`, которого нет в deps (есть только локально в node_modules). При `npm ci` упадёт `Cannot find module`.
→ **Фикс:** добавить `@napi-rs/canvas` в dependencies.

---

## 🟠 СРЕДНИЕ

### Код (`src/`)
- **`mail.ts:21–42,54–58`** — `sendEmail`/`sendTelegram` не проверяют `res.ok`, всегда `return true`. Тихая потеря писем/лидов/фидбека.
- **`useRutoken.ts`** — мёртвый код (не импортируется) + утечка `setInterval` при размонтировании (нет cleanup в useEffect). Удалить или починить.
- **`renderDocument.ts:419–432`** — `applyBlankMarkers` глушит `void mode`; вызовы `..., "pdf"/"docx"` не дают разного представления (несоответствие доке/коду).
- **`LivePreviewPanel.tsx:41`** — `renderPreview()` (Mustache+DOMPurify) вызывается на каждом ререндере без `useMemo` → тормозит конструктор. Обернуть в `useMemo` + `onPagesChange` в `useCallback`.
- **`billing/auto-renew` vs `auto-renewal`** — два похожих роута (различаются буквой `l`); дублирование «найти активную подписку» в 3 местах (`webhook`, `recurring.ts`, `auto-renew*`). Вынести в `lib/billing/`.
- **`useRutoken.ts`** — обильный `any`; квалификация сертификата по `subject.includes('INN')` (хрупко, не по OID). Типизировать + проверять OID/издателя.
- **`chat-store.ts:97`** — асимметрия сериализации профиля (JSON.stringify vs авто). Выбрать единый подход.

### Инструменты
- **Мёртвые скрипты** на несуществующие файлы/роуты: `check-proto.mjs:2` (`D:/scanner-concepts.html` нет), `check-redesign.mjs:9` (`builder-panels-redesign.html` нет), `preview-menu.mjs:4` (`/dev-menu` нет). Удалить.
- **`fix-escape.js`** (корень, в git) — заменяет строку на идентичную (ничего не делает). Удалить + добавить `fix-*.js` в .gitignore.
- **CI** (`.github/workflows/sync-check.yml`) — не гоняет `lint`/`vitest`/`e2e`; `node-version: '22'` ≠ `engines.node: "24.x"`. Добавить тесты в CI, привести Node к 24.
- **27+ лог-файлов** в корне (хоть и в `.gitignore`) — мусор, удалить с диска.
- **`audit/`** дублирует playwright-конфиг — вынести/удалить.

### Безопасность
- **`dadata/route.ts:90,150`** — проксирует пользовательский `apiKey` (открытый прокси к Dadata). Запретить клиентский ключ.
- **`CRON_SECRET` не задан** (`cron/auto-renew`, `cron/trash-cleanup` всегда 401) — автопродление по расписанию не работает (полагается на ленивый путь `subscription-status`). Задать секрет в Vercel.
- **`leads/route.ts:84`** PATCH без `isSameOrigin` (CSRF смены статуса).
- **`.env.local`/`.env.production`** с реальными секретами лежат в директории проекта (в git не попадают, но риск утечки при копировании/смене .gitignore). Вынесите в Vercel env, ротируйте при необходимости.
- **`cloud/refresh-token`** минтит Google token по клиентскому refresh_token — архитектурно неверно (refresh_token не должен ходить на сервер).
- **`subscription-status`** дёргает ЮKassa на каждый GET — кешировать результат на сутки.
- **`admin/export`** (CSV) без rate-limit/лога в `admin_audit`.

### Функционал (возможности добавить)
- **Тесты на Vault/Connections/Billing/Chat** — критичный security-код (`src/lib/vault/*`, SupportLauncher) не покрыт автотестами в CI (только ручные скрипты).
- **`converter/download.ts:10,21`** — `URL.revokeObjectURL` через 5с может оборвать скачивание крупного файла. Убрать ручной revoke (file-saver сам управляет).
- **`UKEPSigner.tsx:32–39`** — мёртвая ветка Rutoken («будет в следующем обновлении»). Скрыть кнопку или реализовать.
- **`pricing.ts:12`** — хардкод даты акции `2026-09-20`. Вынести в env/CMS.

---

## 🟢 Что сделано ХОРОШО (не трогать)
- RLS на всех 12 таблицах, строгие `auth.uid()=user_id` политики.
- Защита от самоповышения до admin (`009_billing_write_lock` + отзыв UPDATE на `profiles`).
- Биллинг-вебхук: idempotency (`.neq("status","paid")` + guard) + повторная сверка суммы/валюты с API ЮKassa.
- Нет open-redirect в `auth/callback` (`safeNext`).
- Защита от mass-assignment (`documents/[id]`, `profile`, `import`).
- Защита от email-бомбинга (только свой email) + PDF-magic + лимит 10 МБ.
- Telegram-вебхук: constant-time `secret_token` + проверка группы/треда.
- Rate-limit на публичных формах (fail-closed при отсутствии Redis).
- CSV-injection защита в `admin/export`.
- DOMPurify в рендере документов; `getAdminUser()` в каждом `/api/admin/*`.

---

## План исправлений (предлагаемый порядок)
1. Миграция `deleted_at`/`is_favorite` (П.2) — иначе корзина сломана.
2. `billing/auto-renew` CSRF+rate-limit (П.1).
3. `mail.ts` проверка `res.ok` (тихая потеря лидов).
4. Чат IDOR (П.3) + storage anon-upload (П.4).
5. CI: добавить `tsx`+`@napi-rs/canvas`, запускать lint/vitest/e2e, Node 24.
6. Удалить мёртвые скрипты/код (`useRutoken`, `check-proto`, `check-redesign`, `preview-menu`, `fix-escape.js`).
7. `LivePreviewPanel` useMemo (производительность конструктора).
8. Вынесение секретов из `.env.production`/`.env.local` в Vercel.

*Детальные отчёты агентов сохранены в истории сессии. Данный файл — сводка.*
