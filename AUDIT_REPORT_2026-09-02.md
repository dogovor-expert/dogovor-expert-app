# Аудит — 02.09.2026

**Объект:** `D:\Мои сайты\site Dogovor` (Next.js 15.5.23, React 19, Supabase, ЮKassa, CryptoPro)
**Объём проверки:** `src/app/api/**` (32 роута), `src/lib/{csrf,admin-auth,signCryptoPro}.ts`, `src/components/{auth,feedback,builder,ui}/**`, `next.config.mjs`, `tsconfig.json`, `package.json`, миграции Supabase, `npm audit`/`lint`/`tsc --noEmit`.
**Контекст:** за предыдущими 2 раундами (30-31.08) уже закрыты критические C1-C6, H1-H7, L1-L2, M3/M4/M9/M13/M14. Этот раунд ищет то, что осталось.

---

## Резюме (TL;DR)

- **4 новые реальные проблемы безопасности/логики** в API (документы, refresh-token, admin export, CSRF).
- **1 нарушение 63-ФЗ** в CryptoPro: TSA-метка фейковая, проверка отзыва отключена.
- **1 устаревший pipeline**: CI lint-step проходит с 185 ошибками (storybook `no-undef`), build отключает eslint.
- **a11y gap** в `LoginForm`/`FeedbackForm` — нет `label htmlFor`, placeholder-only метки, нет `aria-live`.
- **3 транзитивных npm-уязвимости** (image-size DoS в Storybook — не в проде, crypto-browserify — low).

---

## 1. Критические / высокие

### 🔴 C7 `PATCH /api/documents/[id]` — whitelist позволяет `deleted_at`, `status`, `template_id`
**Файл:** `src/app/api/documents/[id]/route.ts:18-27`

```ts
const allowedFields = [
  "title","fields","checklist","versions",
  "status","template_id","is_favorite","deleted_at",
];
```

**Эксплойты:**
- `PATCH {deleted_at: null}` → восстановить документ из корзины в обход логики.
- `PATCH {status: "trashed"}` → «удалить» без DELETE-вызова (нарушает аудит).
- `PATCH {template_id: "..."}` → сменить шаблон (ломает историю версий).
- `PATCH {deleted_at: "2020-01-01"}` → подделать дату удаления.

**Фикс:**
```ts
const allowedFields = ["title","fields","checklist","versions","is_favorite"] as const;
```
Логика корзины — только в `DELETE` (там она уже есть, lines 69-73). Время: 5 мин.

---

### 🔴 C8 `POST /api/cloud/refresh-token` — клиент шлёт `refreshToken` (M8 из плана, **не закрыт**)
**Файл:** `src/app/api/cloud/refresh-token/route.ts:16,33`

Сервер принимает `body.refreshToken` и проксирует его в Google. Клиент не должен владеть refresh-токеном — он должен лежать в Supabase (`cloud_tokens` с RLS), а сервер сам подтягивает по `user.id`.

```ts
const { provider, refreshToken } = body;        // ❌
...
refresh_token: refreshToken,                    // ❌
```

**Дополнительно:** нет rate-limit (можно перебирать refresh-токены).

**Фикс:**
1. Убрать `body.refreshToken`.
2. `loadCloudTokens(user.id)` → взять сохранённый `refresh_token`.
3. Добавить rate-limit (Upstash, `authLimiter`).
4. Использовать `withCsrf`.

---

### 🔴 C9 `GET /api/admin/export` — без rate-limit, без audit log, читает приватный `feedback` (M10 из плана, **не закрыт**)
**Файл:** `src/app/api/admin/export/route.ts:26-117`

CSV-экспорт `feedback.csv` содержит **email + message** (PII). Нет записи в `admin_audit` (таблица создана миграцией `20260823_admin_audit`, но не используется). Нет лимита строк.

**Фикс:**
1. В `admin/export` начало — `insert({ actor: admin.id, action: "export", target: type, ip: ... })` в `admin_audit`.
2. Добавить rate-limit (например, 5 экспортов/час).
3. Опционально: пагинация или `LIMIT 10000` на большие таблицы.

---

