# Независимый аудит — 02.09.2026

**Объект:** `D:\Мои сайты\site Dogovor` (Next.js 15.5.23, React 19, Supabase, ЮKassa, CryptoPro)
**Объём:** 346 TS/TSX файлов, 32 API-роута, 15 миграций, конфиги, CI, сборочные артефакты.
**Метод:** каждый вывод проверен запуском инструмента или чтением кода. Ни один вывод не взят из предыдущих отчётов на веру.

---

## 1. Исполнительная сводка

**Оценка здоровья: 6.5 / 10.** Кодовая база взрослая и в целом аккуратная — но проект страдает не от отсутствия правок, а от **отсутствия измерения** и от **трёх замороженных системных дыр**.

Пять ключевых выводов:

1. **Производительность никогда не измерялась.** Ни одного запуска Lighthouse, PSI, WebPageTest, Bundle Analyzer за всё время. Это пункты 1–2 исходного задания — они не выполнены ни разу ни одним раундом. Решения по оптимизации принимались «на глаз».
2. **Страница входа отдаётся без CSP и HSTS.** Все 7 `NextResponse.redirect()` в middleware создают **новый** response, не наследуя выставленные ранее заголовки. Логин, дашборд, админка — все редиректы приходят «голыми». Предыдущий агент починил частный случай этого бага (`setAll`, C13) и не заметил остальные семь.
3. **Брутфорс логина открыт.** `/api/auth/login` — единственный мутирующий роут проекта без CSRF **и без rate-limit**. Лимитер `authAction` (5/мин) создан, но к логину не подключён.
4. **Заявления предыдущего агента о покрытии не соответствуют коду.** Заявлено «CSRF 14/15 (93%)», по факту **13/20 (65%)**. Заявлено «секреты удалены с диска», по факту `.env.local` содержит 13 live-секретов. Заявлено «P1 закрыт», по факту 185 ошибок линтера остались, а диагноз был неверным.
5. **Ни одна правка не закоммичена.** 20 изменённых файлов висят в working tree. Откат или `git clean` — и весь раунд аудита потерян.

Что **хорошо** (проверено, не на словах): `tsc --noEmit` — 0 ошибок; CSP с nonce + strict-dynamic; вебхуки Телеграма и кроны защищены секретами; тяжёлые библиотеки (PaddleOCR, pdfjs, docx) действительно вынесены в lazy-чанки; a11y-модальный компонент сделан грамотно.

---

## 2. Проверка заявлений предыдущего агента

| # | Заявление (из CHANGELOG) | Статус | Факт |
|---|---|---|---|
| 1 | C7: `deleted_at`/`status`/`template_id` убраны из PATCH-whitelist | ✅ **Верно** | `documents/[id]/route.ts:25-31` — whitelist содержит только контентные поля |
| 2 | CSRF-покрытие 14/15 (93%) | ❌ **Неверно** | **13 с CSRF / 20 применимых = 65%.** Без защиты: `auth/login`, `trash`, `billing/auto-renewal`, `export/email`, `autoteka/check`, `chat`, `dadata` |
| 3 | Rate-limit-покрытие 15/15 (100%) | ❌ **Неверно** | Без лимита: `auth/login`, `trash`, `autoteka/check`, `documents/[id]`, `profile` |
| 4 | `tsc --noEmit` — 0 ошибок | ✅ **Верно** | Проверен лично, exit code 0 |
| 5 | Build проходит | ✅ **Верно** | `.next` собран, 103 страницы |
| 6 | P1: eslint починен, 186 → 185 | ⚠️ **Формально верно, по сути — нет** | 185 ошибок остались. **176 из 185 — в `scripts/*.mjs`.** Диагноз «storybook no-undef» ошибочен: storybook-файлов в списке нет вообще |
| 7 | Секреты удалены с диска | ❌ **Неверно** | Удалён `.env.production`, но `.env.local` содержит 13 live-секретов, включая `YOOKASSA_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_BOT_TOKEN` |
| 8 | a11y LoginForm / FeedbackForm закрыто | ✅ **Верно** | `label htmlFor`, `id`, `aria-describedby`, `role="alert"`, `autoComplete` — всё на месте |
| 9 | npm audit: 7 уязвимостей (2 high, 5 low) | ✅ **Верно** | Проверен лично: 5 low + 2 high, все транзитивные через Storybook, в прод не попадают |
| 10 | C13: middleware `setAll` сохраняет заголовки | ✅ **Верно** | `middleware.ts:125-141` — headers копируются |

**Итог по агенту:** хорошо провёлsecurity- и a11y-часть, но (а) завысил свои метрики, (б) неверно диагностировал проблему линтера, (в) полностью проигнорировал производительность, адаптивность и кроссбраузерность — половину задания, (г) оставил результат незакоммиченным.

