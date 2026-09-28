# Deploy и проверка продакшена

> Вынесено из AGENTS.md (19.08.2026). Актуализировано 2026-09-28: прод переехал
> с Vercel → VDS/CapRover → **VDS/Dokploy**. GitHub для деплоя больше не используется.

## Актуальный флоу (2026-09-28)

**Прод живёт на VDS, деплоит Dokploy:**

- Сервер: **82.146.35.220**
- Панель Dokploy: `http://82.146.35.220:3000`
- Приложение: `dogovor-prod` (внутреннее имя `dogovor-prod-dlpedm`) — Next.js
  standalone-контейнер из `Dockerfile`, порт 3000, healthcheck `/api/health`.
  Перед контейнером — Traefik (управляет Dokploy), сертификаты Let's Encrypt.
- Домены: `https://dogovor.expert` и `https://www.dogovor.expert` (оба в Traefik;
  отдельный редирект www→apex настраивается в приложении, если нужен).
- БД: self-hosted Supabase на том же VDS,
  `NEXT_PUBLIC_SUPABASE_URL = https://supabase.vds.dogovor.expert`.
- Секреты/окружение прода: **Environment** приложения в Dokploy
  (не `.env*` файлы и не Vercel Dashboard). Значения в БД Dokploy хранятся
  зашифрованными (`enc:v1:…`).

### ⚠️ Почему не GitHub (главное, не откатывать)

С VDS до GitHub канал **~1 КБ/с** и он нестабилен: `git clone` репозитория
(≈150 МБ) идёт десятки минут и регулярно рвётся
(`fetch-pack: unexpected disconnect`, `fatal: early EOF`).

**Решение — локальное git-зеркало на самом сервере:**

```
ssh://root@82.146.35.220/etc/dokploy/git/dogovor.git
```

Dokploy (`sourceType: git`, `buildType: dockerfile`) клонирует **это** зеркало,
ветку **`master`**, и собирает Dockerfile из репозитория. Скорость клона —
десятки МБ/с, обрывы исчезли. Сборка целиком занимает ~10 минут.

Зеркало — обычный bare-репозиторий; в нём **только `master`**. Веток `production`
и `deploy` на сервере нет, и они больше не нужны (см. «История миграции» в конце).

> Если GitHub-троттлинг с VDS уйдёт, приложение в Dokploy можно переключить
> обратно на `https://github.com/dogovor-expert/dogovor-expert-app.git` (ветка
> `master`) в настройках `Git → Repository URL`.

### Как деплоить

```bash
git push vds master
```

Далее — **Deploy в панели Dokploy** (Applications → `dogovor-prod` → Deploy).
Автоматического вебхука нет: `git push` обновляет только зеркало, сборку
нужно запустить вручную (или скриптом ниже).

Ветка `master` — **источник правды и единственная деплой-ветка**. Отдельных
`production`/`deploy` нет; правило fast-forward между ветками больше не
применяется.

Всё это одной командой (push + запуск сборки через Dokploy API):

```bash
npm run deploy            # = node scripts/deploy-push.mjs
npm run deploy:dry        # показать план, ничего не делать
```

Для автоматического редеплоя нужен API-ключ Dokploy
(панель → Settings → API Access) в переменной окружения `DOKPLOY_API_KEY`.
Без ключа скрипт выполнит push и напомнит нажать Deploy вручную.

- `NEXT_PUBLIC_*` инлайнятся в клиентский бандл во время **БИЛДА**. Dokploy
  передаёт их как `--build-arg`, поэтому значения должны быть верными в
  **Environment** приложения (не в `.env*` файлах репозитория).
- **Правило ARG:** каждый `NEXT_PUBLIC_*`, используемый в клиентском коде,
  обязан быть объявлен `ARG`+`ENV` в `Dockerfile` — иначе в бандл запекается
  пусто. ⚠️ Не добавлять `ARG` без значения «про запас»: напр. пустой
  `NEXT_PUBLIC_REPLAY_SAMPLE_RATE` отключил бы запись сессий
  (`Number("")=0` вместо `Number(undefined)=NaN→1`).
- Локальная проверка перед пушем (опционально): `npm run build`.

