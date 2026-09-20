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
- Локальная проверка перед пушем (опционально): `npm run build`.

**Staging** — отдельное приложение CapRover `dogovor` (домен `https://test.dogovor.expert`); пуш-вебхук на нём не настроен, деплой вручную из панели (или включить вебхук на ветку `master`).

**Ручной фолбэк** (если вебхук недоступен): панель CapRover → Apps → приложение → **Deploy** → сборка из репозитория (repo/branch), либо `caprover deploy` из папки с Dockerfile.

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