---

## 3. Таблица проблем

| # | Проблема | Серьёзность | Компонент | Рекомендация | Эффект |
|---|---|---|---|---|---|
| **N1** | `/api/auth/login` без rate-limit и CSRF | 🔴 Critical | `api/auth/login/route.ts` | Обернуть в `withCsrf` + `limiters.authAction(5/мин)` по email+IP | Закрывает неограниченный перебор паролей |
| **N2** | 7 редиректов в middleware теряют CSP/HSTS/X-Frame | 🔴 Critical | `middleware.ts:157,174,186,191,199,207,213` | Вынести установку заголовков в функцию и применять ко всем response, включая redirect | Логин/админка получают CSP |
| **N3** | `/api/trash` POST/DELETE — без CSRF и лимитов | 🟠 High | `api/trash/route.ts:22,45` | `withCsrf` + `crudMutation`, валидировать `ids` как UUID-массив | DELETE безвозвратно удаляет документы |
| **N4** | `/connections` доступна без авторизации | 🟠 High | `app/connections/page.tsx` + `middleware.ts:4` | Добавить `/connections` в `PROTECTED_PREFIXES` | Страница управления облачными подключениями |
| **N5** | `.env.local` с 13 live-секретами на диске | 🟠 High | `.env.local` | Перенести в Vercel, ротировать, удалить локальный файл | Секреты не в git, но на машине |
| **N6** | 185 ошибок ESLint; `ignoreDuringBuilds: true` | 🟠 High | `eslint.config.mjs`, `next.config.mjs:13` | Добавить `scripts/**`, `coverage/**`, `audit/**`, `e2e/**` в ignores → 0 errors → убрать `ignoreDuringBuilds` | Регрессии перестают проходить в main |
| **N7** | Производительность не измерялась никогда | 🟠 High | весь проект | Lighthouse CI + PSI + Bundle Analyzer в CI | Появляютсяbaseline-метрики |
| **N8** | Нет `Permissions-Policy` | 🟡 Medium | `middleware.ts:74-79` | Добавить заголовок | Запрет geolocation/mic/camera |
| **N9** | Middleware на всех ассетах (`matcher: '/(.*)'`) | 🟡 Medium | `middleware.ts:223` | Исключить `_next/static`, `favicon`, `public/*` | Меньше invocation, ниже TTFB и счёт Vercel |
| **N10** | `/builder` и `/connections` делают холостой `getUser()` | 🟡 Medium | `middleware.ts:147` | Расширить список публичных маршрутов | −50…200 мс TTFB на каждый заход |
| **N11** | 5 мутирующих роутов без CSRF | 🟡 Medium | `auto-renewal`, `export/email`, `autoteka/check`, `chat`, `dadata` | `withCsrf` + лимиты по назначению | Закрывает векторы подмены состояния |
| **N12** | Нет конфигурации `images` | 🟡 Medium | `next.config.mjs` | `formats: ['image/avif','image/webp']` + `remotePatterns` | −30…50% веса изображений |
| **N13** | `@next/bundle-analyzer ^16.3.2` при `next ^15.5.23` | 🟡 Medium | `package.json` | Привести к одной мажорной версии | Снимает риск поломки `analyze` |
| **N14** | Sentry deprecation warning при сборке | 🟢 Low | `next.config.mjs:3` | Импорт из `@sentry/nextjs/config` | Чистый лог сборки |
| **N15** | 599 КБ мусора в корне + `fix-escape.js` в git | 🟢 Low | корень репозитория | Удалить логи, исключить `fix-escape.js` | Гигиена репозитория |
| **N16** | Storybook: 2 high / 5 low | 🟢 Low | `package.json` | `npm update @storybook/*` | Не влияет на прод |

---

## 4. Детали критичных находок

### N1 — Брутфорс `/api/auth/login`

```ts
// src/app/api/auth/login/route.ts — текущее состояние (30 строк целиком)
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  // ... zod-валидация ...
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return NextResponse.json({ error: error.message }, { status: 401 });
  return NextResponse.json({ user: data.user, session: data.session });
}
```

Ни лимита, ни CSRF. `limiters.authAction` (5/мин) уже существует в `lib/ratelimit.ts` и уже подключён к `cloud/refresh-token`, `create-payment`, `import` — но не к логину.

```ts
// Исправление
import { withCsrf } from "@/lib/csrf";
import { limiters, clientIp, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";

async function loginHandler(req: Request) {
  const ip = clientIp(req);
  const rl = await checkRateLimit(limiters.authAction, `login:${ip}`);
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const validation = validateBody<LoginFormData>(loginSchema, body);
  if (!validation.success) return validation.error;

  // Лимит по аккаунту — поверх лимита по IP
  const perEmail = await checkRateLimit(limiters.authAction, `login:${validation.data.email}`);
  if (!perEmail.ok) return rateLimitResponse(perEmail.retryAfter);

  // ... существующая логика ...
}

export const POST = withCsrf(loginHandler);
```

