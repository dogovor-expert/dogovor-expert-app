# Глубокий аудит сайта Dogovor.expert

**Дата аудита:** 30.08.2026
**Объект:** `D:\Мои сайты\site Dogovor` (Next.js 15.5 / React 19 / TypeScript / Tailwind 3.4 / Supabase)
**Метод:** независимый статический анализ кодовой базы (318 `.ts/.tsx`, 23 тест-файла, 13 миграций Supabase)

---

## 0. Краткий вердикт

Проект **существенно выше среднего уровня** для проекта одного разработчика. Архитектура продумана, безопасность на уровне «production-ready» (санированный рендер, RLS в БД, защита админ-API, 2FA, CSP, rate-limit). Главные зоны роста — **визуальная полировка/консистентность дизайна** (требует сверки через `audit-shots`+axe) и **тонкая настройка CSP** (`'unsafe-eval'`, широкие CDN). Замечания по адаптивности и `next/image` из первой версии аудита признаны ложными после глубокого анализа (см. разделы 3 и 6).

**Итоговая оценка: 8.3 / 10** (после устранения мёртвого кода и чистки CSP; сильный функционал, безопасность и адаптивность).

---

## 1. Архитектура и стек

| Слой | Реализация |
|------|-----------|
| Фреймворк | Next.js 15.5.23 (App Router), React 19.0.8, `reactStrictMode: true` |
| Язык | TypeScript 5.5 (strict-совместимый конфиг) |
| Стили | Tailwind 3.4.17 + кастомные дизайн-токены (`doc-skin-*`, `brand-*`) |
| БД / Auth | Supabase (Postgres + RLS + SS Auth), `@supabase/ssr` |
| Экспорт | `pdf-lib` (+ `@pdf-lib/fontkit`), `docx`, `mammoth` (импорт), `react-to-print` |
| OCR | `tesseract.js` (распознавание сканов договоров) |
| Платежи | ЮKassa (`YOOKASSA_*`), авто-продление через cron |
| Аналитика | Яндекс.Метрика (mc.yandex.ru) |
| Чат | Собственный SupportLauncher (Telegram-мост + Upstash Redis), без Jivo |
| Внешние | inzuro/polis.online (страховые виджеты), DaData, Autoteka, Telegram-бот |
| Инфра | Vercel (`@vercel`, `vercel.json`) |