### 🟠 C10 CSRF покрытие — **8+ mutating роутов без защиты**
**Файлы:** `lib/csrf.ts`, `lib/admin-auth.ts:66-74`, проверены 32 API-роута.

| Роут | Метод | CSRF |
|---|---|---|
| `/api/billing/auto-renew` | POST | ✅ `isSameOrigin` |
| `/api/profile` | PATCH/DELETE | ✅ `withCsrf` + `isSameOrigin` |
| `/api/leads` | PATCH | ✅ `isSameOrigin` |
| `/api/feedback` | PATCH | ✅ `isSameOrigin` |
| **`/api/billing/create-payment`** | POST | ❌ |
| **`/api/autoteka/pay`** | POST | ❌ |
| **`/api/approval`** | POST | ❌ |
| **`/api/documents`** | POST | ❌ |
| **`/api/documents/[id]`** | PATCH/DELETE | ❌ (+ C7) |
| **`/api/contractors`** | POST/DELETE | ❌ |
| **`/api/persons`** | POST/DELETE | ❌ |
| **`/api/import`** | POST | ❌ (+ C11) |
| **`/api/auth/login`** | POST | ❌ |
| **`/api/cloud/refresh-token`** | POST | ❌ (+ C8) |
| **`/api/feedback`** | POST | ❌ (только PATCH защищён) |

**Дополнительный гэп в `lib/admin-auth.ts:67-68`:**
```ts
const origin = req.headers.get("origin");
if (!origin) return true; // ❌ пропускает запросы без Origin
```
Атакующий через инструменты/прокси, не шлющие Origin, проходит.

**Фикс (2 часа):**
1. Унифицировать: везде `withCsrf` обёртка + `isSameOrigin` belt-and-suspenders.
2. Удалить `if (!origin) return true` из `isSameOrigin` для CSRF-критичных (заменить на `return false`).
3. Либо принять политику "не шлёшь Origin — отказ", либо переписать на `withCsrf` (там логика уже строже).

---

### 🟠 C11 `POST /api/import` — молча перезаписывает черновики через `upsert`
**Файл:** `src/app/api/import/route.ts:44-46`

```ts
.upsert(rows, { onConflict: "user_id,template_id" })
```

`ALLOWED_TEMPLATE_IDS` — hardcoded список 14 шаблонов (lines 7-12), в системе 369. Если template_id не из списка — падает с 500. Если в списке и совпадает с существующим — **перезапись без подтверждения**.

**Фикс:**
1. Заменить whitelist на динамическую проверку: `LEGAL_TEMPLATES.some(t => t.id === templateId)`.
2. Сначала `SELECT` существующих, вернуть 409 Conflict если есть, либо явно спросить `force: true` в теле.

---

## 2. Бизнес-логика / комплаенс

### 🟠 B1 CryptoPro: TSA фейк + проверка отзыва отключена
**Файл:** `src/lib/signCryptoPro.ts`

- **Line 519:** `validateCertificate(thumbprint, { checkRevocation: false, checkChain: true })` — даже если бы `checkRevocation` работал, его явно отключают.
- **Lines 477-505 (`checkRevocation`):** возвращает 'unknown'/'offline', реального CRL/OCSP HTTP-запроса нет. Код **вводит в заблуждение**: юзер видит `warnings.push('Не удалось проверить отзыв')`, но подпись всё равно проходит.
- **Lines 545-557 + 574-582 (TSA):** `propset_TSAAddress(tsaUrl)` ставится, но **реального HTTP-запроса к TSA нет** (только `console.warn`). CAdES-X-Long Type 1 заявлен (line 570-572), но без TSA-токена это фактически CAdES-BES.
- **Lines 701-709 (`isQualifiedCertificate`):** определяет квалифицированность по OGRN/SNILS/INN в subjectName. **Dead code** — не вызывается нигде.

**Юридический риск:** заявлена «квалифицированная подпись с меткой времени», реально — BES без TSA. Это нарушает 63-ФЗ «Об электронной подписи». Для B2B/B2G документов критично.

