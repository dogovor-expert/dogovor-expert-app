# SEO-инварианты (не ломать!)

> Вынесено из AGENTS.md (20.08.2026). Причина: SEO-схема — высокостабильный контракт, заслуживает отдельного документа.
> Обновлено 28.09.2026 по итогам полного краула 770 URL (см. `reports/AUDIT-2026-09-28.md`).

## Open Graph / canonical (аудит 28.09.2026)

- **`openGraph.url` в `src/app/layout.tsx` ЗАПРЕЩЁН.** Значение `SITE_URL` наследовалось всеми страницами без собственного `openGraph` — 7 страниц (`/about`, `/autoteka`, `/help`, `/osago`, `/privacy`, `/terms`, `/ai-yurist`) отдавали `og:url` главной. Главная задаёт его явно в `src/app/page.tsx`.
- Остальные страницы переведены на `withSeo({ path, title, description })` — он сам ставит `canonical`, `og:url`, `title` (≤60) и `description` (≤160). Не писать `alternates: { canonical }` вручную там, где можно `withSeo`.
- Проверка после правок метаданных: `og:url` страницы == её `canonical`.

## Размер HTML (аудит 28.09.2026)

- **Googlebot обрезает документ после 2 МБ.** `/blanks` отдавал 2.9 МБ (570+ карточек одним SSR-документом) — контент после обрезки не индексировался.
- `BlanksBrowser` рендерит **только текущую страницу** (`PAGE_SIZE = 20`) в обоих режимах — сгруппированном и плоском. Не возвращать рендер полного набора: группировка применяется к `paged`, а не к `sorted`.
- Новый каталог с сотнями карточек — пагинировать сразу.

## Метаданные вне `<head>` (аудит 28.09.2026)

- **`/ai-yurist` выдавал 17 meta-тегов в `<body>`.** Корень — **динамический рендер маршрута**, а не хуки. Страница читала `cookies()` и `searchParams` на сервере; при **корневом `src/app/loading.tsx`** Next стримит шелл, и весь блок metadata (description, robots, canonical, og:*, twitter:*) приходит уже в конце `<body>`.
- Проверено экспериментально: удаления `useSearchParams` и `<Suspense>` **само по себе недостаточно**. Помогает только снятие динамичности.
- **Диагностика:** если в HTML `<meta>` встречается после `<body>` — смотрите, не `ƒ` (Dynamic) ли маршрут в выводе `next build`. Лечится переводом в SSG/ISR.
- **НЕ возвращать в `/ai-yurist`:** `cookies()`, чтение `searchParams`, `force-dynamic`, обёртку в `<Suspense>`, хук `useSearchParams`. `?topup=success` читается в клиенте из `window.location.search`; сессия — из cookie через `createClient().auth.getSession()` (паттерн `AutotekaClient`).
- Публичные страницы, попадающие в sitemap, должны быть статическими. Динамические допустимы только для приватных (noindex) роутов.

## Доступность (аудит 28.09.2026)

- **ARIA-ссылки только на существующие элементы.** `aria-controls`/`aria-activedescendant` у `HeaderSearch` задаются только при `showList` — иначе 407 ошибок «Duplicate ID ARIA» на всех страницах сайта.
- **Превью-графика не должна протекать семантикой.** `buildResumePreviewHtml()` заменяет `h1/h2/h3` на `div.rvh1/.rvh2/.rvh3` (стили продублированы в `sampleCss.ts`). Выгрузка PDF/DOC — через `buildResumeHtml`/`buildResumeDocHtml` без замены. На `/resume` должен быть **ровно один `<h1>`**.
- **Скрытые панели — `visibility: hidden`**, а не только `transform` (`.rvb-drawer` в `builderCss.ts`): трансформ оставляет фокусируемые элементы в DOM и в a11y-дереве.
- **Каждое поле формы** имеет `<label htmlFor>` или `aria-label`. Placeholder не считается подписью.

## Посадочные документов

- `/documents/[slug]` (slug = `t.id` из LEGAL_TEMPLATES) — SSG (`generateStaticParams` + `dynamicParams=false`). Не удалять; не менять URL-схему без согласования — на неё завязаны sitemap, canonical, JSON-LD, перелинковка и уже отправленные в IndexNow URL.
- **Title-паттерн посадочных:** `"{name} — образец {YEAR}: составить и скачать бесплатно"`, `YEAR = new Date().getFullYear()` (не хардкодить год). Description = `t.description` + «Заполнение онлайн за 5 минут: PDF и DOCX, без регистрации, бесплатно. Образец {YEAR} года.» — обрезать через `truncateWord(desc, 200)` (по границе слова + «…», НЕ `slice`).

## Robots

- **Robots посадочных:** `documents/layout.tsx` не трогать — его `robots: {index:false, follow:false}` нужен личному кабинету `/documents`. В `generateMetadata` `[slug]/page.tsx` ОБЯЗАТЕЛЬНО `robots: {index:true, follow:true}` + `googleBot` — дочерние метаданные переопределяют layout; удаление вернёт noindex на все 570 посадочных.
- **robots.txt:** `Disallow: /documents$` и `/documents/$` (точные пути, НЕ `Disallow: /documents` — иначе убьёт посадочные). Приватные `/login /billing /dashboard /settings /trash /preview /api/` — в Disallow.