**Структура маршрутов:**
- Публичные страницы: `/`, `/templates`, `/documents/[slug]`, `/blog`, `/converter`, `/osago`, `/dkp`, `/autoteka`, `/techosmotr`, `/tahograph`, `/about`, `/contacts`, `/privacy`, `/terms`, `/help`, `/blanks`, `/preview`, `/approve/[token]`
- Личный кабинет: `/dashboard`, `/documents`, `/builder`, `/settings`, `/billing`, `/trash`, `/security`, `/connections`
- Админ: `/admin/*` (users, payments, leads, subscriptions, feedback, audit, search)
- API: ~38 route-handlers (`/api/*`), включая billing/webhook, telegram/webhook, cron/*

**Оценка:** 9/10 — модульная, масштабируемая, понятная.

---

## 2. Визуал / UX

**Сильные стороны**
- Единый `AppLayout` с сайдбаром для авторизованных зон, кастомные «шкуры» документа (`doc-skin-*`), self-hosted шрифты (Inter / Playfair / JetBrains Mono через `next/font` — без раунд-трипа к Google).
- Продуманный билдер: `LivePreviewPanel`, `PreviewStage`, пагинация A4, чек-листы, калькуляторы.

**Слабые стороны / риски**
- ⚠️ Удалён мёртвый компонент `TopNav.tsx` (никем не импортировался — публичные страницы используют единый `AppLayout` с бургер-сайдбаром). См. раздел 3.
- Нет единого дизайн-системного файла компонентов в видимом виде; визуальная консистентность держится на Tailwind-утилитах и токенах, но требует визуальной сверки (рекомендую прогнать `audit-shots` + axe).
- Мелкие моменты: `bg-${accentColor}-500` (динамический класс Tailwind) — работает только если эти оттенки присутствуют в сборке; риск «невидимой» кнопки, если цвет не в джит-сейф-листе.

**Оценка:** 7/10.

---

## 3. Адаптивность

- Breakpoint-классы в коде: `sm:` 127, `md:` 22, `lg:` 65, `xl:` 6. Активно используются `sm`/`lg`, `md` немного.
- **Единый `AppLayout` покрывает ВСЕ страницы** (и публичные, и кабинет): сайдбар-бургер (`lg:hidden`, оверлей, aria-метки «Открыть/Закрыть меню») с полной навигацией (Главная, Блог, Инструменты, Документы, Аккаунт, Политика/Соглашение/О сервисе). Мобильная навигация **присутствует**.
- Компонент `TopNav.tsx` **не используется** (мертвый код, удалён 2026-08-31) — путал анализ; публичные страницы навигацию получают через `AppLayout`.
- Тяжёлые блоки (`w-[794px]` в blanks — ширина A4) намеренно фиксированы для печати, но на мобиле превью может требовать горизонтального скролла.

**Оценка:** 8/10. Мобильная навигация реализована корректно через бургер.

---

## 4. Безопасность

**Сильные стороны (критичные)**
- ✅ Все `/api/admin/*` route вызывают `getAdminUser()` (`@/lib/admin-auth`) — проверка прав **внутри каждого handler**, а не только в middleware. Gap'ов нет (проверено перебором всех admin route).
- ✅ `dangerouslySetInnerHTML` для рендера документов **санируется**: `src/lib/renderDocument.ts` импортирует `isomorphic-dompurify` и вызывает `DOMPurify.sanitize()` (строки 31-32, применяется 341, 373). XSS через пользовательский ввод в документах — закрыт.
- ✅ `middleware.ts` защищает `/admin` и `/debug` страницы, с проверкой `is_admin` (JWT app_metadata → fallback в `profiles.is_admin`) и **принудительным 2FA (aal2)** при `ADMIN_REQUIRE_2FA=true` или включённом MFA.
- ✅ CSP задан жёстко (белый список доменов, `worker-src blob:`, `frame-src` для виджетов). HSTS `max-age=31536000; preload`. `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`, `Permissions-Policy` (камера/микрофон/гео выключены).
- ✅ RLS включён на ключевых таблицах (accounts, contractors, leads, approvals, reports, persons, feedback, admin_audit, autoteka_usage, payments — см. `006_fix_payments_rls`, `009_billing_write_lock`).
- ✅ Экспорт CSV экранирует формульную инъекцию (`csvEscape` — префикс `'` для `=+-@`).
- ✅ Rate-limit через Upstash на публичных/внешних API (chat, dadata, email-export, feedback, leads, approval, billing/webhook).
- ✅ `auth/callback` защищён от open-redirect (`safeNext`).
- ✅ `.env.*` в `.gitignore` и **не закоммичены** (проверено `git ls-files` — пусто).

**Риски / замечания**
- ⚠️ `next.config.mjs` CSP содержит `'unsafe-eval'` в `script-src`. Это ослабляет CSP (необходимо для некоторых виджетов/Next dev, но в проде желательно убрать, если возможно).
- ⚠️ `.env.local` лежит в рабочей папке и содержит **реальные секреты** (`SUPABASE_SERVICE_ROLE_KEY`, `YOOKASSA_SECRET_KEY`, `TELEGRAM_BOT_TOKEN`, `UPSTASH_REDIS_REST_TOKEN`, `TRONK_API_KEY`). Они вне git — ок, но: (а) файл физически на дике; (б) убедиться, что он не попадает в бэкапы/синхронизацию (Яндекс.Диск и т.п.).
- ⚠️ `X-XSS-Protection: 0` — это корректно (устаревший заголовок), но зависимость только от CSP.
- ⚠️ `script-src` разрешает `https://unpkg.com` и `https://cdn.jsdelivr.net` — широкие источники; если один из CDN скомпрометирован, вектор XSS сохраняется.

**Оценка:** 8.5/10 — один из сильнейших разделов.

---

## 5. SEO

**Сильные стороны**
- ✅ `metadataBase`, `title.template`, `description`, `keywords` в root layout.
- ✅ OpenGraph + Twitter cards, локаль `ru_RU`, OG-картинка 1200×630.
- ✅ `src/app/sitemap.ts` (динамическая), `public/robots.txt` (223 байта), `manifest.webmanifest`.
- ✅ JSON-LD компонент (`@/components/seo/JsonLd`) с экранированием `</script>`.
- ✅ `Canonical` компонент, self-hosted шрифты (нет FOUT от внешних шрифтов → лучше Core Web Vitals).
- ✅ `redirects()`: www → non-www (canonical host), `/constructor` → `/builder`.

**Риски**
- ⚠️ Нет видимого `hreflang` (если планируется i18n — неактуально для RU).
- ⚠️ Нет отдельной `robots` в `app/robots.ts` (есть статический файл — ок, но динамический дал бы больше контроля).
- ⚠️ Нет явных семантических `JSON-LD` типов для Article на блоге (проверить `blog/[slug]`).

**Оценка:** 8.5/10.

---

## 6. Производительность / оптимизация

**Сильные стороны**
- ✅ Code-splitting тяжёлых библиотек через `webpack.splitChunks` (tesseract, pdf-lib, docx, pdfjs, fontkit, lucide, date-fns) — отдельные async-чанки.
- ✅ `reactStrictMode`, self-hosted шрифты, `display: swap`.
- ✅ Rate-limit и публичные маршруты в middleware обходят Supabase (экономия TTFB 50-200мс).

**Риски**
- ℹ️ **`next/image` используется в 1 месте при 10 сырых `<img>`** — НО при глубоком анализе выяснилось, что все 10 `<img>` это data-URI (QR-код 2FA), Supabase-аватары, превью сканов (`DocScanner`) и постраничные снимки PDF (`PdfPreview`). Для data:/blob:/SVG `next/image` либо неприменим (`dangerouslyAllowSVG` + `unoptimized`), либо не даёт выгоды (уже оптимизированные blob). **Массовая замена не рекомендуется** — испортит без выгоды. Если позже появятся внешние статические изображения (логотипы партнёров, баннеры), их стоит вести через `next/image` + `images.remotePatterns` для `xkakhztknlpzqarklewq.supabase.co`.
- ⚠️ OG-картинка `og-image.png` 119 КБ — приемлемо, но можно WebP.
- ⚠️ `next.config` грузит `bundle-analyzer` только при `ANALYZE=true` — ок, но нет постоянного бюджета на размер бандла.

**Оценка:** 7/10.

---

## 7. Инструменты (dev / test / CI)

- ✅ Vitest 4.1 + `@vitest/coverage-v8`, Playwright 1.62 (e2e + a11y через `@axe-core/playwright`).
- ✅ Отдельные конфиги: `playwright.config.ts`, `playwright.prod.config.ts`, `vitest.config.mts`, `audit/` (a11y walkthrough).
- ✅ 23 тест-файла (unit + e2e + golden-render для документов).
- ✅ Полезные скрипты в `scripts/`: `audit-actsource`, `diag-all-pages`, `indexnow` (для быстрой индексации), `generate-blank-previews`, проверки виджетов/прототипов.
- ✅ `.github/workflows` — CI присутствует.
- ⚠️ Много отладочных логов в корне (`dbg.log`, `dev*.log`, `deploy*.log`, `fix-escape.js`, `dev_blank.log`) — мусор в репозитории; желательно вынести в `.gitignore` или папку `logs/`.

**Оценка:** 8.5/10.

---

## 8. Функционал

Полноценный SaaS-конструктор договоров:
- 🔧 Конструктор (`/builder`) с live-preview, экспорт в PDF/DOCX, печать, облачное сохранение (Supabase).
- 📄 Шаблоны и бланки (`/templates`, `/blanks`, `/documents`), импорт (`mammoth`), OCR сканов (`tesseract`), слияние маркеров (mustache).
- ✍️ Электронная подпись: `signCryptoPro.ts` (КриптоПро), `embedPades.ts` (PAdES-вкладыш), `crypto.ts`, `vault` (шифрование).
- 💳 Биллинг: ЮKassa, создание платежа, webhook, авто-продление (cron), история, подписки.
- 👥 Контрагенты (`/connections`), физлица (`persons`), DaData-подсказки.
- 🚗 Авто-сервисы: OSAGO, ДКП, Autoteka (пробег/история), техосмотр, тахограф — внешние виджеты + API.
- 🤝 Approval-флоу: ссылка `/approve/[token]` для контрагента подписать договор.
- 🛡️ Админка: пользователи, платежи, лиды, подписки, фидбэк, аудит-лог (`admin_audit`), поиск.
- 📨 Email-экспорт, Telegram-бот (поддержка + webhook), собственный чат-виджет SupportLauncher (Telegram-мост).
- ♿ A11y-тесты (axe) и диагностика страниц.

**Оценка:** 9.5/10 — очень широкий и связный функционал.

---

## 9. Реализация (качество кода)

- ✅ Чёткое разделение `lib/` (чистая бизнес-логика: `renderDocument`, `billing`, `legal`, `crypto`, `ocr`) от UI.
- ✅ Типизация, зависимости актуальны (Next 15.5, React 19, Tailwind 3.4).
- ✅ Безопасные паттерны: нет `eval`/`new Function`/`document.write` в исходниках.
- ✅ Единая точка прав admin (`admin-auth.ts`) и admin-data.
- ⚠️ `next.config` длинный и содержит hardcoded CSP-домены — вынести в `lib/security.ts` для переиспользования.
- ⚠️ Присутствуют debug-страницы (`/debug/pdf`) — должны быть недоступны в проде (middleware их прикрывает, но стоит проверить, что они не попадают в сборку прод-роута).

**Оценка:** 8.5/10.

---

## 10. Приоритетные правки (по важности)

| # | Приоритет | Что | Почему |
|---|-----------|-----|--------|
| 1 | ✅ Сделано | Удалён мёртвый `TopNav.tsx` (не импортировался; мобильное меню уже есть в `AppLayout`) | Чистота кода, устранение ложной находки |
| 2 | ✅ Сделано | Удалены Jivo-домены из CSP + чистка упоминаний (см. раздел 4) | Меньше поверхности атаки, актуальность |
| 3 | 🟠 Средний | Убрать `'unsafe-eval'` из CSP в проде (если возможно) | Усиление CSP |
| 4 | 🟡 Низкий | Сузить `script-src` CDN (unpkg/jsdelivr) или убрать, если не нужны | Уменьшение поверхности XSS |
| 5 | 🟡 Низкий | Проверить, что `/debug/*` не собираются в прод | Не должны быть в публичной сборке |
| 6 | 🟡 Низкий | Вынести debug-логи и `fix-escape.js` в `.gitignore`/`logs/` | Гигиена репозитория |
| 7 | 🟡 Низкий | Проверить JSON-LD Article на блоге + `hreflang` при необходимости | SEO-полировка |
| 8 | 🟢 Инфо | Убедиться, что `.env.local` не синхронизируется облаком | Защита секретов на диске |

---

## 11. Что уже сделано отлично (не трогать)

- Санированный рендер документов (DOMPurify) — главный XSS закрыт.
- Защита админ-API через `getAdminUser()` в каждом route.
- RLS на всех ключевых таблицах + принудительный 2FA для админов.
- Жёсткий CSP + HSTS + rate-limit.
- Self-hosted шрифты (CWV) и code-splitting тяжёлых либ.
- Полноценный test/e2e/a11y стек + CI.

---

*Аудит проведён статическим анализом без запуска live-сервера. Для финальной визуальной проверки рекомендуется прогнать `npm run test:e2e` + `audit/walkthrough.spec.ts` (axe) и сверить `audit-shots`.*
