# Deploy и проверка продакшена

> Вынесено из AGENTS.md (19.08.2026). Актуализировано под VDS 2026-09-18: прод переехал с Vercel на VDS/CapRover.

## ⚠️ Инвариант веток (master ↔ production)

Деплой идёт из ветки `production`, но **источник правды — `master`**. Соблюдайте правило:

- Все правки вносите в **`master`**; PR не используются.
- Деплой — только fast-forward: `git push origin master:production`.
- Ветка `production` **никогда не должна опережать `master`**. Если `production` ушла вперёд — значит кто-то коммитил напрямую в `production`; это ошибка.
- Проверка: `git fetch && git rev-list --left-right --count origin/master...origin/production` → должно быть `0  N` (master не позади; `master` впереди — это нормально, «деплой ещё не выкачен»).

Если ветки разошлись:

```bash
git fetch origin
# master — предок production → безопасный fast-forward default-ветки:
git push origin origin/production:master
# если у master есть уникальные коммиты — слить production в master:
# git checkout master && git merge origin/production
```

Автоматически это чинит workflow **`.github/workflows/branch-sync.yml`**: на каждый push в `production` он fast-forward-ит `master`, а при реальном расхождении падает с понятной ошибкой.

**Важно для агентов и инструментов:** резюме и другие новые разделы живут в `production`; если работаете из `master`, сначала синхронизируйте его (`git pull`), иначе файлов не увидите.

## Актуальный флоу (2026-09)

**Прод живёт на VDS:**

- Сервер: **82.146.35.220**, панель CapRover: `https://captain.vds.dogovor.expert`.
- Приложение: Next.js standalone-контейнер (реализуется Dockerfile репозитория) за nginx CapRover, порт 3000, healthcheck `/api/health`.
- Домен: `https://dogovor.expert` (www → apex редирект в приложении).
- БД: self-hosted Supabase на том же VDS, `NEXT_PUBLIC_SUPABASE_URL = https://supabase.vds.dogovor.expert` (для прода это build-arg/среда приложения; НЕ значение из `.env.production.local` — там локальная dev-конфигурация на облачный Supabase).
- Секреты/окружение прода: **environment variables приложения CapRover** (а не `.env*` файлы и не Vercel Dashboard).

### Как деплоить

**Прод обновляется автоматически через push-webhook CapRover.**

Приложение `dogovor-prod` в CapRover подписано на GitHub-вебхук: репозиторий `dogovor-expert/dogovor-expert-app`, ветка **`production`**. Пуш в эту ветку → CapRover сам собирает Dockerfile из репозитория (образ `img-captain-dogovor-prod:<n>`) и перезапускает сервис. GitHub Actions для деплоя НЕ используются.

```bash
git push origin master:production
```

- `NEXT_PUBLIC_*` инлайнятся при **БИЛДЕ** (а не в рантайме). CapRover при сборке передаёт environment variables приложения как build-args, поэтому значения обязаны быть корректны в **environment variables приложения CapRover** (не в `.env*` файлах).
- **Правило ARG (аудит 2026-09-22):** каждый `NEXT_PUBLIC_*`, используемый в клиентском коде, обязан быть объявлен `ARG`+`ENV` в `Dockerfile` — иначе в бандл запекается пусто (на Vercel это работало из коробки, на CapRover — нет). Проверено: в бандл НЕ попадают `NEXT_PUBLIC_RTB_*` (14 шт), `NEXT_PUBLIC_ADS_ENABLED`, `NEXT_PUBLIC_REPLAY_SAMPLE_RATE` — их нет и в env CapRover, реклама выключена кодом по умолчанию, это ок. `NEXT_PUBLIC_SITE_VERSION` добавлен в Dockerfile (2026-09-22). ⚠️ Не добавлять `ARG` без значения «про запас»: напр. пустой `NEXT_PUBLIC_REPLAY_SAMPLE_RATE` отключил бы запись сессий (`Number("")=0` вместо `Number(undefined)=NaN→1`).
- Локальная проверка перед пушем (опционально): `npm run build`.

**Staging** — отдельное приложение CapRover `dogovor` (домен `https://test.dogovor.expert`); пуш-вебхук на нём не настроен, деплой вручную из панели (или включить вебхук на ветку `master`).

**Ручной фолбэк** (если вебхук недоступен): панель CapRover → Apps → приложение → **Deploy** → сборка из репозитория (repo/branch), либо `caprover deploy` из папки с Dockerfile.

