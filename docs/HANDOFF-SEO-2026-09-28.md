# Handoff: SEO-аудит 28.09.2026 → деплой

> Что изменено, что проверено и **как задеплоить**. Документ для любого агента-исполнителя.
> Исходный отчёт: `reports/AUDIT-2026-09-28.md`. Инварианты: `docs/SEO_INVARIANTS.md`.

## 1. Статус проверок

Все гейты прогнаны на финальной версии кода:

| Гейт | Команда | Результат |
|---|---|---|
| TypeScript | `node node_modules/typescript/bin/tsc --noEmit` | ✅ 0 ошибок |
| ESLint | `node node_modules/eslint/bin/eslint.js src` | ✅ 0 ошибок, 0 предупреждений |
| Unit-тесты | `npm run test:unit` | ✅ 835 passed, 1 skipped (80 файлов) |
| Production build | `npm run build` | ✅ Compiled 64s, 1408/1408 страниц |

### Проверено на реальном собранном билде (`.next/server/app/*.html`)

| Метрика | Было | Стало |
|---|---|---|
| `/blanks` размер HTML | **2.9 МБ** | **402 КБ** |
| `/blanks` карточек в документе | 570+ | 20 + пагинация ✅ |
| `/ai-yurist` `<meta>` после `<body>` | **17** | **0** ✅ |
| `/ai-yurist` тип маршрута | `ƒ` (Dynamic) | `○` (SSG + ISR) ✅ |
| `/resume` `<h1>` | **26** | **1** ✅ |
| `og:url` ≠ canonical | 7 страниц | **0** ✅ |
| `aria-controls` на закрытом списке | всегда (битая ссылка) | отсутствует ✅ |

Проверка og:url на всех 7 страницах (`about`, `autoteka`, `help`, `osago`, `privacy`, `terms`, `/`): `og:url == canonical` везде.

## 2. Что исправлено (13 файлов)

### Критичное

**`/blanks` — 2.9 МБ HTML → пагинация** (`src/components/blank/BlanksBrowser.tsx`)
Googlebot обрезает документ после 2 МБ; 570+ карточек рендерились одним SSR-документом. Группировка теперь применяется к `paged` (текущая страница, `PAGE_SIZE = 20`), а не ко всему `sorted`. Пагинация добавлена и в сгруппированный режим (её раньше не было вовсе).

**`/ai-yurist` — 17 meta-тегов вне `<head>`** (`src/app/ai-yurist/page.tsx`, `AiYuristClient.tsx`)
Корень проблемы — **не `useSearchParams`, а динамический рендер маршрута**. Страница читала `cookies()` (Supabase `getUser()`) и `searchParams` на сервере → маршрут становился `ƒ` (Dynamic). При **корневом `src/app/loading.tsx`** Next сначала флашит шелл, а блок metadata приходит позже и оказывается в конце `<body>`.

Проверено экспериментально: удаление `useSearchParams` + `<Suspense>` **само по себе не помогло** (17 meta остались). Помогло только снятие динамичности:
- страница стала статической: `revalidate = 3600` + `force-static`, серверные `cookies()`/`searchParams` убраны;
- `?topup=success` клиент читает из `window.location.search` обычным `useEffect` (без `useSearchParams`, который потребовал бы `<Suspense>`);
- авторизацию клиент определяет локально по cookie через `createClient().auth.getSession()` — тем же приёмом, что уже применён в `AutotekaClient`, поэтому анонимы и краулеры не получают 401 на `/api/ai/*`.
Бонус: исчез per-request вызов Supabase на публичной странице.

**`og:url` главной на 7 страницах** (`src/app/layout.tsx` + 6 страниц)
В root layout убран `openGraph.url: SITE_URL` — из-за него страницы без собственного OG наследовали `og:url` главной. `/about`, `/autoteka`, `/help`, `/osago`, `/privacy`, `/terms` переведены на `withSeo()` (он ставит canonical + og:url + нормализацию title/description). Главная получила явный `openGraph`.

**407 a11y-ошибок «Duplicate ID ARIA»** (`src/components/search/HeaderSearch.tsx`)
`aria-controls` указывал на `listboxId`, который рендерится только при `showList` — битая ссылка на **каждой** странице сайта. Теперь `aria-controls`/`aria-activedescendant` задаются только при `showList` (десктоп + мобильный).

**26 `<h1>` на `/resume`** (`src/lib/resume/render.ts`, `sampleCss.ts`, `page.tsx`, `ResumeBuilder.tsx`)
`<h1>` с именем из выгружаемого документа попадал в DOM страницы через превью-карточки. Добавлена `buildResumePreviewHtml()` — заменяет `h1/h2/h3` на `div.rvh1/.rvh2/.rvh3`; стили продублированы в `sampleCss.ts`, вёрстка не изменилась. **Выгрузка PDF/DOC не тронута** — там по-прежнему `buildResumeHtml`/`buildResumeDocHtml` с настоящими заголовками.

**7 фокусируемых элементов в `aria-hidden`** (`src/lib/resume/builderCss.ts`)
Drawer скрывался только `transform: translateX(102%)` — визуально скрыт, но фокусируем. Добавлен `visibility: hidden` в закрытом состоянии + transition.