**Staging** — отдельного приложения на Dokploy сейчас нет. Прежний
`https://test.dogovor.expert` (CapRover `dogovor`) не обслуживается; при
необходимости — создать второе приложение в Dokploy из того же зеркала.

**Ручной фолбэк:** панель Dokploy → Applications → `dogovor-prod` → **Deploy**.

### Как понять, что деплой доехал

Сборка занимает **~10 минут** (`npm ci` + `next build` на 1400+ страниц).
В первые минуты прод ещё отдаёт СТАРУЮ сборку — новые страницы в это время
отвечают 404 (это нормально, см. `NoFallbackError` ниже).

- Панель: Applications → `dogovor-prod` → **Deployments** (список сборок, статус
  `done`/`error`, лог сборки).
- Без панели: `node scripts/deploy-watch.mjs` (ждёт, пока все маршруты отдадут
  200), затем `node scripts/deploy-content.mjs "/path|маркер"` — сверка
  содержимого, потому что зелёный HTTP ≠ новый код.
- Логи контейнера: `docker logs <container> --since 5m`; логи сборок лежат в
  `/etc/dokploy/logs/dogovor-prod-dlpedm/`.

⚠️ `deploy-watch` проверяет только HTTP 200, а НЕ содержимое. Маркеры не должны
пересекать границу JSX-выражений: React рендерит `{N} текст` как
`N<!-- --> текст`, поэтому маркер «22 готовых бланка» не сработает — используйте
«готовых бланка» или статичный текст. Ручные маркеры: `/zayavleniya` содержит
«Группы заявлений», главная — актуальное число шаблонов, `/builder` — новый
селектор.

### Если деплой не доезжает (runbook)

0. Панель Dokploy → Applications → `dogovor-prod` → **Deployments**: статус
   последней сборки и её лог. `error` → читать лог, чинить, запускать заново.
1. Сборка идёт, но очень долго (>25 мин) — сначала проверить диск (п. ниже).
2. Не пушить повторно «для ускорения»: сборки идут последовательно, каждый
   лишний push = ещё один полный цикл (~10 мин) в очереди.
3. Новые страницы 404, а старые работают = старая сборка ещё жива, ждать
   `deploy-watch`.
4. **Обрыв git clone.** В новой схеме источник — локальное зеркало, поэтому
   проблемы с GitHub деплоя больше не касаются. Если клон зеркала падает —
   проверить `ssh -T root@82.146.35.220` и состояние
   `/etc/dokploy/git/dogovor.git`.
5. **OOM при сборке (exit code 134, SIGABRT).** На VDS ~8 ГБ RAM (рядом живут
   Supabase и Dokploy) дефолтный heap Node роняет `next build`. Фикс в
   `Dockerfile` перед `npm run build`:
   `ENV NODE_OPTIONS="--max-old-space-size=3072"`. Симптом в логе:
   `process "/bin/sh -c npm run build" did not complete successfully: exit code: 134`.
   ⚠️ Этот же лимит нужен и в **runtime-стадии** (ENV из build не наследуется —
   без него рантайм жил с heap ~2 ГБ и падал 2026-09-28, см. п. 9).
9. **Рантайм-краш с рестартами (exit 139, снаружи 502).** `docker service ps`
   показывает задачи `Failed "task: non-zero exit (139)"`, в логах
   `FATAL ERROR: Ineffective mark-compacts near heap limit`. Причина 28.09:
   полный parse+verify 12MB TSL (`/api/cron/tsl-refresh` без `?action=status`)
   ≈ 400MB transient heap при heap ~2 ГБ. Лечение: тяжёлые эндпоинты не дёргать
   вручную днём; `?action=status` лёгкий (metadata-only, без парсинга XML);
   heap рантайма — `NODE_OPTIONS` в runtime-стадии Dockerfile.
   ⚠️ Environment приложения в Dokploy **перекрывает** ENV из Dockerfile:
   2026-09-28 в Environment лежал `NODE_OPTIONS=--max-old-space-size=384`
   (наследство CapRover-эпохи) — рантайм жил с heap 384MB при Dockerfile 3072.
   Правило: heap задаём в ОБОИХ местах (Dockerfile — канон, Environment —
   явный дубликат 3072). Проверка живого значения:
   `docker inspect <cid> --format '{{range .Config.Env}}{{println .}}{{end}}' | grep NODE_OPTIONS`.
   Срочный фикс без пересборки: `docker service update --env-add
   'NODE_OPTIONS=--max-old-space-size=3072' dogovor-prod-dlpedm`
   (потом обязательно Save в Environment панели, иначе следующий деплой откатит).