### Ветка `deploy` — стабильная сборка без тяжёлого клона (2026-09-27)

**Проблема:** CapRover клонирует ветку `production` целиком, а история репозитория
раздута (в прошлом — tesseract-core, старые `blank-previews/*.jpg`, десятки версий
`package-lock.json`). Полный пак ~150–205 МБ, VDS тянет его на КАЖДОЙ сборке по
флапающему каналу → периодические обрывы `git clone` (`fetch-pack: unexpected
disconnect`, `fatal: early EOF`) и «зависшие» сборки (лог стоит на `Build started`).

**Решение:** CapRover собирает ветку **`deploy`**, которая создаётся автоматически
workflow **`.github/workflows/deploy-branch.yml`**: на каждый пуш в `production`
он делает orphan-снапшот текущего дерева (один коммит, без истории) и
force-push'ит в `deploy`. Clone `deploy` = один коммит → ~40–60 МБ, без обхода
истории. Историю `master`/`production` НЕ трогаем.

- Поток остаётся прежним: правки в `master` → `git push origin master:production`.
- `deploy` обновляется автоматически; CapRover (настроен на ветку `deploy`) собирает.
- ⚠️ Требование: repo → **Settings → Actions → General → Workflow permissions →
  «Read and write permissions»** (иначе Action не сможет запушить `deploy`).
  Проверка: `git ls-remote origin deploy` — SHA меняется после каждого пуша
  в `production`; дерево `origin/deploy` обязано совпадать с `master`
  (`git rev-parse origin/deploy^{tree}` == `git rev-parse master^{tree}`).
- Проверка: `git ls-tree -r --name-only origin/deploy` — те же файлы, что в `master`.
- Откат: в панели вернуть ветку `production` — деплой снова пойдёт напрямую.

**Дополнительно (2026-09-27):** из истории вычищены мёртвые блобы
(`public/workers/tesseract-core/*` кроме текущего `-simd.wasm.js`, старые
`public/blank-previews/*.jpg`) через `git filter-repo --invert-paths` — пак
205→151 МБ, дерево HEAD побайтово не изменилось. Резервная копия до операции:
`D:\Мои сайты\_backups\dogovor-preslim-20260927.git`.

### Сколько ждать и как понять, что деплой доехал (2026-09-22)

Замерено на истории `dogovor-prod` (версии 7–54): пуш → вебхук срабатывает за секунды,
но **сборка на VDS занимает 3–25 минут** (`npm ci` + `next build` на 955 страниц).
Маленькие коммиты при тёплом кэше — ~2–3 мин, холодный кэш — 15–25 мин.
«Деплой через раз» = в первые минуты после пуша прод ещё отдаёт СТАРУЮ сборку
(новые страницы в это время отвечают 404 — это нормально, см. NoFallbackError ниже).

Автоматический сторож: workflow **`.github/workflows/deploy-watch.yml`** запускается
на каждый пуш в `production` и ждёт (до 40 мин), пока прод не начнёт отдавать 200
по ВСЕМ маршрутам из этого коммита (`scripts/deploy-watch.mjs`, секретов не требует).
Зелёный статус = новая сборка live. Красный = смотреть панель CapRover.

Проверить вручную без панели: `node scripts/deploy-watch.mjs` (один круг = ~1 мин).

### Если деплой не доезжает (runbook)

0. Быстрая диагностика без панели: `node scripts/caprover-status.mjs`
   (`isAppBuilding` / `isBuildFailed` / `deployedVersion` + хвост лога сборки).
1. Панель → Apps → `dogovor-prod` → вкладка Deployment: смотреть лог текущей сборки
   и список версий (каждый пуш создаёт запись; пустая `deployedImageName` = сборка идёт).
2. Сборка висит >60 мин (`isAppBuilding` завис): сначала проверить диск (п. ниже),
   затем перезапустить сборку из панели (Deploy) — флаг сбросится.
3. Не пушить повторно «для ускорения»: сборки идут последовательно, каждый лишний
   пуш = ещё один полный цикл сборки (~20 мин) в очереди.
4. Новые страницы 404, а старые работают = старая сборка ещё жива, ждать watch.

### Известные причины «ошибки развертывания» (2026-09-24, проверено на живых логах)