### Прочее

- **Лейблы форм:** `BlogList.tsx`, `help/page.tsx`, `utils/UtilsTools.tsx` (search), `SumWords.tsx` (`htmlFor`+`id`), `DocCompare.tsx` (textarea), `AiYuristClient.tsx` (file).
- **Короткие title** (были 25–29 символов): `/about`, `/help`, `/contacts` расширены до ~60 через `withSeo`.
- **BreadcrumbList** добавлен на `/epts` и `/resume` — единственные изолированные страницы без него.

## 3. Что НЕ менялось (осознанно)

- **101 orphan-страница** — 98 `/documents/*` + 3 `/utils/*`. Они в sitemap, canonical корректен; Orphan = <2 входящих ссылок. Нужна контентная перелинковка, а не технический фикс.
- **Thin content** на 12 страницах (9 из 16 `/converter/*` — 264–292 слова). Нужно писать тексты.
- **Sitemap lastmod-drift** (143 стр.) — `lastmod` новее `dateModified` в разметке. Косметика для Яндекса.
- **Author bylines** — E-E-A-T 72%. Нужен автор/редактор в контенте.
- **Yandex `Clean-param`** в robots.txt — ни один краулер не проверяет; валидировать через Яндекс.Вебмастер.


## 4. Как задеплоить

### Шаг 1. Проверить состояние репозитория

```powershell
cd "D:\Мои сайты\site Dogovor"
git status --short
git rev-parse --abbrev-ref HEAD   # должно быть master
```

**Скрипт деплоя откажется работать при незакоммиченных изменениях или не в ветке `master`.**

### Шаг 2. Закоммитить

```powershell
git add -A
git commit -m "fix(seo): пагинация /blanks (2.9->0.13 МБ), meta вне head на /ai-yurist, og:url на 7 страницах, 407 a11y-ошибок ARIA, 26 h1 на /resume, лейблы форм"
```

> `reports/` в `.gitignore` — артефакты аудита в коммит не попадут.

### Шаг 3. Запустить деплой

```powershell
npm run deploy          # = git push vds master + запуск сборки в Dokploy
```

Если `DOKPLOY_API_KEY` не задан — скрипт выполнит только push и напомнит нажать Deploy вручную:
**Dokploy** `http://82.146.35.220:3000` → Applications → `dogovor-prod` → **Deploy**.

> ⚠️ **Не переключать Dokploy на GitHub.** С VDS до GitHub ~1 КБ/с, клоны рвутся. Источник — локальное зеркало `ssh://root@82.146.35.220/etc/dokploy/git/dogovor.git`, ветка `master`.

### Шаг 4. Дождаться выката

Сборка ~10 минут. Проверка:

```powershell
node scripts/deploy-watch.mjs                            # ждёт 200 на всех маршрутах
node scripts/deploy-content.mjs "/blanks|Каталог пустых"  # сверка содержимого
```

⚠️ `deploy-watch` проверяет только HTTP 200, **не содержимое**. Зелёный HTTP ≠ новый код.

## 5. Пост-деплой smoke (обязательно)

```powershell
npm run check:smoke:prod
```

Ручная проверка ключевых страниц (ожидаемые значения):

| URL | Ожидание |
|---|---|
| `/blanks` | HTML **< 2 МБ** (было 2.9), карточек ≤ 20, есть пагинация |
| `/ai-yurist` | **0** `<meta>` после `<body>`; canonical = `/ai-yurist`; og:url = `https://dogovor.expert/ai-yurist` |
| `/about` | og:url = `https://dogovor.expert/about` (не главная!) |
| `/resume` | ровно **1** `<h1>` (было 26) |
| `/` | без `aria-controls` на закрытом списке поиска |
| `/epts` | в JSON-LD есть `BreadcrumbList` |

Быстрая проверка одной командой:

```powershell
$h=(Invoke-WebRequest 'https://dogovor.expert/ai-yurist' -UseBasicParsing).Content
$head=$h.Substring(0,$h.IndexOf('<body'))
"metaInBody=$(([regex]::Matches($h.Substring($h.IndexOf('<body')),'<meta')).Count)"
"ogUrl=$(([regex]::Match($head,'og:url" content="([^"]+)').Groups[1].Value))"
"blanksBytes=$((Invoke-WebRequest 'https://dogovor.expert/blanks' -UseBasicParsing).RawContentLength)"
```

## 6. После успешного деплоя

```powershell
node scripts/indexnow.mjs   # если добавлялись/менялись URL
npm run audit:site          # повторный краул: Health Score должно вырасти
```

Ожидаемый эффект: HTML `/blanks` 2.9 → ~0.13 МБ, a11y-ошибки 407 → 0, `/resume` 26 → 1 `<h1>`, og:url корректен на всех страницах.

## 7. Откат

Если прод не поехал: панель Dokploy → `dogovor-prod` → **Deployments** → выбрать предыдущий успешный `done` → **Redeploy**. Либо `git revert` на master + повторный `npm run deploy`.