6. **Забит диск.** Симптомы: долгие/падающие сборки, таймауты SSH:
   ```bash
   docker system df
   docker builder prune -f
   docker image prune -f
   ```
   Сборки Dokploy переиспользуют теги (`dogovor-prod-dlpedm:latest`), старые
   версии не копятся, как это делал CapRover.
7. **Секреты не подхватились.** Проверить Environment приложения в Dokploy.
   Runtime-переменные (Supabase/Upstash/YooKassa/Telegram) достаточно
   «перезапустить» контейнер; `NEXT_PUBLIC_*` требуют **пересборки образа**.
8. **`[ratelimit] UPSTASH_REDIS_* not configured` в логе сборки** — это ожидаемо:
   `.env` исключён из Docker-контекста (`.dockerignore`), поэтому `next build`
   его не видит. В рантайме Dokploy передаёт env отдельно, и лимитеры работают.
   Проверка: `GET /api/ai/balance` без авторизации должен вернуть 401, а не 429.

### Известные причины «ошибки развертывания» (проверено на живых логах)

1. **Client-страница с серверными экспортами (exit code 1).** `"use client"` + любой из
   `export const metadata/revalidate/dynamic` → `next build` падает, Dokploy показывает
   ошибку сборки. Коварство: локально сборка может пройти из тёплого `.next`-кэша и не
   поймать ошибку. Правило: серверные экспорты — только в `layout.tsx` сегмента,
   клиентская `page.tsx` их не дублирует. Проверка автоматизирована:
   `npm run check:exports` (`scripts/check-client-exports.mjs`) — в `verify` и
   pre-commit хуке. Случай: `af2af70` (`/zayavleniya`), фикс `bcb3d36`.
2. **OOM при сборке (exit code 134, SIGABRT)** — см. runbook п. 5.
3. **Забит диск** — см. runbook п. 6.

⚠️ `deploy-watch` проверяет только HTTP 200, а НЕ содержимое — зелёный статус
не означает, что новый код реально на проде. После каждого деплоя гнать
`npm run deploy:content` (дефолтные маркеры нового кода; в CI — шаг после
`deploy-watch`). Для фичи из коммита — точечно:
`node scripts/deploy-content.mjs "/ai-yurist|Перетащите договор сюда"`.

### Диск на VDS

Сборки Dokploy переиспользуют один тег (`dogovor-prod-dlpedm:latest`), поэтому
старые образы не копятся, как это делал CapRover. Основной потребитель места —
BuildKit-кэш. Уборка (на VDS по SSH):

```bash
docker system df                                 # сколько занято
docker builder prune -f                          # кэш сборок
docker image prune -f                            # висячие образы
```

Полная очистка по фильтрам (`--filter "until=…"`) тоже допустима, но следующая
сборка один раз будет холодной (долгой). Текущие контейнеры/тома не трогать.
На сервере также стоит cron-уборка (ежедневно `docker builder prune -a -f`,
еженедельно `docker image prune -a` со старыми образами).


### Про ошибку `NoFallbackError` в логах (`/converter/[tool]`, `/utils/[tool]`)

Это НЕ баг: у маршрутов `dynamicParams = false` + `generateStaticParams`,
запрос несуществующего слага бросает `NoFallbackError` и отдаёт 404.
Источники: боты, перебирающие `/converter/*`, и запросы НОВЫХ страниц в окно,
пока старая сборка ещё жива. Лечится ожиданием деплоя, не кодом.

### Cron на VDS

Диспетчера cron Vercel больше нет, и **Dokploy не является планировщиком cron**.
Задачи выполняются **внешним crontab** на VDS (root):

