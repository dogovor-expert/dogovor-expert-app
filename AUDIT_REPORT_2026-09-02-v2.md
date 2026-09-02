# Аудит — 02.09.2026 (v2, повторно верифицировано)

**Объект:** `D:\Мои сайты\site Dogovor` (Next.js 15.5.23, React 19, Supabase, ЮKassa, CryptoPro)
**Метод:** каждый claim из v1 сверен непосредственно с кодом по конкретным file:line, дополнительно проверены CSP/middleware/RLS/secrets/CI.
**Контекст:** за предыдущими раундами (30-31.08) уже закрыты C1-C6, H1-H7, L1-L2, M3/M4/M9/M13/M14, плюс C5 (feedback bucket private, миграция `20260831_feedback_private.sql`).
**Изменения относительно v1:**
- 5 утверждений скорректированы / дополнены
- 3 новые находки (B2 payments RLS, C12 CSRF dev-bypass, C13 middleware setAll не устанавливает куки)
- 1 закрытая находка подтверждена (C5 feedback bucket)

---

## 0. Сводная таблица верификации v1

| # | Утверждение v1 | Файл / строка | Статус | Комментарий |
|---|---|---|---|---|
| C7 | PATCH `/api/documents/[id]` принимает `deleted_at`/`status`/`template_id` | `api/documents/[id]/route.ts:18-27` | ✅ **Подтверждено** | Комментарий "to prevent mass-assignment" вводит в заблуждение — эти 3 поля и есть mass-assignment |
| C8 | `/api/cloud/refresh-token` берёт `refreshToken` из body | `api/cloud/refresh-token/route.ts:16,33` | ✅ **Подтверждено** | `loadCloudTokens`/`saveCloudTokens` импортированы, но **dead imports** (не вызываются) |
| C9 | `/api/admin/export` без rate-limit и audit log, читает PII feedback | `api/admin/export/route.ts:27-117` | ✅ **Подтверждено** | BOM + formula-injection защита есть ✅ |
| C10 | 8+ mutating роутов без CSRF | grep: 12 совпадений (4 файла) | ✅ **Подтверждено** | Покрыты: `profile`, `billing/auto-renew`, `feedback` (PATCH), `leads` (PATCH). Без CSRF: `create-payment`, `autoteka/pay`, `approval` (POST), `documents` (POST/PATCH/DELETE), `contractors` (POST/DELETE), `persons` (POST/DELETE), `import` (POST), `auth/login` (POST), `cloud/refresh-token` (POST), `feedback` (POST) |
| C11 | `/api/import` `upsert` молча перезаписывает | `api/import/route.ts:44-46` | ✅ **Подтверждено** | Комментарий "тихо пропускаем" **врёт**: `.upsert()` без `ignoreDuplicates: true` обновляет, а не пропускает. `ALLOWED_TEMPLATE_IDS` — hardcoded 14 шаблонов из 369 в системе. `.map` бросает `Error` без `try/catch` → 500 |
| B1 | CryptoPro: TSA фейк, `checkRevocation: false` | `lib/signCryptoPro.ts:477-505, 519, 547-557, 574-582` | ✅ **Подтверждено** | `propset_TSAAddress` ставится (строка 578) — CAdES-плагин *может* сам сделать HTTP-запрос, но **catch (e) { console.warn }** на строке 580 проглатывает ошибку. Если плагин не поддерживает — fallback на CAdES-BES без уведомления |
| P1 | Lint 185 errors, `ignoreDuringBuilds: true` | `next.config.mjs:13`, `npm run lint` | ✅ **Подтверждено** | 185 errors (storybook `no-undef` + parserOptions.project + empty block в JS). `tsc --noEmit` — 0 ошибок. `eslint.ignoreDuringBuilds: true` |
| A1 | LoginForm: placeholder-only, нет `aria-describedby` | `components/auth/LoginForm.tsx:72-94` | ✅ **Подтверждено** | `Input` поддерживает `label` (Input.tsx:19-23), но LoginForm не передаёт. **Фикс — 30 мин** |
| A2 | FeedbackForm: `<button>` вместо radio, нет aria-live | `components/feedback/FeedbackForm.tsx:222-247, 311, 380, 406-412` | ✅ **Подтверждено** | Все 7 пунктов v1 подтверждены построчно |
| A3 | Modal a11y ОК | `components/ui/Modal.tsx:97-132` | ✅ **Подтверждено** | role/aria-modal/aria-labelledby/focus-trap/ESC/previousFocus/createPortal ✅ |
| — | CSP с nonce в middleware | `middleware.ts:44, 52-66` | ✅ **Подтверждено** | strict-dynamic, object-src 'none', frame-ancestors 'self', form-action 'self' ✅ |
| — | HSTS, X-Frame, X-CTO, Referrer-Policy | `middleware.ts:73-79` | ✅ **Подтверждено** | Все 4 заголовка на месте |
| — | `dangerouslyAllowSVG: false` | `next.config.mjs` | ✅ **Подтверждено** | Параметр отсутствует (= `false` по умолчанию) |
| — | `poweredByHeader: false` | `next.config.mjs:12` | ✅ **Подтверждено** | |
| — | BOM + formula-injection в admin/export | `api/admin/export/route.ts:9-15, 110` | ✅ **Подтверждено** | "Закрыто" |
| — | CSP nonce закрыт | `middleware.ts:44` | ✅ **Подтверждено** | "Закрыто" |
| — | feedback bucket private | `20260831_feedback_private.sql` | ✅ **Подтверждено** | "Закрыто" в этом раунде |