**Фикс (3-5 дней):**
1. Реализовать HTTP-запрос к TSA (например, `freetsa.org` или `taxcom.ru`).
2. Получать реальный CRL/OCSP через `fetch(url, { redirect: 'follow' })`, парсить ASN.1.
3. Использовать `id-kp-qcSign` (1.2.643.7.1.1.1.1) для проверки квалифицированности.
4. Удалить dead code `isQualifiedCertificate` или подключить к `validateCertificate`.
5. В UI явно показывать, какой уровень подписи получился (BES / X-Long), и блокировать подписание, если заявлен X-Long, а TSA не ответил.

---

## 3. Pipeline / CI

### 🟡 P1 CI lint-step: 185 errors проходят молча
**Команда:** `npm run lint` → `185 errors, 2200 warnings`.

Большинство ошибок — `no-undef` (`console`, `process`, `document`) в storybook-файлах и e2e, где они легитимны, плюс `parserOptions.project` parsing errors и `Empty block statement` в тестовых скриптах.

`tsc --noEmit` — **0 ошибок**. Только lint шумит.

`next.config.mjs:13` — `eslint: { ignoreDuringBuilds: true }` — **отключает** ESLint в build. Сборка проходит даже с ошибками.

**Риск:** регрессии проскакивают в main. CI ловит lint как «успех», потому что в одном из конфигов eslint-config настроен нестрого для storybook/e2e (видимо, через `parserOptions.project` override).

**Фикс (1 час):**
1. Создать `.eslintrc.storybook.json` с override `env: { browser: true, node: false }`.
2. Создать `.eslintrc.e2e.json` аналогично.
3. В `package.json`: `"lint": "eslint . --max-warnings=0"` уже стоит. Проверить, что CI падает на errors.
4. Убрать `ignoreDuringBuilds: true` из `next.config.mjs` после починки lint.

---

### 🟢 P2 `npm audit` — 7 уязвимостей (транзитивные)
- **2 high:** `image-size` ≤2.0.2 (DoS через ICNS/JXL/HEIF) — **только в `@storybook/nextjs`**, не в проде.
- **5 low:** `crypto-browserify`, `elliptic` — через Storybook / node-polyfill.

**Фикс:** `npm update` Storybook до 8.4+ (`image-size` зафиксен в 2.0.3). Не блокер для прода.

---

## 4. A11y

### 🟠 A1 `LoginForm` — placeholder-only метки, нет `aria-describedby`
**Файл:** `src/components/auth/LoginForm.tsx` (107 строк)

- `aria-invalid` есть (lines 77, 92). ✅
- **Нет** `aria-describedby` для связи `<p>` ошибок с инпутами.
- **Нет** `<label htmlFor>` + `id` на инпутах. Placeholder-only метки. Скрин-ридер прочитает только placeholder.
- **Нет** `autoComplete="email"` / `autoComplete="current-password"` — браузер не подскажет пароль.
- `serverError` (lines 96-100) — без `role="alert"` или `aria-live`.
- `/api/auth/login` — без CSRF (см. C10).

**Фикс (1 час):** добавить `<label htmlFor="email">`, `id="email"`, `autoComplete`, `aria-describedby` на ошибки, `role="alert"` на `serverError`.

### 🟠 A2 `FeedbackForm` — нарушение ARIA radiogroup pattern
**Файл:** `src/components/feedback/FeedbackForm.tsx` (430 строк)

- Радио-карточки типов обращения (lines 222-247): `<fieldset><legend>` правильно, но внутри `<button>`-ы, не `<input type="radio">`. Скрин-ридер не объявляет "radio button", только "button".
- Поля: «Какой документ» (254-260), «Какой инструмент» (286-307), `textarea` (312-318), email (379-389) — `<label>` без `htmlFor` + без `id`. **Не связаны**.
- Чекбокс согласия (lines 392-403) содержит `<a target="_blank">` без предупреждения о новом окне.
- `status` (submitting/success/error) — **нет** `aria-live` / `aria-busy`. Скрин-ридер не озвучит изменение.
- `errors.*` — `<p>` без `role="alert"` или `aria-describedby`.