> Дополнительно: Supabase имеет встроенный throttle на `signInWithPassword`, но он мягкий. Собственный лимит обязателен. Идеально — подключить Turnstile (компонент `TurnstileCaptcha` в проекте уже есть).

### N2 — Редиректы теряют все security-заголовки

```ts
// middleware.ts — заголовки ставятся ОДИН раз, на строке 69
let response = NextResponse.next({ request: { headers: requestHeaders } });
response.headers.set('Content-Security-Policy', csp);
response.headers.set('X-Content-Type-Options', 'nosniff');
response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
response.headers.set('X-Frame-Options', 'SAMEORIGIN');
if (!isDev) response.headers.set('Strict-Transport-Security', '...');

// ... а дальше — семь редиректов, каждый создаёт НОВЫЙ объект:
//  157  if (!user) return NextResponse.redirect(new URL("/login", request.url));
//  174  return NextResponse.redirect(new URL("/dashboard", request.url));
//  186  return NextResponse.redirect(url);   // admin без 2FA
//  191  return NextResponse.redirect(url);
//  199  return NextResponse.redirect(url);   // защищённый роут без сессии
//  207  return NextResponse.redirect(url);   // AAL1 при включённой 2FA
//  213  return NextResponse.redirect(new URL("/dashboard", request.url));
```

**Следствие:** неавторизованный пользователь, зашедший на `/dashboard`, получает редирект на `/login` — и сама страница логина приходит **без CSP, без HSTS, без X-Frame-Options**. То есть CSP отсутствует именно там, где вводят пароль.

```ts
// Исправление — одна функция, применяемая ко всем response
function withSecurityHeaders(res: NextResponse, csp: string, isDev: boolean): NextResponse {
  res.headers.set('Content-Security-Policy', csp);
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (!isDev) {
    res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  return res;
}

// Каждый redirect:
return withSecurityHeaders(NextResponse.redirect(new URL("/login", request.url)), csp, isDev);
```

### N6 — Реальная причина 185 ошибок ESLint

```
ESLint: 185 errors, 2222 warnings, 27 файлов с ошибками

По директориям:
  176  scripts/     ← Node CLI-скрипты (.mjs), линтятся браузерными правилами
    3  coverage/    ← СГЕНЕРИРОВАННЫЙ каталог, линтерится без исключения
    3  audit/
    1  e2e/
    1  fix-escape.js
    1  next-env.d.ts ← сгенерирован Next.js

Топ правил: 174 × no-undef, 3 × no-empty, 1 × consistent-type-imports,
            1 × triple-slash-reference, 1 × no-unused-vars
```

Storybook-файлов в списке нет вообще — предыдущий агент потратил усилия на `src/lib/workers/**`, снизив счётчик с 186 до 185, и назвал P1 закрытым. Решение занимает минуту:

```js
// eslint.config.mjs — блок ignores
ignores: [
  'scripts/**',        // Node CLI-утилиты, не часть приложения
  'coverage/**',       // сгенерировано
  'audit/**',
  'e2e/**',
  'playwright-report/**',
  'test-results/**',
  'visual-report/**',
  'fix-escape.js',
  'next-env.d.ts',
  'src/lib/workers/**',
  '.next/**',
],
```

После этого — `npm run lint` должен давать 0 errors, и можно убирать `eslint.ignoreDuringBuilds: true` из `next.config.mjs:13`.

### N4 — `/connections` без авторизации

`PROTECTED_PREFIXES = ["/dashboard", "/settings", "/trash", "/billing", "/security"]`.
`/connections` туда не входит и не входит в список публичных → middleware выполняет `supabase.auth.getUser()` (лишний round-trip 50–200 мс), но `isProtected === false` → **редиректа нет**. Клиентский гард в `connections/page.tsx` отсутствует (проверено: ни `getUser`, ни `router.push`, ни `redirect`).

---

## 5. Производительность — что показал анализ бандла

Замерено по `.next/app-build-manifest.json` + `react-loadable-manifest.json` (нескомпремированный JS):

| Страница | Initial JS | Lazy-чанки |
|---|---|---|
| `/` (главная) | **712 КБ** | — |
| `/documents/[slug]` | **709 КБ** | — |
| `/converter` | **716 КБ** | — |
| `/builder` | **908 КБ** | 1548 КБ (PaddleOCR 1063 КБ — грузится только при открытии сканера) |
| `/login` | **823 КБ** | 254 КБ |

Выводы:

- Lazy-разделение сделано **правильно** — PaddleOCR, pdfjs, docx вынесены в отдельные чанки и не висят в initial. Это хорошая работа, которую стоит отметить.
- `/login` тяжелее главной (823 КБ против 712 КБ) — явный кандидат на разбор: форма из двух полей не должна тянуть столько.
- 712 КБ initial на главной — это примерно 220–240 КБ после gzip. Для лендинга с 369 документами это верхняя граница приемлемого.
- Без Lighthouse/PSI нельзя сказать, каков LCP/CLS/TBT. **Это и есть главная проблема: решения принимаются без измерений.**

---

## 6. План действий

### Неделя 1 — безопасность (≈ 6 часов)

1. **N1** — CSRF + rate-limit на `/api/auth/login` (30 мин)
2. **N2** — функция `withSecurityHeaders()` на все 7 редиректов (1 ч)
3. **N3** — CSRF + лимиты + UUID-валидация на `/api/trash` (45 мин)
4. **N4** — `/connections` в `PROTECTED_PREFIXES` (5 мин)
5. **N11** — `withCsrf` на `auto-renewal`, `export/email`, `autoteka/check`, `chat`, `dadata` (2 ч)
6. **N5** — перенос секретов в Vercel, ротация, удаление `.env.local` (1 ч, руками)
7. **Закоммитить** всё, что висит в working tree (5 мин)

### Неделя 2 — pipeline и измерения (≈ 5 часов)

8. **N6** — правильные ignores в ESLint → 0 errors → убрать `ignoreDuringBuilds` (30 мин)
9. **N7** — Lighthouse CI в `.github/workflows/ci.yml`, baseline-метрики (3 ч)
10. **N8** — `Permissions-Policy` (10 мин)
11. **N9** — сузить `matcher` middleware (20 мин)
12. **N10** — `/builder`, `/connections` в публичные маршруты (10 мин)

### Неделя 3 — производительность и гигиена (≈ 4 часа)

13. Разобрать `/login` — почему 823 КБ (2 ч)
14. **N12** — конфигурация `images` (30 мин)
15. **N13** — `@next/bundle-analyzer` под версию Next (10 мин)
16. **N14** — импорт Sentry из `/config` (5 мин)
17. **N15** — удалить 599 КБ логов, исключить `fix-escape.js` (15 мин)
18. **N16** — `npm update @storybook/*` (30 мин)

### Отдельный спринт

- **B1** CryptoPro: реальный TSA (RFC 3161) + CRL/OCSP — 3–5 дней. Единственная находка предыдущего раунда с юридическим риском (63-ФЗ), и она до сих пор открыта.

---

## 7. Метрики для повторной проверки

| Метрика | Сейчас | Цель |
|---|---|---|
| `tsc --noEmit` | 0 ошибок | 0 ошибок |
| ESLint errors | **185** | **0** |
| ESLint warnings | 2222 | < 800 (постепенно) |
| `eslint.ignoreDuringBuilds` | `true` | `false` |
| CSRF-покрытие мутирующих роутов | **13/20 (65%)** | **20/20 (100%)** |
| Rate-limit на `/api/auth/login` | **нет** | 5/мин по IP + 5/мин по email |
| Security-заголовки на редиректах | **0/7** | **7/7** |
| Lighthouse Mobile Performance | не измерялось | **> 85** |
| Lighthouse Accessibility | не измерялось | **> 95** |
| LCP (mobile) | не измерялось | **< 2.5 с** |
| CLS | не измерялось | **< 0.1** |
| Initial JS главной | 712 КБ (raw) | < 500 КБ (raw) |
| Initial JS `/login` | 823 КБ (raw) | < 400 КБ (raw) |
| Секреты на диске | 13 в `.env.local` | 0 |
| Закоммиченные правки | 0 файлов | все |

---

## 8. Что проверено и признано работающим

- `tsc --noEmit` — 0 ошибок (проверено запуском)
- `npm run build` — проходит, 103 страницы
- CSP: nonce + `strict-dynamic` + `object-src 'none'` + `frame-ancestors 'self'`
- Вебхук Телеграма — проверка `x-telegram-bot-api-secret-token`
- Кроны `/api/cron/*` — проверка `Bearer CRON_SECRET`
- AAL2/2FA для админов в middleware
- Lazy-чанки для PaddleOCR, pdfjs, docx, pdf-lib, fontkit
- `Modal`: role=dialog, aria-modal, focus trap, ESC, возврат фокуса
- CSV-экспорт: BOM, защита от formula injection, `.limit(10_000)`
- Секреты **не** в git-истории (проверено `git log --all` и `git grep` по HEAD)
- npm audit: 7 уязвимостей, все транзитивные через Storybook, в прод не попадают
