# Dogovor — правила для агентов

## Обязательное: проверка PDF-экспорта
Нельзя писать «PDF-баг исправлен» без прогона skill `pdf-export-verify` (пункты 1-5: реальные данные, скачивание PDF с прода, программный анализ координат, проверка бандла). Проверка программная, не «на глаз».

## Деплой (Vercel)
- Загрузка идёт из `%LOCALAPPDATA%\Temp\opencode\proj` — перед деплоем синхронизировать: `robocopy /MIR /XD node_modules .git .next e2e test-results coverage .vercel /XF *.md *.log *.pdf <проект> <proj>` и обязательно скопировать свежий `.next` (`robocopy <проект>\.next <proj>\.next /MIR /XD cache`).
- ВНИМАНИЕ: НЕ исключать `*.png` из robocopy — `public/og-image.png` (OG-превью, 1200×630) и `public/apple-icon.png` (iOS-иконка, 180×180) обязаны попасть в деплой. Проверено 17.08.2026: `/XF *.png` в команде синхронизации приводил к 404 на обоих файлах при том, что `og:image`/`apple-touch-icon` ссылаются на них.
- ВАЖНО: `proj` должен содержать ВЕСЬ проект (src, public, конфиги, package.json/lock), а не только `.next` — Vercel запускает реальный `next build` в облаке. Если загрузить только `.next`, билд падает с `missing_pages_app` («Couldn't find any pages or app directory») или `NEXT_NO_VERSION` (нет package.json). Оба проверены 16.08.2026.
- `vercel-finalize.ps1` сам до-загружает `package.json`/`package-lock.json` из исходников и подменяет их sha в манифесте (в `.next` лежит служебный `package.json` — `{"type":"module"}`, билдеру он не подходит; без подмены — `duplicated_file_path`).
- «READY+PROMOTED» НЕ означает доставку кода. Проверять фактически: бандл с прода (маркер `this.y=o.h-i.top`), PDF с прода.
- НЕЛЬЗЯ заливать в деплой папку `.vercel` (и `.vercel/output`): если она попадает в файлы деплоя, Vercel подхватывает её как «prebuilt build artifacts» вместо реальной сборки и сайт отдаёт 404 на всех страницах (проверено 16.08.2026). То же касается `.next/cache` (build-кэш, в рантайме не нужен; большой `0.pack` может уронить загрузку). Синхронизация строго с `/XD .vercel` и `/XD cache`, иначе сайт «умирает».
- `npm run test:prod` — скачивает реальные PDF с прода (e2e/prod-export.spec.ts).

## Тесты
- Unit: `npm run test:unit` (vitest).
- E2E локальные: `npm run test:e2e` (playwright, 3100).
- E2E прод: `npm run test:prod`.

## Личные файлы
Не коммитить и не редактировать: prompt-для-нейросети.md, СКОРО_растаможка.md, на-потом.md (в корне репозитория).

## ГЛАВНОЕ ПРАВИЛО: связанные элементы при наполнении контентом (19.08.2026)
Любое добавление/изменение шаблона документа, поля, раздела, модуля или «любого другого контента» — это НЕ изолированная правка. Ниже — карта связей и обязательный чек-лист. Если не знаешь, какие элементы затронуты — сначала исследование (grep по id/классу/имени), потом правка, потом ВСЕ прогоны из чек-листа. НИКОГДА не помечать задачу «сделано» без полного прогона.

### Карта связей «шаблон → рендер → сканер → образцы»

**A. Шаблон** (`src/data/templates/*.ts`, `parts.ts`, `index.ts`):
- Каждый шаблон = объект LegalTemplate с полями (`src/data/types.ts`). Категория — из списка в `index.ts` (порядок важен: AUTO, FINANCE, REALTY, BUSINESS, RENTALS, SALES, CONTRACTS, HR, CLAIMS, FINANCE_ACTS, CORPORATE_WEB, FAMILY, OTHER, MIGRATION, LEGAL, POSTAL).
- Общие блоки — из `parts.ts` (pageShell, pairIntro, pairSign, sideFields, sideBlock, commonClauses, saleSign, rentSign). Повторяющиеся блоки/таблицы — из своего файла (finance-act.ts: itemsRepeating+itemsTable; corporate-web.ts: partyFields, operatorSign, foundersSign, signPairLeft).
- Обязательные поля типов: select/radio со значениями порождают флаги `field_is_<value>` (только ASCII-значения) в renderDocument; числовые поля автоматически получают `<id>_words` (прописью) — НЕ объявлять такие поля вручную.
- Счётчик шаблонов: `src/lib/__tests__/templates.test.ts` ожидает точное число (сейчас 369). Добавил шаблон → обнови счётчик.

**B. Поля и валидация**:
- `src/lib/format.ts` — applyFieldFormat (НИКОГДА не форматировать `*_words` как числа), buildTemplateDefaults (defaultValue + флаги статусов). Новый шаблон без дефолтов ломает загрузку черновиков (builder/page.tsx:571 — слияние `{...buildTemplateDefaults(template), ...draft.values}`).
- `src/lib/validation.ts` — isFieldVisible/dependsOn; категории полей и статусы (`seller_status: person|ip|legal` и т.п.) должны быть согласованы с шаблоном (sideFields в parts.ts).
- Роль/статусные префиксы (seller, buyer, owner, driver, landlord, tenant, donor, donee, ...) — фиксированный список в `src/lib/docRequirements.ts` (PERSON_ROLES). Новый префикс роли → добавить в PERSON_ROLES + слоты + тесты docScanner.test.ts.

**C. Итоговые документы PDF/DOCX — КОНТРАКТНЫЕ классы и токены**:
- Рендереры читают ТОЛЬКО по классам HTML. Менять классы в шаблонах/parts.ts без сверки с рендерами = тихий слом:
  - `doc-title` (заголовок), `doc-sides` + `doc-sides-title` (блок «Стороны» — в PDF две колонки, в DOCX таблица 2×50% без рамок), `doc-price` (рамка цены), пустой `div.border-b` (линия-разделитель), `flex justify-between` (пара строк), таблицы `<table><th><td>`.
  - Размеры: px→pt = ×0.75 (text-xs = 9pt, text-sm = 10.5pt; кегли токенов: title 15, subheading 11.5, body 10.5, small 8.5, tiny 7.5), интервалы leading-normal/tight/relaxed, отступы mb-*.
- Токены — единый источник `src/lib/docDesign.ts` (3 стиля: classic/minimal/brand; диапазоны зафиксированы тестами docDesign.test.ts — менять токены = менять тесты). Шрифты: только TTF в `public/fonts` (OTF → CFF-сабсеттинг pdf-lib при save() крайне медленный). В тестах/скриптах Node шрифты оборачивать `new Uint8Array(readFileSync(...))` (jsdom-реалм, иначе pdf-lib падает).
- Известные баги-ловушки (исправлены 19.08.2026, регресс-тесты в docDesign.test.ts): орфан-цикл обязан удалять страницы предыдущего рендера (`removePage(0)` × prevCount); оценка высоты блоков sides/columns — только через LayoutEstimator (layoutLines), не «words.length × fontSize × lh»; в renderBlockWithWidth есть `case "row"`.

**D. Сканер документов (OCR)**:
- Модули: `src/components/builder/DocScanner.tsx`, `OcrScanner.tsx`; логика — `src/lib/docRequirements.ts` (getDocRequirements/getTemplateRoles — слоты паспорт/прописка/ПТС/СТС/ЭПТС/ВУ по id полей) и `src/lib/docOcr.ts` (extractPassportData, extractVehicleData, applyPassportToRole, applyVehicleToTemplate). Конвертер: `src/app/converter` + `src/components/converter/*` (OcrTool, PdfToImages, SignPdf, MergePdf, SplitPdf, ImagesToPdf, DocxToPrint) — всё на pdfjs-dist.
- Связь: слоты сканера строятся по ПОЛЯМ шаблона. Если новый шаблон использует паспортные/авто-поля с нестандартными id — сканer его не распознает. Именование фиксировано: `<role>_passport`, `<role>_passport_series`, `<role>_passport_number`, `<role>_passport_issued_by`, `<role>_passport_code`, `<role>_address`, `<role>_birthday`, `car_vin`, `car_pts`, `car_epts`, `car_sts`.
- После любых изменений полей/шаблонов — прогнать `src/lib/__tests__/docScanner.test.ts` (роли, слоты, извлечение, применённые данные).

**E. Образцы и debug**:
- Папка `samples/` УДАЛЕНА 19.08.2026 (образцы больше не нужны пользователю). Тесты `src/lib/__tests__/gen-samples.test.ts` и `gen-samples-docs.test.ts` ИСКЛЮЧЕНЫ из vitest (см. vitest.config.ts) — при желании пересоздать образцы временно вернуть их в конфиг и прогнать вручную.
- `src/app/debug/pdf/page.tsx` — SAMPLE обязан содержать флаги статусов (`seller_status`, `buyer_status`, `seller_data_mode`, `buyer_data_mode`, `claim_period` и т.п.), иначе условные секции рендерятся ПУСТЫМИ (реальный кейс: пропал блок «Стороны», 19.08.2026).
- `_total_pretty` (итог repeating-таблиц) вычисляется в `src/lib/renderDocument.ts` для фиксированного списка id — новый табличный шаблон → добавить его id в этот список.

### Обязательный чек-лист перед завершением ЛЮБОЙ задачи
1. `npx tsc --noEmit` — чисто.
2. `npx vitest run` — все тесты (счётчик шаблонов, docDesign, docScanner, renderDocument, validation, format, gen-samples...).
3. Если менялся шаблон/рендер/токены — открыть свежие образцы в `samples/` и `samples/10-docs/` и программно проверить: шапка/подвал, число страниц, отсутствие пустых полей и плейсхолдеров, нет дублей страниц, нет «дыр» > 60pt (кроме штатных отступов дизайна, напр. 76pt после `doc-title`), блок «Стороны» присутствует.
4. Если менялись шаблоны/контент, влияющий на каталог/сканер — проверить соответствующие тесты (templates, docScanner).
5. Задеплоить и проверить прод фактически (см. ниже).

### Деплой и проверка прода (актуальный флоу 19.08.2026)
- Деплой: `npx vercel --prod --yes --cwd "D:\Мои сайты\site Dogovor"` (прямой флоу; robocopy-флоу ниже — старый, использовать только если прямой падает).
- «Ready» ≠ код на проде. Проверять фактически: скачивание PDF с прода через playwright (`%TEMP%\opencode\e2e-*.cjs` — chromium из ms-playwright; селекторы: кнопка по тексту «Скачать PDF», select по индексу; ждать гидрации: клик → появление «Генерация…») и программный анализ скачанного PDF через pdfjs-dist (`node_modules/pdfjs-dist/legacy/build/pdf.mjs`, polyfill DOMMatrix; скрипты `%TEMP%\opencode\check-gaps-file.cjs`, `dump-lines.cjs` — текст с y-координатами, зазоры, дубли страниц).
- Кириллица в PowerShell: `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8` перед запуском node-скриптов; чтение файлов — ReadAllText(..., UTF8).

## Подсказки DaData и сохранённые лица (19.08.2026)
- Прокси `/api/dadata` (ops: find-party, suggest-party, suggest-address, suggest-fms_unit) возвращает `{error:"subscription required", fallback:true}` без серверного ключа — тогда фронт ходит напрямую в suggestions.dadata.ru с ключом пользователя из `localStorage.dadata_key` (тот же ключ, что в панели «поиск по ИНН»). НЕ менять формат ответа без сверки с `src/components/builder/DadataSuggest.tsx`.
- Автоподсказки в форме (`DadataSuggest.tsx` + FormField): поля `*_passport_code` → suggest-fms_unit (при выборе заполняются `*_passport_issued_by`/`*_passport_by`/`*_passport_issued`), поля `*_address` → suggest-address (при выборе заполняется `city`, если пусто). Заполнение связанных полей идёт через `onSuggestFill` → `handleSuggestFill` (builder/page.tsx) — применяется ТОЛЬКО к существующим и пустым полям шаблона.
- Маска `XXX-XXX` в format.ts применяется к `department_code` И `*_passport_code` (не менять).
- Таблица `public.persons` (миграция `supabase/migrations/008_persons.sql`) — сохранённые физлица. API `/api/persons` (GET/POST/DELETE) зеркалит `/api/contractors`. Панель «Сохранённые лица» (PersonsPanel) с кнопками по ролям из `getTemplateRoles` (PERSON_ROLES в docRequirements.ts — источник правды по префиксам ролей). Маппинг роль↔данные — `src/lib/personMapping.ts` (roleToPerson/personToFields; слоты fio/birthday/phone/passport_series/passport_number/passport_issued_by/passport_code/address). «Мои данные» в панели — из `/api/profile` (full_name; телефон НЕ подставляется — в профиле нет паспорта).
- ПРИМЕНЯТЬ МИГРАЦИИ: при добавлении таблиц/полей в `supabase/migrations/*.sql` — выполнить их в БД (Management API `POST /v1/projects/<ref>/database/query` с токеном из справочника, или supabase db push / SQL editor). Миграция 008_persons.sql применена к проду 19.08.2026.
- Новые физлицо-поля в шаблоне должны попадать в слоты сканера/docOcr (именование `<role>_passport_*`/`<role>_address` фиксировано, см. выше).

## Акция PRO 299 ₽ (19.08.2026)
- Единый источник — `src/lib/pricing.ts`: `PRO_PRICE=299`, `PRO_PRICE_OLD=990`, `PROMO_LABEL="-70%"`, `PROMO_ENDS_AT=2026-09-20T23:59:59+03:00`, `isPromoActive()`, `currentProPrice()`, `formatRub()`. Платежи (`/api/billing/create-payment`, `/api/billing/auto-renew`) берут сумму ТОЛЬКО через `currentProPrice()` — после дедлайна акция гаснет автоматически.
- Показ промо: billing/page.tsx (бейдж, зачёркнутая 990, «Выгода 691 ₽», таймер `CountdownTimer.tsx`, CTA «Оформить PRO за 299 ₽», «Отмена в любой момент…»), dashboard/page.tsx, PaywallModal.tsx, login/page.tsx (RegisterPromo — шаг email и перед кнопкой регистрации), `PromoPill.tsx` в шапке AppLayout (скрыта для PRO-пользователей и на <md; данные — `/api/subscription-status`).
- `/billing` закрыт авторизацией — гость редиректится на `/login?next=%2Fbilling`; контент биллинга грузится клиентом (fetch `/api/subscription-status` + `/api/billing/history`).
- Проверено на проде 19.08.2026 авторизованным e2e-скриптом (все 8 чеков: 299/990/strike/timer/выгода/CTA/отмена). Тестовый аккаунт `promo-test@dogovor.expert` / `PromoTest123!` (email подтверждён, без подписки) — для проверки биллинга.
- Владелец: `pochta.alik@gmail.com` (id `1c402366-877a-412e-83d8-d19cc507458a`) — is_admin=true, подписка PRO active до 2036-08-16 (выдана через Management API).

## E2E-скрипты с сессией (19.08.2026)
- Для проверки авторизованных страниц прода: `%TEMP%\opencode\e2e-prod-billing-auth.cjs` — логин через supabase-js (ключ `NEXT_PUBLIC_SUPABASE_ANON_KEY` из `.env.production`, обрезать кавычки), cookie `sb-<ref>-auth-token` = `"base64-" + base64url(JSON.stringify(session БЕЗ user))` (формат @supabase/ssr v0.12; массив [at,rt,null,tt,ei,user] НЕ работает). Cookie: domain dogovor.expert, path /, httpOnly, secure, sameSite Lax. Playwright: `$env:NODE_PATH = "D:\Мои сайты\site Dogovor\node_modules"`, goto ждать `domcontentloaded` + retry ×3 (на проде бывают сетевые таймауты), баннер cookies кликать «Принять», контент биллинга ждать исчезновения «Загрузка…» (waitForFunction).

## Аудит-фиксы 20.08.2026 (важные инварианты, не ломать)
- **Вебхук YooKassa** (`src/app/api/billing/webhook/route.ts`): IP-allowlist (официальные подсети YooKassa + env `YOOKASSA_IP_ALLOWLIST` через запятую), верификация платежа через API `GET /v3/payments/{id}` (Basic auth) + сверка `amount.value`/`currency` с таблицей, идемпотентность по `row.status`. НЕ добавлять HMAC-проверку «для надёжности» — YooKassa НЕ подписывает вебхуки, работает только IP+API-verify. Клиентский `x-forwarded-for` на Vercel перезаписывается реальным IP (спуфинг невозможен, проверено).
- **RLS write-lock** (миграция 009): `anon`/`authenticated` НЕ имеют INSERT/UPDATE/DELETE на `subscriptions`/`payments`; `profiles_insert_own` WITH CHECK `is_admin=false`. Подписки/платежи создаёт ТОЛЬКО сервер (service_role). Новые миграции не должны возвращать клиентские гранты/политики на эти таблицы.
- **Экранирование**: `renderDocument.ts` НЕ вызывает `escapeHtml` для значений в view — экранирует только Mustache `{{}}`; в шаблонах используется `{{x}}`, НЕ `{{{x}}}` (тройные скобки = двойное экранирование, было 5422 таких мест, исправлено). Регресс-тесты в `renderDocument.test.ts`.
- **Rate limit** (`src/lib/ratelimit.ts`): Upstash sliding window; `clientIp()` здесь — единственный источник; в вебхуке — локальная копия (не импортировать, конфликт имён). Без `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` лимитеры no-op. Ключи Upstash для прода — ОТКРЫТАЯ ЗАДАЧА (спросить владельца).
- **Next 15**: `createClient()` из `@/lib/supabase/server` — async, вызывать ТОЛЬКО с `await` (28 вызовов уже обновлены); `params`/`searchParams` в роутах/страницах — `Promise` (await/useParams). Реакт-рефы в пропсах — `RefObject<T | null>`. Custom elements объявляются через `declare module "react" { namespace JSX ... }` (не global).
- **npm overrides**: postcss 8.5.26 + sharp 0.35.3 внутри next (иначе npm audit = 3 high). Целевое состояние: 0 vulnerabilities. Не обновлять next до 16 без согласования (ломает middleware→proxy, Turbopack).
- PATCH/DELETE `/api/documents/[id]` → 404 при отсутствии строки; `/api/export/email` требует авторизацию; `/debug` защищён middleware; `.env*.production` в .gitignore.
- Отчёт: `AUDIT-2026-08-19.md` (раздел 7 — статусы исправлений, верифицировано на проде 20.08.2026).

## SEO-инварианты 20.08.2026 (не ломать)
- **Посадочные документов**: `/documents/[slug]` (slug = `t.id` из LEGAL_TEMPLATES) — SSG (`generateStaticParams` + `dynamicParams=false`). Не удалять; не менять URL-схему без согласования — на неё завязаны sitemap, canonical, JSON-LD, перелинковка и уже отправленные в IndexNow URL.
- **Title-паттерн посадочных**: `"{name} — образец {YEAR}: составить и скачать бесплатно"`, `YEAR = new Date().getFullYear()` (не хардкодить год). Description = `t.description` + «Заполнение онлайн за 5 минут: PDF и DOCX, без регистрации, бесплатно. Образец {YEAR} года.» — обрезать через `truncateWord(desc, 200)` (по границе слова + «…», НЕ `slice`).
- **Robots посадочных**: `documents/layout.tsx` не трогать — его `robots: {index:false, follow:false}` нужен личному кабинету `/documents`. В `generateMetadata` `[slug]/page.tsx` ОБЯЗАТЕЛЬНО `robots: {index:true, follow:true}` + `googleBot` — дочерние метаданные переопределяют layout; удаление вернёт noindex на все 369 посадочных.
- **robots.txt**: `Disallow: /documents$` и `/documents/$` (точные пути, НЕ `Disallow: /documents` — иначе убьёт посадочные). Приватные `/login /billing /dashboard /settings /trash /preview /api/` — в Disallow.
- **Middleware**: `/documents` — ТОЛЬКО точная проверка `pathname === "/documents" || pathname === "/documents/"`. НЕ добавлять `/documents` в PROTECTED_PREFIXES (редирект на /login убьёт посадочные).
- **Sitemap** (`src/app/sitemap.ts`, динамический): статический `public/sitemap.xml` удалён — не создавать заново. sitemap = служебные (16) + документы (369, lastmod из `t.lastUpdated`) + блог (индекс + статьи, lastmod из `updatedAt`). Новый шаблон/статья автоматически попадают. Парсер lastmod понимает именительный И родительный падежи месяцев («Апрель»/«апреля»).
- **templatesMeta.ts**: после ЛЮБОГО изменения `src/data/templates/*.ts` (имена, описания, новые шаблоны) перегенерировать: `npx tsx scripts/generate-templates-meta.mts` (369 записей). Не редактировать файл вручную.
- **Имена шаблонов уникальны** (аудит 21.08.2026): `auto-lease` = «...между физическими лицами (без экипажа)», `rental-car` = «...без экипажа» (универсальная), `free-use-contract` = «...(простая ссуда)», `loan-use` = «...(ссуда)». Не давать двум шаблонам одинаковое name — каннибализация выдачи.
- **JSON-LD**: Organization+WebSite+SearchAction — в корневом `layout.tsx` (`<head>`). Посадочные: BreadcrumbList+FAQPage+WebPage (из `src/lib/seo/faq.ts` и `src/components/seo/JsonLd.tsx`). Блог: Article. FAQ на страницах документов берётся из `faqForTemplate(category)` — НЕ хардкодить отдельный FAQ в page-компонентах.
- **`og.url` НЕ задавать в корневом layout** (жёсткий URL на всех страницах — баг; задавать в metadata каждой страницы).
- **Блог**: `src/data/blog/posts.ts` — единый источник. Новая статья = 1) добавить объект в `BLOG_POSTS`, 2) не использовать в `relatedDocs` несуществующие id шаблонов (проверять grep по `src/data/templates/*.ts`), 3) sitemap подхватится автоматически, 4) задеплоить, 5) `node scripts/indexnow.mjs`.
- **IndexNow**: ключ `60f95e2da98647ee80eb7f741083f90c` (файл `public/60f95e2da98647ee80eb7f741083f90c.txt`). После деплоя с новыми/изменёнными URL: `node scripts/indexnow.mjs` (сначала подождать ~2–3 мин после публикации ключевого файла, иначе 403 SiteVerificationNotCompleted; успех = 200/202).
- Отчёт: `SEO-REPORT.md` (фазы 1–6).