**Фикс (3-4 часа):** заменить `<button>` на `<input type="radio">` или `role="radio" aria-checked={active}`, связать `<label htmlFor>` + `id`, добавить `aria-live="polite"` на success/error блоки.

### ✅ A3 `PaywallModal` — a11y OK
**Файл:** `src/components/ui/Modal.tsx` (134 строки)

- `role="dialog"`, `aria-modal="true"`, `aria-labelledby="modal-title"` ✅
- Focus trap на Tab, ESC-handler ✅
- Возврат фокуса на предыдущий элемент ✅
- `aria-label="Закрыть"` на close-кнопке ✅
- `createPortal` в `document.body` ✅

Закрыто.

---

## 5. Сводный список фиксов (приоритизированный)

| # | Что | Файл | Время | Приоритет |
|---|---|---|---|---|
| C7 | Убрать `deleted_at`/`status`/`template_id` из whitelist PATCH | `api/documents/[id]/route.ts:18-27` | 5 мин | 🔴 |
| C8 | Сервер сам берёт refresh_token (убрать из body) | `api/cloud/refresh-token/route.ts:16,33` | 2 ч | 🔴 |
| C9 | audit log + rate-limit на admin/export | `api/admin/export/route.ts:26-117` | 2 ч | 🔴 |
| C10 | `withCsrf` на 8+ mutating роутах, починить `isSameOrigin` | `lib/csrf.ts`, `lib/admin-auth.ts:66-74`, 8+ routes | 3 ч | 🔴 |
| C11 | Заменить `upsert` на явный конфликт-чек в import | `api/import/route.ts:44-46` | 1 ч | 🟠 |
| B1 | Реальный TSA-запрос + проверка отзыва | `lib/signCryptoPro.ts:477-582` | 3-5 дн | 🟠 |
| P1 | Починить eslint (storybook/e2e overrides) + убрать `ignoreDuringBuilds` | `next.config.mjs:13`, `.eslintrc.*` | 1 ч | 🟡 |
| P2 | `npm update` Storybook ≥8.4 | `package.json` | 5 мин | 🟢 |
| A1 | LoginForm: `htmlFor`/`id`/`aria-describedby`/`autoComplete`/`role="alert"` | `components/auth/LoginForm.tsx` | 1 ч | 🟠 |
| A2 | FeedbackForm: `radiogroup` паттерн + `htmlFor`/`id` + `aria-live` | `components/feedback/FeedbackForm.tsx` | 3-4 ч | 🟠 |

**Оценка:** ~7-10 рабочих дней (включая B1). Без B1 — **1-2 дня**.

---

## 6. Что НЕ проблема (закрыто)

- ✅ M2 (10× пустых catch в `builder/page.tsx`) — все catch осмысленные, только UX-fallbacks.
- ✅ M3 (`useMemo` в builder) — уже на месте (lines 706, 715, 728).
- ✅ A3 PaywallModal — a11y ОК.
- ✅ `<Modal>` — реализован правильно.
- ✅ `dangerouslyAllowSVG` в `next.config` — отключён.
- ✅ `poweredByHeader: false` (L1).
- ✅ CSRF в dev пропускается (для удобства), в проде — строго.
- ✅ `tsc --noEmit` — 0 ошибок.
- ✅ CSP nonce + `strict-dynamic` в middleware.
- ✅ Ротируемые API-ключи ЮKassa/ZeptoMail/Sentry в env.
- ✅ CSV formula injection защита в admin/export.
- ✅ BOM в admin/export для Excel.

---

## 7. Открытые из MASTER_FIX_PLAN.md (не закрыты этим раундом)

- **M1** (6 пустых catch в `signCryptoPro.ts`) — **не критичны** (обёртки COM-объекта, fallback), план можно закрыть.
- **M5–M7, M11, M12, M15, M16** — не проверял (UI/UX/SEO мелочи).
- **I1–I7** — инфраструктурные, требуют доступа к Vercel/Sentry.
- **H5, H8–H10** — секреты на диске, требуют Vercel env review.

**Рекомендация:** обновить `MASTER_FIX_PLAN.md`, заменив C7-C11/A1-A2 и закрыв M1.