1. **Client-страница с серверными экспортами (exit code 1).** `"use client"` + любой из
   `export const metadata/revalidate/dynamic` → `next build` падает, CapRover показывает
   «ошибку развертывания», запись версии остаётся пустой (без образа и gitHash).
   Коварство: локально сборка может пройти из тёплого `.next`-кэша и не поймать ошибку.
   Правило: серверные экспорты — только в `layout.tsx` сегмента, клиентская `page.tsx`
   их не дублирует. Проверка автоматизирована: `npm run check:exports`
   (`scripts/check-client-exports.mjs`) — в `verify` и pre-commit хуке.
   Случай: `af2af70` (`/zayavleniya` → `"use client"` + забытые `metadata/revalidate`,
   мета уже была в `layout.tsx`), фикс `bcb3d36`.
2. **OOM при сборке (exit code 134, SIGABRT).** На VDS 3.8 ГБ RAM дефолтный heap Node
   роняет `next build`, когда рядом живут Supabase-стек и CapRover. Фикс в `Dockerfile`
   перед `npm run build`: `ENV NODE_OPTIONS="--max-old-space-size=3072"`
   (коммит `81ae44e`). Симптом в логе капитана: `process "/bin/sh -c npm run build"
   did not complete successfully: exit code: 134`. Тихий вариант: после `Building docker
   image` — обрыв лога без ошибки (buildkit-процесс убит по памяти).
3. **Забит диск.** Симптомы: долгие/падающие сборки, таймауты SSH. Чистка:
   `docker rmi img-captain-dogovor-prod:<старые>` (оставить рабочий + 1 резерв) +
   `docker builder prune -f`. 2026-09-24: было 84% (47G/59G) → стало 31%.
4. **Обрыв git clone (инцидент 2026-09-27).** Симптом: в логе сборки сразу после
   `Build started` — `Error: Cloning into ... fetch-pack: unexpected disconnect
   while reading sideband packet / fatal: early EOF`, `isBuildFailed=true`,
   прод продолжает отдавать старую сборку. Код НЕ виноват — это сетевой сбой
   при клонировании. Усугубляется размером репозитория: пак ~205 МБ, в истории
   лежат удалённые тяжёлые файлы (`public/workers/tesseract-core/*.wasm.js`,
   `public/workers/tessdata/*` — в дереве их уже нет с `9038109`, но clone
   тянет всю историю). Лечение БЕЗ нового пуша:
   `node scripts/caprover-retry.mjs` — эмулирует GitHub push-webhook для
   текущего типа `origin/production` (лишние пуши «для ускорения» запрещены —
   каждый = ещё один полный цикл сборки в очереди, см. п. 3 выше).
   Стратегически: вынести OCR-бинарники из git-истории (filter-repo + force-push,
   только по согласованию — в репозитории параллельная работа) либо смириться
   с ~205 МБ и ретраить clone-сбои ретраем выше.

⚠️ `deploy-watch` (и workflow `deploy-watch.yml`) проверяет только HTTP 200,
а НЕ содержимое — зелёный статус не означает, что новый код реально на проде.
После каждого деплоя сверять контент скриптом (пример для фичи из коммита):
`node scripts/deploy-content.mjs "/ai-yurist|Перетащите договор сюда"`.
Маркеры не должны пересекать границу JSX-выражений: React рендерит `{N} текст`
как `N<!-- --> текст`, поэтому маркер «22 готовых бланка» не сработает —
используйте «готовых бланка» или статичный текст.
Ручные маркеры: `/zayavleniya` содержит «Группы заявлений»,
главная — актуальное число шаблонов, `/builder` — новый селектор.

### Диск на VDS (главный кандидат при «внезапных» долгих/падающих сборках)

Образы `img-captain-dogovor-prod:N` копятся, BuildKit-кэш вытесняется → сборки
становятся холодными (долго) или падают (нет места). CapRover сам образы не чистит.
Раз в 1–2 недели (или при симптомах) на VDS по SSH:

```bash
docker system df                      # сколько занято
docker image prune -af --filter "until=240h"   # образы старше 10 дней
docker builder prune -af --filter "until=168h" # кэш сборок старше 7 дней
```

`docker system prune -af` без фильтров тоже можно, но следующая сборка будет
холодной (долгой) один раз. Текущие контейнеры/тома не трогать.

### Про ошибку `NoFallbackError` в логах (`/converter/[tool]`, `/utils/[tool]`)