## MCP-инструменты (подключены, экономно используй)
- **context7** — актуальная документация библиотек (Next.js 15, React 19, pdf-lib, supabase-js и т.д.). Когда не уверен в API/версии — `use context7`.
- **playwright** (local MCP) — браузер для проверки UI/снимков страниц на localhost и проде. Дополняет e2e-тесты, не заменяет их.
- **gh_grep** (grep.app) — поиск примеров кода на GitHub (например, как правильно использовать pdf-lib, supabase). Лёгкий, можно всегда.
- **firecrawl** — живой веб-поиск/скрейпинг (исследование конкурентов, проверка SEO/метаданных страниц).
- **sentry** — по умолчанию disabled в opencode.json. Включать (`enabled: true`) и пройти `opencode mcp auth sentry` только когда нужен разбор ошибок прода. Всегда выключай обратно, чтобы не раздувать контекст.

Правило: MCP-инструменты добавляют токены в контекст. Используй точечно, а не «на всякий случай». Для тяжёлых серверов — только через dedicated-агента.
---

## 🛡️ QUALITY GATE: БАРЬЕР ПРОТИВ CODEBASE ROT (2026-09-05)

Главная проблема агентной разработки — ИИ мыслит локально и не видит скрытых связей. Один правленный файл ломает десять потребителей. Чтобы разорвать цикл, в проекте внедрены **жёсткие автоматические барьеры**.