## Middleware

- `/documents` — ТОЛЬКО точная проверка `pathname === "/documents" || pathname === "/documents/"`. НЕ добавлять `/documents` в PROTECTED_PREFIXES (редирект на /login убьёт посадочные).

## Sitemap

- `src/app/sitemap.ts` (динамический): статический `public/sitemap.xml` удалён — не создавать заново. sitemap = служебные (24) + документы (570, lastmod из `t.lastUpdated`) + вариации (36) + конвертеры (15) + калькуляторы (23) + блог (индекс + 104 статьи, lastmod из `updatedAt`).
- `robots.txt`: `Disallow: /documents$`, `/documents/$` (точные пути, НЕ `Disallow: /documents` — иначе убьёт посадочные) и `Disallow: /preview`. Приватные `/login /billing /dashboard /settings /trash /admin /debug /approve /api/ /auth/ /builder /connections` — в Disallow ОБОИХ блоков (`User-agent: Yandex` и `User-agent: *`). Новый шаблон/статья автоматически попадают. Парсер lastmod понимает именительный И родительный падежи месяцев («Апрель»/«апреля»).

## templatesMeta.ts

- После ЛЮБОГО изменения `src/data/templates/*.ts` (имена, описания, новые шаблоны) перегенерировать: `npx tsx scripts/generate-templates-meta.mts` (570 записей). Не редактировать файл вручную.

## Имена шаблонов уникальны (аудит 21.08.2026)

- `auto-lease` = «...между физическими лицами (без экипажа)»
- `rental-car` = «...без экипажа» (универсальная)
- `free-use-contract` = «...(простая ссуда)»
- `loan-use` = «...(ссуда)»

Не давать двум шаблонам одинаковое name — каннибализация выдачи.

## JSON-LD

- Organization+WebSite+SearchAction — в корневом `layout.tsx` (`<head>`).
- Посадочные: BreadcrumbList+FAQPage+WebPage (из `src/lib/seo/faq.ts` и `src/components/seo/JsonLd.tsx`).
- Блог: Article.
- FAQ на страницах документов берётся из `faqForTemplate(category)` — НЕ хардкодить отдельный FAQ в page-компонентах.

## Open Graph

- `og.url` НЕ задавать в корневом layout (жёсткий URL на всех страницах — баг; задавать в metadata каждой страницы).

## Блог

- `src/data/blog/posts.ts` — единый источник. Новая статья = 1) добавить объект в `BLOG_POSTS`, 2) не использовать в `relatedDocs` несуществующие id шаблонов (проверять grep по `src/data/templates/*.ts`), 3) sitemap подхватится автоматически, 4) задеплоить, 5) `node scripts/indexnow.mjs`.

## IndexNow

- Ключ: `60f95e2da98647ee80eb7f741083f90c` (файл `public/60f95e2da98647ee80eb7f741083f90c.txt`).
- После деплоя с новыми/изменёнными URL: `node scripts/indexnow.mjs` (сначала подождать ~2–3 мин после публикации ключевого файла, иначе 403 SiteVerificationNotCompleted; успех = 200/202).

## Вариации шаблонов (programmatic)

`/documents/v/[slug]` — programmatic-посадочные, порождаемые из `src/data/docVariations.ts` (единый источник, `DOC_VARIATIONS`). Сейчас 36 вариаций (пилот был 12). SSG: `generateStaticParams` + `dynamicParams=false`, `revalidate=3600`, `dynamic="force-static"`, sitemap-группа с priority 0.6 / monthly.

**Порог уникальности** — вариация допустима ТОЛЬКО если выполнено ВСЁ:
1. Свои H1 / title / description (title ≤ 60 симв., description 140–160) — не повторяют `name`/`description` родителя и друг друга;
2. Свои FAQ (3–4, не дублирующие `faqForTemplate(категория)` и GENERAL_FAQ);
3. Блок «Особенности вариации» — ≥3 реальных отличий содержания (условия/стороны/платежи/реквизиты/последствия), не SEO-пустословие;
4. SEO-справка (normNotes) 1–2 абзаца со ссылками на нормы, релевантные именно вариации;
5. canonical — САМ на себя (`/documents/v/{id}`), вариация уникальна и не каннибализирует родителя;
6. Если вариация не дотягивает до порога — НЕ создавать (лучше меньше, но качественно);
7. Новые вариации = спринт ≤ 100–200 страниц с контролем индексации через 2–4 недели (из indexnow/Я.Вебмастер).

**Запреты:** не менять схему `/documents/[slug]`; каждая вариация `templateId` обязан существовать в `LEGAL_TEMPLATES`; h1 вариации не должен совпадать с `name` родителя; год в заголовке не хардкодить — `YEAR = new Date().getFullYear()`, добавляется в `generateMetadata` к `variation.title`.