```
0 3 * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://dogovor.expert/api/cron/tsl-refresh
5 3 * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://dogovor.expert/api/cron/daily-maintenance
```

`CRON_SECRET` берётся из **Environment** приложения в Dokploy (канонический
источник). Секрет не должен лежать в репозитории; в crontab его подставляют
из защищённого файла (`/etc/dogovor/cron.env`, права 600, server-side копия
секрета контейнера) либо из окружения сессии.

Мониторинг без риска: `GET /api/cron/tsl-refresh?action=status` — лёгкий
(metadata-only, без парсинга XML; полный parse+verify 12MB TSL стоил ~400MB
heap и ронял прод — инцидент 2026-09-28, runbook п. 9).

> ⚠️ Статус на 2026-09-28: этих задач в crontab на VDS **нет** (там только
> docker-уборка). Ставить только ПОСЛЕ деплоя коммитов `dff9861`+`506b31d`
> (лёгкий статус + runtime heap), иначе ночной refresh уронит прод.
> TSL-кэш протух (last_sync 2026-09-14) — после деплоя дёрнуть refresh вручную
> и проверить metadata через `?action=status`.


## Проверка прода (базовое)

- «Деплой прошёл» ≠ код на проде. Проверять фактически: скачивание PDF с прода через playwright (`%TEMP%\opencode\e2e-*.cjs` — chromium из ms-playwright; селекторы: кнопка по тексту «Скачать PDF», select по индексу; ждать гидрации: клик → появление «Генерация…») и программный анализ скачанного PDF через pdfjs-dist (`node_modules/pdfjs-dist/legacy/build/pdf.mjs`, polyfill DOMMatrix; скрипты `%TEMP%\opencode\check-gaps-file.cjs`, `dump-lines.cjs` — текст с y-координатами, зазоры, дубли страниц).
- Кириллица в PowerShell: `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8` перед запуском node-скриптов; чтение файлов — `ReadAllText(..., UTF8)`.
- Прод отвечает **без** `x-vercel-id` — маркер, что сайт обслуживается
  self-hosted контейнером (Traefik → Next.js), а не Vercel.

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
- В коде сохранены Vercel-совместимые ветки (`x-vercel-forwarded-for` в
  `src/lib/ratelimit.ts`, `automaticVercelMonitors` в `next.config.mjs`,
  `process.env.NEXT_PUBLIC_VERCEL_ENV` в `instrumentation.ts`) — это осознанная
  совместимость с облачным хостингом, а не следствие текущего деплоя. Не удалять.

## Пост-деплой проверка (VDS)

`/` 200 → `/login` 200 → вход+`/admin` (после MFA) → `/api/customs-rate` JSON с ЦБ → POST `/api/leads` без Origin = 403 → авто-продление 409 на повторном клике (окно 10 мин) → загрузка аватара (sharp!) → PDF-экспорт с УКЭП-подписью → `docker exec <ctn> id -u` ≠ 0 (не root) → `/api/health` 200 (healthcheck контейнера).

## История миграции (для контекста)

| Дата | Платформа | Схема деплоя |
|------|-----------|---------------|
| до 19.08.2026 | Vercel | git push → Vercel CI |
| 19.08 – 27.09.2026 | VDS / CapRover | push в `production` → CapRover-вебхук → образ `img-captain-dogovor-prod:<n>`; обход троттлинга GitHub через orphan-ветку `deploy` |
| с 28.09.2026 | VDS / **Dokploy** | `git push vds master` → Deploy в Dokploy; код берётся из локального зеркала `/etc/dokploy/git/dogovor.git` |

Ветки `production` и `deploy`, а также workflows `deploy-branch.yml` и
`branch-sync.yml` удалены 2026-09-28 — они существовали только для CapRover.
`origin` (GitHub) остаётся как бэкап-источник, но деплоем не используется.

Полезные мелочи на сервере:
- Рабочий env-бэкап (47 переменных, права 600): `/root/dogovor-env-backup.env`.
- SSH-ключ для зеркала: `~/.ssh/id_ed25519_dokploy` на сервере и локально;
  Dokploy использует его для `git clone` по SSH.