### Шаг 1. Анализ радиуса поражения (BLAST RADIUS) — ОБЯЗАТЕЛЕН

Перед редактированием любого файла X агент **ОБЯЗАН** явно выполнить:

`ash
node scripts/check-blast-radius.mjs <path/to/X>
# или для staged:
node scripts/check-blast-radius.mjs --staged
`

Скрипт найдёт **всех потребителей** через grep по rom '...X' / import('...X') / equire('...X') / упоминаниям в типах. В плане работ агент ОБЯЗАН явно перечислить:

- Файл, который меняется
- Список ВСЕХ потребителей (вывод скрипта)
- Как именно изменение повлияет на каждого потребителя

**Запрет на изменение контрактов:** не менять сигнатуру (props/args) и тип возврата без явного согласования. Новые параметры — только опциональные (param?: Type).

### Шаг 2. vitest related (ТОЛЬКО зависимые тесты)

`ash
npx vitest related <измененный_файл> --run
`

Запускает **только** тесты, импортирующие изменённый файл (напрямую или через цепочку). Если агент сломал контракт — красные тесты появятся мгновенно, до коммита.

Использовать ПОСЛЕ каждой правки:
`ash
npx vitest related src/lib/useCookieConsent.ts --run
npx vitest related src/components/builder/BuilderPage.tsx --run
`