## Калькуляторы `/utils/[tool]` (22 страницы)

`/utils/[tool]` — отдельные SEO-посадочные для каждого калькулятора, порождаемые из `src/data/calculator-tools.ts` (единый источник, `CALCULATOR_TOOLS`). SSG: `generateStaticParams` + `dynamicParams=false`, `revalidate=3600`, `dynamic="force-static"`, sitemap-группа priority 0.7 / weekly. Хаб `/utils` остаётся интерактивным каталогом и НЕ переписывается.

**Правила:**
1. `CalculatorTool.id` обязан совпадать с ключом `CalculatorRunner.COMPONENTS` и id инструмента в `UtilsTools` (инвариант закреплён тестом `src/data/__tests__/calculatorTools.test.ts`).
2. Уникальные title (≤ 70 симв.) / H1 / description (120–175 симв.) / keywords; canonical — сам на себя; `robots: index, follow`.
3. Обязательные блоки: формула + правовое основание (`norms`), HowTo (3 шага), SEO-текст (≥ 2 абзаца), FAQ (≥ 3) с `FAQPage` JSON-LD; плюс `BreadcrumbList` и `WebApplication`.
4. `iconName` должен присутствовать в маппинге `ICONS` в `src/app/utils/[tool]/page.tsx`.
5. Интерактив монтируется только клиентским `CalculatorRunner` (`dynamic(..., {ssr:false})`); `page.tsx` остаётся server component.
6. Рекламный слот `CALC_RESULT` — под FAQ, вне рабочей зоны калькулятора.

**Запреты:** не переписывать хаб `/utils` и `UtilsTools`; не хардкодить ставки/лимиты в тексте, если они есть в `src/lib/legal/*` (источник истины — код); не удалять related-перелинковку (обеспечивает обход кластера без ссылок с хаба).

## Сравнение редакций `/sravnenie-dogovorov`

`/sravnenie-dogovorov` — SEO-лендинг инструмента «Сравнение редакций договора + протокол разногласий». Server component: `withSeo` (canonical self, `robots: index, follow`), `dynamic="force-static"`, `revalidate=3600`, sitemap priority 0.7 / monthly. Интерактив — client-island `DocCompare`, весь расчёт в браузере.

**Правила:**
1. Разбор договоров — только на клиенте (`src/lib/diff.ts`, `src/lib/docText.ts`, `src/lib/protocol.ts`); содержимое документов НЕ отправлять на сервер (152-ФЗ).
2. SEO-текст и FAQ — в `src/data/doc-compare.ts` (единый источник); на странице `BreadcrumbList` + `FAQPage` + `WebApplication`.
3. Дифф — собственный (`src/lib/diff.ts`), без внешних библиотек; при больших входах срабатывает `MAX_LCS_CELLS` (деградация в delete+insert) — это ожидаемо.
4. Экспорт DOCX — через `exportToDocxHtml`; имя файла передаётся БЕЗ расширения (`.docx` добавляется внутри).

**Запреты:** не подключать внешние diff-библиотеки без необходимости; не переносить сравнение на сервер; не удалять пункт навигации и строку в sitemap.

## Акция PRO 299 ₽ (19.08.2026)

- Единый источник — `src/lib/pricing.ts`: `PRO_PRICE=299`, `PRO_PRICE_OLD=990`, `PROMO_LABEL="-70%"`, `PROMO_ENDS_AT=2026-09-20T23:59:59+03:00`, `isPromoActive()`, `currentProPrice()`, `formatRub()`. Платежи (`/api/billing/create-payment`, `/api/billing/auto-renew`) берут сумму ТОЛЬКО через `currentProPrice()` — после дедлайна акция гаснет автоматически.
- Показ промо: `billing/page.tsx` (бейдж, зачёркнутая 990, «Выгода 691 ₽», таймер `CountdownTimer.tsx`, CTA «Оформить PRO за 299 ₽», «Отмена в любой момент…»), `dashboard/page.tsx`, `PaywallModal.tsx`, `login/page.tsx` (RegisterPromo — шаг email и перед кнопкой регистрации), `PromoPill.tsx` в шапке AppLayout (скрыта для PRO-пользователей и на `<md`; данные — `/api/subscription-status`).
- `/billing` закрыт авторизацией — гость редиректится на `/login?next=%2Fbilling`; контент биллинга грузится клиентом (fetch `/api/subscription-status` + `/api/billing/history`).
- Проверено на проде 19.08.2026 авторизованным e2e-скриптом (все 8 чеков: 299/990/strike/timer/выгода/CTA/отмена). Тестовый аккаунт `promo-test@dogovor.expert` / `PromoTest123!` (email подтверждён, без подписки).
- Владелец: `pochta.alik@gmail.com` (id `1c402366-877a-412e-83d8-d19cc507458a`) — is_admin=true, подписка PRO active до 2036-08-16 (выдана через Management API).

Отчёт: `SEO-REPORT.md` (фазы 1–6).