---

## 1. Критические / высокие

### 🔴 C7 `PATCH /api/documents/[id]` — whitelist пропускает `status`, `template_id`, `deleted_at`
**Файл:** `src/app/api/documents/[id]/route.ts:18-27`

```ts
const allowedFields = [
  "title","fields","checklist","versions",
  "status","template_id","is_favorite","deleted_at",  // ❌
] as const;
```

IDOR нет (фильтр `eq("user_id", user.id)`, строка 42), но **mass assignment** есть. Эксплойты:
- `PATCH {deleted_at: null}` → восстановить документ из корзины в обход логики
- `PATCH {status: "trashed"}` → «удалить» без DELETE-вызова (нарушает аудит корзины)
- `PATCH {template_id: "..."}` → сменить шаблон (ломает `versions[]`)
- `PATCH {deleted_at: "2020-01-01"}` → подделать дату удаления

**Фикс (5 мин):**
```ts
const allowedFields = ["title","fields","checklist","versions","is_favorite"] as const;
```
Логика корзины — только в `DELETE` (lines 69-73), там она уже есть.

---

### 🔴 C8 `POST /api/cloud/refresh-token` — клиент шлёт `refreshToken` (M8 не закрыт)
**Файл:** `src/app/api/cloud/refresh-token/route.ts:16,33`

Сервер принимает `body.refreshToken` и проксирует его в Google. Клиент не должен владеть refresh-токеном — он должен лежать в Supabase (`cloud_tokens` с RLS), а сервер сам подтягивает по `user.id`.

```ts
const { provider, refreshToken } = body;        // ❌
...
refresh_token: refreshToken,                    // ❌
```

`loadCloudTokens`/`saveCloudTokens` **импортированы, но не вызваны** (dead imports, строка 4).

**Дополнительно:** нет rate-limit (можно перебирать refresh-токены, brute-force отзыва), нет `withCsrf`/`isSameOrigin`.

**Фикс (2 ч):**
1. Убрать `body.refreshToken`.
2. `loadCloudTokens(user.id, provider)` → взять сохранённый `refresh_token`.
3. Добавить `limiters.authAction` (5/мин) — `await checkRateLimit(limiters.authAction, user.id)`.
4. Обернуть в `withCsrf`.

---

### 🔴 C9 `GET /api/admin/export` — без rate-limit, без audit log (M10 не закрыт)
**Файл:** `src/app/api/admin/export/route.ts:26-117`

CSV-экспорт `feedback.csv` содержит **email + message** (PII). Нет записи в `admin_audit` (таблица создана миграцией `20260823_admin_audit`, но не используется). Нет rate-limit.

Что **уже хорошо**:
- BOM в начале CSV (строка 110) — Excel корректно откроет кириллицу ✅
- CSV formula-injection защита (строки 9-15) — префикс `'`, экранирование `"` и `,`/`\n`/`;` ✅
- `getAdminUser()` проверяет `app_metadata.is_admin` + `profiles.is_admin` (двойная проверка) ✅