### Шаг 3. TypeScript strict (npx tsc --noEmit)

	sconfig.json уже включён "strict": true + "noImplicitAny": true. **КРИТИЧНО:** запускать 
px tsc --noEmit после ЛЮБОЙ правки. Ошибка в потребителе — даже если агент этот файл не открывал — будет поймана компилятором.

### Шаг 4. Smoke-тесты (5 базовых сценариев)

e2e/smoke.spec.ts — 5 несменяемых сценариев:

1. Главная: 200 + title + h1
2. Каталог /templates: 200 + ≥1 карточка
3. /builder: 200 + форма
4. 404: статус 404 на несуществующей странице
5. Cookie consent: баннер виден, localStorage сохраняется

Запуск:
`ash
npm run check:smoke         # на localhost
npm run check:smoke:prod    # на https://dogovor.expert
`

**Правило:** если после правок падает хоть один smoke — изменения бракованы.

### Шаг 5. Модульная изоляция (Open-Closed в действии)

Каждый публичный модуль имеет index.ts — единственная точка входа снаружи. Внутренности (pi/, components/, utils/) нельзя импортировать напрямую.

**Примеры модулей с изоляцией:**
- src/lib/seo/ → import { withSeo } from '@/lib/seo'
- src/lib/cookies/ → import { useCookieConsent } from '@/lib/cookies'
- src/lib/pricing/ → import { currentProPrice } from '@/lib/pricing'