Это НЕ баг: у маршрутов `dynamicParams = false` + `generateStaticParams`,
запрос несуществующего слага бросает `NoFallbackError` и отдаёт 404.
Источники: боты, перебирающие `/converter/*`, и запросы НОВЫХ страниц в окно,
пока старая сборка ещё жива. Лечится ожиданием деплоя, не кодом.

### Cron на VDS

Диспетчера cron Vercel больше нет. Cron выполняется **внешним crontab** на VDS:

```
0 3 * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://dogovor.expert/api/cron/tsl-refresh
5 3 * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://dogovor.expert/api/cron/daily-maintenance
```

`CRON_SECRET` — среда приложения CapRover.

## Проверка прода (базовое)

- «Деплой прошёл» ≠ код на проде. Проверять фактически: скачивание PDF с прода через playwright (`%TEMP%\opencode\e2e-*.cjs` — chromium из ms-playwright; селекторы: кнопка по тексту «Скачать PDF», select по индексу; ждать гидрации: клик → появление «Генерация…») и программный анализ скачанного PDF через pdfjs-dist (`node_modules/pdfjs-dist/legacy/build/pdf.mjs`, polyfill DOMMatrix; скрипты `%TEMP%\opencode\check-gaps-file.cjs`, `dump-lines.cjs` — текст с y-координатами, зазоры, дубли страниц).
- Кириллица в PowerShell: `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8` перед запуском node-скриптов; чтение файлов — `ReadAllText(..., UTF8)`.
- Прод отвечает с `x-nextjs-cache: HIT` и **без** `x-vercel-id` — маркер, что контейнер Next.js реально обслуживается nginx VDS, а не Vercel.

## E2E-скрипты с сессией (19.08.2026)

Для проверки авторизованных страниц прода: `%TEMP%\opencode\e2e-prod-billing-auth.cjs` — логин через supabase-js (ключ `NEXT_PUBLIC_SUPABASE_ANON_KEY` из `.env.production`, обрезать кавычки), cookie `sb-<ref>-auth-token` = `"base64-" + base64url(JSON.stringify(session БЕЗ user))` (формат @supabase/ssr v0.12; массив `[at,rt,null,tt,ei,user]` НЕ работает). Cookie: domain dogovor.expert, path /, httpOnly, secure, sameSite Lax.

Playwright: `$env:NODE_PATH = "D:\Мои сайты\site Dogovor\node_modules"`, goto ждать `domcontentloaded` + retry ×3 (на проде бывают сетевые таймауты), баннер cookies кликать «Принять», контент биллинга ждать исчезновения «Загрузка…» (waitForFunction).

> Примечание: `sb-<ref>-auth-token` — имя cookie использует ref облачного проекта. На self-hosted Supabase имя cookie другое (см. `src/lib/supabase/cookie-options.ts` и настроенный ключ cookie). Если скрипт перестал работать — сверить фактическое имя cookie с браузера.

## Тесты

- Unit: `npm run test:unit` (vitest).
- E2E локальные: `npm run test:e2e` (playwright, 3100).
- E2E прод: `npm run test:prod`.

## Легаси: Vercel (устаревший, больше не используется)

Исторические флоу сохранены для справки (18–19.08.2026), актуальный путь — см. «Актуальный флоу» выше.

- Прямой Vercel CLI: `npx vercel --prod --yes --cwd "D:\Мои сайты\site Dogovor"` — **отменён** после переезда на VDS.
- Robocopy-флоу: синхронизация `%LOCALAPPDATA%\Temp\opencode\proj` → Vercel — **отменён**. Обязательные деплой-файлы OG-превью/иконки (`public/og-image.png`, `public/apple-icon.png`) теперь в образе, а не зависят от robocopy.
- `vercel.json` в репозитории — исторический артефакт (cron-записи), на VDS cron идёт через внешний crontab. Не редактировать без необходимости, при желании можно удалить вместе с `.vercel/` и `.vercelignore`.
- `.vercel/project.json` (projectId `prj_cABOmf2bYKyHIff0lHOAJFxzG943`) — легаси-артефакт.

## Пост-деплой проверка (VDS)

`/` 200 → `/login` 200 → вход+`/admin` (после MFA) → `/api/customs-rate` JSON с ЦБ → POST `/api/leads` без Origin = 403 → авто-продление 409 на повторном клике (окно 10 мин) → загрузка аватара (sharp!) → PDF-экспорт с УКЭП-подписью → `docker exec <ctn> id -u` ≠ 0 (не root). → `/api/health` 200 (healthcheck контейнера).