**Фикс (2 ч):**
1. В начало `GET` — `insert({ actor: admin.id, action: "export:" + type, ip: clientIp(req) })` в `admin_audit`.
2. Добавить rate-limit (`limiters.adminAction`, 30/мин — **уже есть** в `lib/ratelimit.ts:41`, **не используется**).
3. Опционально: `LIMIT 10000` на большие таблицы + пагинация.

---

### 🟠 C10 CSRF покрытие — **10+ mutating роутов без защиты**
**Покрыто (4 файла):**
- `api/profile` PATCH/DELETE — `withCsrf + isSameOrigin` ✅
- `api/billing/auto-renew` POST — `isSameOrigin` ✅
- `api/feedback` PATCH — `isSameOrigin` ✅
- `api/leads` PATCH — `isSameOrigin` ✅

**Без CSRF (10 файлов, 13 endpoint'ов):**
| Роут | Метод | Доп. защита | Риск |
|---|---|---|---|
| `billing/create-payment` | POST | ЮKassa idempotency-key | 🟠 Создание платежа без подтверждения origin |
| `autoteka/pay` | POST | — | 🟠 Списание 199/299 ₽ |
| `approval` | POST | auth | 🟠 Auth+ID есть, но CSRF-шторм возможен |
| `documents` | POST | auth | 🟠 Создание документа в чужом аккаунте (если isSameOrigin на API-роуте) |
| `documents/[id]` | PATCH/DELETE | auth | 🔴 C7 — mass-assignment + без CSRF |
| `contractors` | POST/DELETE | auth | 🟠 |
| `persons` | POST/DELETE | auth | 🟠 |
| `import` | POST | auth | 🟠 C11 — upsert перезаписывает |
| `auth/login` | POST | — | 🟡 Обычно ОК, но password-spray усиливается |
| `cloud/refresh-token` | POST | auth | 🔴 C8 |
| `feedback` | POST | rate-limit | 🟡 Только спам, не security |

**Дополнительный гэп в `lib/admin-auth.ts:67-68`:**
```ts
const origin = req.headers.get("origin");
if (!origin) return true; // ❌ пропускает запросы без Origin
```
Атакующий через `fetch` без Origin (или через устаревший клиент) проходит.

**Дополнительный гэп в `lib/csrf.ts:16-18`:**
```ts
if (process.env.NODE_ENV === 'development') {
  return { valid: true };  // ❌ пропускает ВСЁ в dev
}
```
Если `NODE_ENV !== 'production'` (например, `NODE_ENV=test`, `NODE_ENV=staging`), CSRF тоже отключается. **Нужно**: явно проверять `NODE_ENV === 'production' || NODE_ENV === 'staging'` → иначе `throw new Error('CSRF not allowed in this env')`.

**Фикс (3-4 ч):**
1. Унифицировать: везде `withCsrf` обёртка + `isSameOrigin` belt-and-suspenders.
2. Удалить `if (!origin) return true` → `return false`.
3. В `csrf.ts` ужесточить env-проверку (только production = strict).
4. Добавить CSRF-cookie + double-submit pattern для POST/PATCH/DELETE (защита от edge-case без Origin).

---

### 🟠 C11 `POST /api/import` — `upsert` перезаписывает без подтверждения
**Файл:** `src/app/api/import/route.ts:27-50`

```ts
.upsert(rows, { onConflict: "user_id,template_id" })  // ❌ update, не skip
```

Комментарий "тихо пропускаем конфликты" **вводит в заблуждение** — `.upsert()` без `ignoreDuplicates: true` именно обновляет, а не пропускает.

`ALLOWED_TEMPLATE_IDS` — hardcoded 14 шаблонов (lines 7-12), в системе 369. Если `template_id` не из списка — `throw new Error` внутри `.map` (строка 30) **без `try/catch`** → uncaught exception → 500.

**Фикс (1-2 ч):**
1. Заменить whitelist на динамическую проверку: `LEGAL_TEMPLATES.some(t => t.id === templateId)`.
2. Сначала `SELECT` существующих, вернуть `409 Conflict { existing: ids }` если есть, либо явно спросить `force: true` в теле.
3. Обернуть `.map` в `try/catch` → 400 с понятным сообщением.

---

### 🟠 C13 `middleware.ts:125-130` — `setAll` не устанавливает куки в response
**Файл:** `src/middleware.ts:125-130`

```ts
setAll(cookiesToSet) {
  cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
  response = NextResponse.next({ request: { headers: requestHeaders } });  // ❌
  cookiesToSet.forEach(({ name, value, options }) =>
    response.cookies.set(name, value, options)
  );
},
```

**Проблема:** Supabase обновляет access/refresh токены через `setAll`, но `NextResponse.next()` создаёт **новый response** — старые заголовки (включая `Content-Security-Policy` на строках 72-79) **теряются** в `response`. После `setAll` нужно `merge response.headers` или скопировать `csp/headers` на новый response.

**Эффект:** на каждом rotate-токена Supabase клиент получает response **без CSP**, что делает CSP защиту дырявой в момент refresh. Минорно (только в момент rotate), но **стоит починить**.

**Фикс (30 мин):**
```ts
setAll(cookiesToSet) {
  cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
  const newResponse = NextResponse.next({ request: { headers: requestHeaders } });
  // Пробрасываем security-заголовки
  for (const [k, v] of response.headers) newResponse.headers.set(k, v);
  cookiesToSet.forEach(({ name, value, options }) =>
    newResponse.cookies.set(name, value, options)
  );
  response = newResponse;
},
```

---

## 2. Бизнес-логика / комплаенс

### 🟠 B1 CryptoPro: TSA фейк + проверка отзыва отключена
**Файл:** `src/lib/signCryptoPro.ts`

- **Line 519:** `validateCertificate(thumbprint, { checkRevocation: false, checkChain: true })` — даже если бы `checkRevocation` работал, его **явно отключают** перед подписанием.
- **Lines 477-505 (`checkRevocation`):** возвращает `'unknown'`/`'offline'`, **реального CRL/OCSP HTTP-запроса нет** (комментарий "В реальности здесь должен быть запрос к CRL/OCSP"). Код **вводит в заблуждение**: юзер видит `warnings.push('Не удалось проверить отзыв')`, но подпись всё равно проходит.
- **Lines 547-557 + 574-582 (TSA):**
  - Строки 547-557: создаётся TSA-атрибут через `CAdESCOM.CPAttribute` (имя `SIGNATURE_TIMESTAMP_TOKEN`), но **HTTP-запрос к TSA не делается** — только `console.warn`.
  - Строки 574-582: `propset_TSAAddress(tsaUrl)` ставится — CAdES-плагин **может** сам сделать HTTP-запрос к TSA внутри `SignCades`. Зависит от версии плагина.
  - **`catch (e) { console.warn }`** на строке 580 **проглатывает** ошибку установки TSA-адреса. Если плагин не поддерживает — fallback на **CAdES-BES без уведомления** юзера.
- **Строки 569-572:** заявлен `CADESCOM_CADES_X_LONG_TYPE_1`, но без реального TSA-токена это фактически **CAdES-BES**.

**Юридический риск:** заявлена «квалифицированная подпись с меткой времени», реально — BES без TSA. Это нарушает **63-ФЗ «Об электронной подписи»**. Для B2B/B2G документов критично.

**Дополнительно:** функции `isQualifiedCertificate` (lines 701-709) определяет квалифицированность по OGRN/SNILS/INN в subjectName. **Dead code** — не вызывается нигде.

**Фикс (3-5 дней):**
1. **Реальный HTTP-запрос к TSA** (например, `https://freetsa.org/tsr` или `https://taxcom.ru/tsa`). RFC 3161 timestamp request → response → встроить в атрибут.
2. **Реальный CRL/OCSP** через `fetch(url, { redirect: 'follow' })` + ASN.1-парсинг (или через npm-библиотеку `@peculiar/asn1-x509`).
3. **Использовать `id-kp-qcSign`** (1.2.643.7.1.1.1.1) для проверки квалифицированности, не OGRN/SNILS/INN.
4. **Удалить dead code** `isQualifiedCertificate` или подключить к `validateCertificate`.
5. В UI явно показывать, какой уровень подписи получился (BES / X-Long), и **блокировать** подписание, если заявлен X-Long, а TSA не ответил.

---

### 🔴 B2 `payments` RLS открыт для всех аутентифицированных
**Файл:** `supabase/migrations/001_accounts.sql:131-136`

```sql
create policy "payments_insert_service" on public.payments
  for insert with check (true);   -- ❌ любой authenticated может вставить платёж
create policy "payments_update_service" on public.payments
  for update using (true);        -- ❌ любой может обновить платёж
```

Названия говорят "service", но фактически это **`auth.role() = 'authenticated'`** разрешение (по умолчанию в Supabase RLS, без явного `to authenticated` действует на `public` = `anon` + `authenticated`).

⚠️ **Однако** Supabase anon-ключ не пройдёт `auth.uid()` для INSERT, так что **анон не вставит**. Но **любой залогиненный юзер** может:
1. Создать **фейковый платёж** в `payments` для своего `user_id` со `status: 'succeeded'`, `provider_id: 'fake'`, `amount: 999999` (в копейках, т.е. 9999.99 ₽).
2. Обновить чужой `status` с `'pending'` на `'succeeded'` → зачислить себе подписку без оплаты.
3. Обновить чужой `amount`/`currency`/`meta` → сломать аудит.

**Фикс (30 мин):**
```sql
-- payments_insert_service: только service_role
drop policy "payments_insert_service" on public.payments;
create policy "payments_insert_service" on public.payments
  for insert to service_role
  with check (true);

-- payments_update_service: только service_role  
drop policy "payments_update_service" on public.payments;
create policy "payments_update_service" on public.payments
  for update to service_role
  using (true) with check (true);
```

---

### 🟡 B3 `feedback` storage — анон загрузка файлов (историческая)
**Файл:** `supabase/migrations/20260822_feedback.sql:65-77`

```sql
create policy feedback_upload_anon on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'feedback');
```

**Закрыто** в миграции `20260831_feedback_private.sql` (строки 18-19) — `drop policy feedback_upload_anon`. Сейчас бакет **private**, загрузка только через `createAdminClient()`. ✅

Но **исторические файлы** (если залиты до миграции) остаются в бакете и доступны **только service_role**. Проверить, что admin panel корректно отдаёт **signed URL** (TTL ≤ 5 мин) для скриншотов.

---

### 🟠 C1 CSP `connect-src` включает Hugging Face
**Файл:** `src/middleware.ts:59`

```ts
`connect-src 'self' ... https://huggingface.co https://*.huggingface.co https://cdn.hf.co https://*.cdn.hf.co ...`
```

Зачем прод-сайту юридических документов Hugging Face? Варианты:
- Генерация текста через HF API (юзеры не знают, что данные уходят на HF)
- Интеграция OCR/AI, не до конца удалённая
- Dead code

**Риск:** если это реальный API-call — это **data leak** (юзеры вводят персональные данные в форму, они уходят на HF). Если dead — лишний attack surface.

**Фикс (15 мин):**
1. Если не используется — удалить из CSP.
2. Если используется — вынести в server-side proxy, не светить API-ключ в CSP, документировать privacy policy.

---

## 3. Pipeline / CI

### 🟡 P1 CI lint-step: 185 errors проходят молча
**Команда:** `npm run lint` → `185 errors, 2200 warnings`.

Большинство ошибок — `no-undef` (`console`, `process`, `document`) в storybook-файлах и e2e (где они легитимны), плюс `parserOptions.project` parsing errors и `Empty block statement` в тестовых скриптах.

`tsc --noEmit` — **0 ошибок**. Только lint шумит.

`next.config.mjs:13` — `eslint: { ignoreDuringBuilds: true }` — **отключает** ESLint в build. Сборка проходит даже с ошибками.

**Риск:** регрессии проскакивают в main. CI ловит lint как «успех», потому что в одном из конфигов eslint настроен нестрого для storybook/e2e.

**Фикс (1 ч):**
1. Создать `.eslintrc.storybook.json` с `env: { browser: true, node: false }`.
2. Создать `.eslintrc.e2e.json` аналогично.
3. В `package.json`: `"lint": "eslint . --max-warnings=0"` уже стоит. Проверить, что CI падает на errors (не проходит как `continue-on-error`).
4. Убрать `ignoreDuringBuilds: true` из `next.config.mjs` после починки lint.

---

### 🟢 P2 `npm audit` — 7 уязвимостей (транзитивные, не в проде)
- **2 high:** `image-size` ≤2.0.2 (DoS через ICNS/JXL/HEIF) — **только в `@storybook/nextjs`**, не в проде.
- **5 low:** `crypto-browserify`, `elliptic` — через Storybook / node-polyfill.

**Фикс:** `npm update` Storybook до 8.4+ (`image-size` зафиксен в 2.0.3). Не блокер для прода.

---

## 4. A11y

### 🟠 A1 `LoginForm` — placeholder-only метки, нет `aria-describedby`
**Файл:** `src/components/auth/LoginForm.tsx:72-94`

- `aria-invalid` есть (lines 77, 92) ✅
- **Нет** `aria-describedby` для связи `<p>` ошибок с инпутами
- **Нет** `<label htmlFor>` + `id` — placeholder-only метки. Скрин-ридер прочитает только placeholder
- **Нет** `autoComplete="email"` / `autoComplete="current-password"` — браузер не подскажет пароль
- `serverError` (lines 96-100) — без `role="alert"` или `aria-live`
- `/api/auth/login` — без CSRF (см. C10)

**Фикс (1 ч):** `<Input label="Email" id="email" autoComplete="email" aria-describedby="email-err">` + `aria-describedby="email-err"` на `<p>` с ошибкой + `role="alert"` на `serverError`. **Input уже поддерживает `label` и `id`** (`Input.tsx:19-23`).

### 🟠 A2 `FeedbackForm` — нарушение ARIA radiogroup pattern
**Файл:** `src/components/feedback/FeedbackForm.tsx` (430 строк)

Подтверждено построчно:
- **Строки 222-247**: `<fieldset><legend>` правильно, но внутри `<button>`-ы, не `<input type="radio">`. Скрин-ридер не объявляет "radio button".
- **Строки 253, 288, 311, 380**: `<label>` без `htmlFor` + input без `id` — **не связаны** (4 поля).
- **Строки 392-403**: чекбокс согласия содержит `<a target="_blank">` без предупреждения о новом окне.
- **Строки 406-412**: `status === "error"` — без `role="alert"` / `aria-live`.
- **Строки 247, 281, 305, 319, 367, 388, 404**: ошибки `<p>` без `role="alert"` / `aria-describedby`.
- **Строки 414-419**: кнопка submit без `aria-busy={status === "submitting"}`.

**Фикс (3-4 ч):**
- Заменить `<button>` на `<input type="radio">` или `role="radio" aria-checked={active}`.
- Связать `<label htmlFor>` + `id` для всех 4 полей.
- Добавить `aria-live="polite"` на success/error блоки.

### ✅ A3 `Modal` — a11y OK
**Файл:** `src/components/ui/Modal.tsx:97-132`

Все пункты v1 подтверждены построчно. Закрыто.

---

## 5. Secrets / Infrastructure

### 🟠 S1 `.env.production` и `.env.local` лежат на диске
**Файлы:** `D:\Мои сайты\site Dogovor\.env.production`, `.env.local`

Содержат (по grep):
- `NEXT_PUBLIC_SUPABASE_URL=https://xkakhztknlpzqarklewq.supabase.co`
- `UPSTASH_REDIS_REST_TOKEN=gQAAAAAAAoHGA...` (Upstash API token)
- `NEXT_PUBLIC_APP_URL="https://dogovor.expert"`
- `NEXT_PUBLIC_SITE_URL="https://dogovor.expert"`
- `CRON_SECRET="219263ccad4f1496..."` (cron auth)

**Подтверждено:** `.gitignore` исключает `.env`, `.env*.local`, `.env.production`, `.env*.production` — **секреты НЕ закоммичены**. ✅

**Риск:** секреты в **plain text на диске** разработчика. Если машина скомпрометирована (вирус, физический доступ) — все токены утёкшие. Это **H5/H8-H10** из MASTER_FIX_PLAN.md.

**Фикс (1 ч):**
1. Перенести все секреты в **Vercel env vars** (production + preview).
2. Удалить локальные `.env.production` (оставить `.env.local` для dev).
3. Использовать **Vercel CLI** для локальной разработки: `vercel env pull .env.local`.
4. Опционально: **1Password CLI** / **doppler** / **infisical** для синхронизации.

---

## 6. Сводный список фиксов (приоритизированный)

| # | Что | Файл | Время | Приоритет |
|---|---|---|---|---|
| **C7** | Убрать `deleted_at`/`status`/`template_id` из whitelist PATCH | `api/documents/[id]/route.ts:18-27` | 5 мин | 🔴 |
| **C8** | Сервер сам берёт refresh_token | `api/cloud/refresh-token/route.ts:16,33` | 2 ч | 🔴 |
| **C9** | audit log + rate-limit на admin/export | `api/admin/export/route.ts:26-117` | 2 ч | 🔴 |
| **B2** | payments RLS — только service_role | `001_accounts.sql:131-136` | 30 мин | 🔴 |
| **C10** | `withCsrf` на 10+ mutating роутах, починить `isSameOrigin` gap | `lib/csrf.ts`, `lib/admin-auth.ts:67-68`, 10+ routes | 3-4 ч | 🔴 |
| **C11** | Заменить `upsert` на явный конфликт-чек + try/catch в import | `api/import/route.ts:27-50` | 1-2 ч | 🟠 |
| **B1** | Реальный TSA + проверка отзыва | `lib/signCryptoPro.ts:477-582` | 3-5 дн | 🟠 |
| **C13** | middleware `setAll` не теряет security-заголовки | `middleware.ts:125-130` | 30 мин | 🟠 |
| **C1** | Убрать Hugging Face из CSP (или вынести в server-proxy) | `middleware.ts:59` | 15 мин | 🟠 |
| **A1** | LoginForm: `label` + `id` + `autoComplete` + `aria-describedby` + `role="alert"` | `components/auth/LoginForm.tsx` | 1 ч | 🟠 |
| **A2** | FeedbackForm: radiogroup + `label htmlFor` + `aria-live` | `components/feedback/FeedbackForm.tsx` | 3-4 ч | 🟠 |
| **P1** | Починить eslint (storybook/e2e overrides) + убрать `ignoreDuringBuilds` | `next.config.mjs:13`, `.eslintrc.*` | 1 ч | 🟡 |
| **S1** | Перенести секреты в Vercel env, удалить `.env.production` | `.env.production` | 1 ч | 🟡 |
| **P2** | `npm update` Storybook ≥8.4 | `package.json` | 5 мин | 🟢 |

**Оценка:** ~7-10 рабочих дней (включая B1 CryptoPro). Без B1 — **1.5-2 дня** (B2 + C7 + C8 + C9 + C10 + C11 + C13 + C1 + A1 + A2 + P1 + S1).

---

## 7. Что НЕ проблема (закрыто)

- ✅ **C5** feedback bucket private — закрыто `20260831_feedback_private.sql`.
- ✅ **M2** (10× пустых catch в `builder/page.tsx`) — осмысленные, только UX-fallbacks.
- ✅ **M3** (`useMemo` в builder) — на месте.
- ✅ **A3** `Modal` — a11y ОК.
- ✅ **`dangerouslyAllowSVG`** в `next.config` — отключён (параметр отсутствует).
- ✅ **`poweredByHeader: false`** (L1).
- ✅ **CSRF в dev** — пропускается (для удобства), но нужно ужесточить в `test`/`staging` (C12).
- ✅ **`tsc --noEmit`** — 0 ошибок.
- ✅ **CSP nonce + `strict-dynamic`** в middleware.
- ✅ **AAL2 enforcement** для admin (middleware:167-183).
- ✅ **CSV formula injection** защита в admin/export.
- ✅ **BOM** в admin/export для Excel.

---

## 8. Открытые из MASTER_FIX_PLAN.md (не закрыты этим раундом)

- **M1** (6 пустых catch в `signCryptoPro.ts`) — **не критичны** (обёртки COM-объекта, fallback), план можно закрыть.
- **M8** (`cloud/refresh-token` берёт refresh_token из body) — **подтверждён C8**, теперь в фиксах.
- **M10** (`admin/export` без rate-limit и audit log) — **подтверждён C9**, теперь в фиксах.
- **M5–M7, M11, M12, M15, M16** — не проверял (UI/UX/SEO мелочи).
- **I1–I7** — инфраструктурные, требуют доступа к Vercel/Sentry.
- **H5, H8–H10** — секреты на диске, теперь **S1**.

**Рекомендация:** обновить `MASTER_FIX_PLAN.md`, заменив C7-C11/A1-A2 и закрыв M1/M8/M10 → переоткрыть как C7/C8/C9.