Если модуль не имеет index.ts — **создать его** (аудит 2026-09-05). Сейчас в активной работе: рефакторинг src/lib в features-style.

### 🎯 ФИНАЛЬНЫЙ ЧЕК-ЛИСТ ПЕРЕД СДАЧЕЙ

Агент НЕ ИМЕЕТ ПРАВА отчитываться о выполнении, пока **последовательно** не выполнит:

- [ ] **Blast radius:** 
ode scripts/check-blast-radius.mjs <изменённые> — все потребители перечислены
- [ ] **TypeScript:** 
px tsc --noEmit → 0 ошибок
- [ ] **vitest related:** 
px vitest related <изменённые> --run → все зелёные
- [ ] **Unit suite:** 
pm run test:unit → 0 падений
- [ ] **Smoke (опционально):** 
pm run check:smoke:prod если менялся публичный API
- [ ] **Build:** 
pm run build → нет ошибок
- [ ] **Browser console:** нет Uncaught Error / CSP Violation

### 📂 Где лежат правила для разных IDE-агентов

Проект поддерживает несколько IDE-агентов одновременно. **Все читают одни и те же правила** (этот файл + ниже):

| IDE/Агент | Файл | Статус |
|---|---|---|
| AGENTS.md (стандарт) | AGENTS.md | ✅ источник правды |
| GitHub Copilot | .github/copilot-instructions.md | ✅ краткая выжимка |
| Cursor | .cursorrules | ✅ краткая выжимка |
| Cline (VS Code) | .clinerules | ✅ краткая выжимка |
| Windsurf | .windsurfrules | ✅ краткая выжимка |
| Aider | .aider.conf.yml | ✅ read=AGENTS.md |
| Continue.dev | .continuerules.json | ✅ |

### 🔄 Pre-commit hook (автоматический барьер)

.husky/pre-commit запускает перед КАЖДЫМ коммитом:
1. 
px tsc --noEmit — TypeScript
2. 
pm run lint — ESLint
3. 
ode scripts/check-blast-radius.mjs --staged — blast radius
4. 
px vitest related — для первого staged .ts/.tsx файла
5. `node scripts/check-secrets.mjs` — gitleaks: секреты в staged-файлах (warning-пропуск, если gitleaks не установлен)

Если что-то падает — коммит отменяется. Обход только через git commit --no-verify (для экстренных случаев, см. CHANGELOG).
---

## 📐 AGENTS.md — стандарт [agents.md](https://agents.md/) (Linux Foundation)

Этот файл соответствует открытому стандарту gents.md, поддерживаемому OpenAI Codex, Claude Code, Cursor, Aider, Goose, opencode, Zed, Warp, VS Code, Junie. Поддерживается 60k+ open-source проектов.

### Правила приоритета
1. **Самый близкий к агенту AGENTS.md в дереве — побеждает** (root > src > src/lib > src/lib/supabase).
2. **Разделы ниже** — дополняют (не заменяют) родительские правила.
3. **Конфликт**: правило из более глубокого файла > правило из корня.

### Вложенные AGENTS.md (специфичные правила по разделам)
- src/lib/supabase/AGENTS.md — правила работы с Supabase (RLS, миграции, безопасные клиенты)
- src/lib/cloud/AGENTS.md — облачные провайдеры (Google Drive, Яндекс.Диск, Dropbox)
- src/components/AGENTS.md — правила UI (a11y, Storybook, Tailwind, lucide-react)
- src/app/api/AGENTS.md — правила API routes (Zod, rate limit, CSRF)
- src/app/admin/AGENTS.md — админка (защита, аудит, RLS-политики)
- src/lib/validations/AGENTS.md — Zod-схемы (контракты, реэкспорт)

### Канонический → обёртки для разных IDE
Этот AGENTS.md — **канонический** источник правды. Для IDE-агентов, которые ищут файл по-своему:

| IDE / Агент | Файл | Что внутри |
|---|---|---|
| Claude Code | CLAUDE.md | Симлинк на корневой AGENTS.md + 1-2 строки специфики Claude |
| GitHub Copilot | .github/copilot-instructions.md | Краткая выжимка (≤ 100 строк) |
| Cursor | .cursorrules | Краткая выжимка |
| Cline (VS Code) | .clinerules | Краткая выжимка |
| Windsurf | .windsurfrules | Краткая выжимка |
| Aider | AGENTS.md (нативно) | Уже работает |
| Continue.dev | .continuerules.json | Read = AGENTS.md |
| opencode | AGENTS.md (нативно) | Уже работает |

### Обновление AGENTS.md
- Любое изменение стека / команд / правил → обновить **все** файлы (CI-sync через .github/workflows/sync-agents.yml).
- НЕ дублировать README.md — они для разных аудиторий (README = пользователи, AGENTS = агенты).
- Лимит: ≤ 300 строк. Если больше — вынести в docs/ + вложенный AGENTS.md.

### Формат секций
`markdown
## Project overview
- Стек: Next.js 15.5 + React 19 + TypeScript strict
- БД: Supabase (PostgreSQL)
- Деплой: Vercel
- Шаблонов: 369, PRO-подписка через YooKassa
- Аналитика: Яндекс.Метрика (consent-gated), Sentry

## Setup commands
- Install: 
pm install
- Dev: 
pm run dev
- Verify (typecheck+lint+test): 
pm run verify
- Build: 
pm run build
- Deploy: 
px vercel deploy --prod -y --scope alikmmmm
- Smoke (prod): 
pm run check:smoke:prod

## Code style
- TypeScript strict, без ny и @ts-ignore
- ESLint + Prettier (Biome — отдельно для скорости)
- Tailwind utility, mobile-first
- lucide-react icons (импортировать по одному)
- React 19: use() для promises, server actions где возможно
- Все строки UI — на русском

## Testing instructions
- Vitest для unit (296+ тестов), Playwright для e2e
- Перед коммитом: 
pm run verify (typecheck + lint + test:unit)
- Перед деплоем: 
pm run check:smoke:prod (5 сценариев)
- Coverage: ≥ 60% (v8), не снижать

## Security considerations
- Все env vars — через Zod-валидацию (src/lib/env.ts — TODO)
- Supabase: server client в server actions, browser client в client components
- API routes: Zod-схема + CSRF (@/lib/csrf) + rate limit (@/lib/ratelimit)
- CSP через middleware (source-based: 'self' + 'unsafe-inline', см. src/middleware.ts; НЕ nonce/strict-dynamic — несовместимо с SSG prerender)
- Sentry для мониторинга (НЕ отключать)
- НЕ логировать токены, ключи, персональные данные

## Things to avoid
- НЕ использовать ny (strict mode)
- НЕ хардкодить строки на русском — выносить в константы
- НЕ создавать API route, если можно Server Action
- НЕ добавлять зависимости без обоснования (package.json diff)
- НЕ отключать линтер-правила, ESLint disable без reason
- НЕ коммитить .env*, секреты, ключи

## Commit conventions
- Conventional Commits (enforce через commitlint)
- eat:, ix:, chore:, docs:, efactor:, 	est:
- Scope: eat(auth):, ix(cookies):, chore(deps):
- Breaking: eat(api)!: или footer BREAKING CHANGE:
- release-please автоматически бампит версию + CHANGELOG.md
## Site audit protocol (added 05.09.2026, refactored)

### 1. Единая команда и файлы отчётов
- **`npm run audit:full`** — оркестратор аудита (3 фазы по скорости)
  - `--quick` только Phase 1 (typecheck + lint + blast + unit)
  - `--site-only` только Phase 3 (PSI + LHCI + Squirrelscan)
  - `--skip-prod` пропустить Phase 3
- **Файлы отчётов:**
  - `reports/audit-latest.md` — полный сводный отчёт (перезаписывается)
  - `reports/audit-history.md` — лог истории (дописывается по 1 строке)
  - `.lighthouseci/` — детальные отчёты Lighthouse по 5 страницам (gitignored)
  - `.squirrel/` — артефакты Squirrelscan (gitignored)

### 2. Phase 1 — Code static + unit (быстро, ~30с)
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint (0 errors обязательно)
- `npm run check:blast -- --staged` — blast radius по staged-файлам
- `npm run test:unit` — vitest, исключая интеграционные

### 3. Phase 2 — E2E + smoke (средне, ~2-3м)
- `npm run check:smoke` — 5 критичных сценариев локально (главная, /templates, /builder, 404, cookie consent)
- `npm run test:e2e` — Playwright 15 projects (5 viewports × 3 браузера) — для регрессий
- `npm run check:smoke:prod` — те же 5 сценариев против https://dogovor.expert

### 4. Phase 3 — Site audit (медленно, ~5м, удалённый прод)
- **PSI** (`scripts/psi.mjs` → `npm run psi`): Google PageSpeed Insights API = pagespeed.web.dev engine. Lab Lighthouse (perf/seo/bp/a11y, FCP/LCP/TBT/CLS/SI) + field CrUX metrics. Нужен `PSI_API_KEY` (Google Cloud, pagespeedonline API).
- **Lighthouse CI** (`lighthouserc.json` → `npm run lighthouse`): 5 ключевых страниц, desktop preset, отчёты в `.lighthouseci/`. Assertions = warn (не gate).
- **Squirrelscan** (`squirrel.toml` → `npm run audit:squirrel`): 150-страничный краул + 260 правил (SEO/a11y/perf/security/agents), LLM-friendly вывод.

### 5. Прочие полезные инструменты (вне audit:full)
- `npm run audit:acts` — канонический реестр НПА (статьи/диапазоны)
- `npm run check:blast` — blast radius (только staged, без `--`)
- `npm run check:secrets` — gitleaks по staged-файлам
- `npm run knip` — неиспользуемые exports/files/deps
- `npm run biome:check` / `biome:fix` — быстрая проверка стиля (альтернатива ESLint)
- `npm run test:integration` — vitest с реальной Supabase (требует запущенного supabase)
- `npm run test:prod` — Playwright против прода (только `prod-export.spec.ts`)
- `npm run semgrep` — 9 кастомных SAST-правил (dangerouslySetInnerHTML, window.open без noopener, cookies() в use client, process.env в client и др.) — в CI через `.github/workflows/semgrep.yml`
- `npm run analyze` — bundle analyzer (`ANALYZE=true next build`)

### 6. Триггер 1 — Прямая команда пользователя
Если пользователь пишет: *«проведи анализ сайта»*, *«сделай аудит»*, *«проверь сайт»*:
1. Запусти `npm run audit:full`.
2. Дождись записи в `reports/audit-latest.md`.
3. Выведи в чат компактную сводку: TypeScript/Lint/Unit, Lighthouse perf/a11y по 5 страницам, Squirrel Health Score + топ-3 проблемы.

### 7. Триггер 2 — Проактивное предложение после крупных работ
Агент **ОБЯЗАН** различать масштаб изменений:

**НЕ предлагать аудит (мелкие правки):**
- Опечатки, тексты, заголовки статей блога
- Изменение 1-2 цветов, отступов или стилей кнопок
- Точечные правки в одной изолированной функции без изменения DOM-структуры
- Фикс одного бага с известной причиной

**ОБЯЗАТЕЛЬНО предложить аудит (крупные / системные работы):**
- Добавление новой страницы или изменение `layout.tsx` / `middleware.ts`
- Изменение политики CSP, заголовков кэширования, конфигурации SEO/метаданных
- Оптимизация шрифтов, изображений, списков; рефакторинг тяжёлых компонентов
- Массовые правки a11y или удаление неиспользуемого CSS/JS
- Изменение `next.config.mjs`, `vercel.json`, `sentry.*.config.ts`
- Правка AGENTS.md / commitlint / husky / CI workflows

**Формат обязательного вопроса** в конце отчёта о крупной задаче:
> *«Внесены существенные изменения в [компоненты/страницы]. Запустить комплексный аудит (`npm run audit:full`) для обновления `reports/audit-latest.md`?»*

### 8. Примечания
- `audit:full` НЕ подключён в pre-commit / CI / vercel-build — это ручной инструмент, медленный, требует прод-доступ.
- squirrel free tier: local crawl only (no JS rendering). `squirrel auth` разблокирует полный аудит.
- PSI 429 = дневная квота без ключа; используй `PSI_API_KEY` или запускай реже.
- Phase 2 + 3 требуют локально поднятого `next start` либо прямого доступа к https://dogovor.expert.
- При обновлении этого регламента — синхронизируй `.cursorrules`, `.clinerules`, `.windsurfrules`, `CLAUDE.md` (см. `.github/workflows/sync-agents.yml`).
