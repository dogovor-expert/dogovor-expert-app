# Dogovor — правила для агентов

> **Канонический источник правды** для AI-агентов (стандарт [agents.md](https://agents.md/)).
> Акция 299 ₽ до 2026-09-20 завершена — ориентируйся на `docs/GROWTH_PLAN.md` и тексты сайта.

## 🚨 Обязательные правила (нарушать = баг в проде)

1. **Проверка PDF-экспорта** — нельзя писать «PDF-баг исправлен» без прогона skill `pdf-export-verify`.
2. **Связанные элементы при наполнении контентом** — изменение шаблона/поля/раздела/модуля = НЕ изолированная правка. Карта связей: [`docs/CONTENT_RULES.md`](docs/CONTENT_RULES.md).
3. **Качественный барьер (Quality Gate)** — blast radius + vitest related + tsc + smoke. Регламент: [`docs/QUALITY_GATE.md`](docs/QUALITY_GATE.md).
4. **Деплой и проверка прода** — флоу: [`docs/DEPLOY.md`](docs/DEPLOY.md). Канонично: `git push vds master` (push в локальное git-зеркало на VDS) → **Deploy в панели Dokploy** (`http://82.146.35.220:3000`, приложение `dogovor-prod`). Ветка `master` — единственная деплой-ветка. «Деплой прошёл» ≠ код на проде: проверять контент (`node scripts/deploy-content.mjs "/path|маркер"`), а не только HTTP 200.
5. **SEO-инварианты** — не ломать robots/sitemap/canonical/JSON-LD: [`docs/SEO_INVARIANTS.md`](docs/SEO_INVARIANTS.md).
6. **Аудит-фиксы 20.08.2026** — YooKassa webhook, RLS write-lock, rate limit, Next 15 API: [`docs/AUDIT_FIXES.md`](docs/AUDIT_FIXES.md).
7. **Site audit protocol** — команда `npm run audit:full`: [`docs/SITE_AUDIT.md`](docs/SITE_AUDIT.md).
8. **Среда выполнения (Windows / OpenCode)** — LF, UTF-8 no-BOM: [`docs/ENV_RULES.md`](docs/ENV_RULES.md).
9. **Адаптивность** — mobile-first, dvh/safe-area: [`docs/RESPONSIVE.md`](docs/RESPONSIVE.md). PWA/service worker — НЕ внедрять.

## 📌 Открытые задачи

- Расширение RAG-корпуса AI-юриста (ГПК, КАС, ФЗ-214 и далее) — runbook и очередь:
  [`docs/TASKS.md`](docs/TASKS.md). Делается отдельным прогоном **по одному акту**,
  команда `/corpus-expand`. При смене парсера корпуса колонка `law_chunks.article`
  синхронизируется **вручную** — не забывать.

## 🧠 Экономия контекста (CRITICAL)

- Вложенные `AGENTS.md`, `docs/*`, `CHANGELOG_AGENTS.md` читай **только точечно под задачу** (`Read` с `offset/limit`), никогда целиком. `CHANGELOG_AGENTS.md` (60 КБ) — только последние 40 строк.
- Один вопрос = один `codegraph_explore`, не цепочки grep+read. Тяжёлые дампы — в `Task(explore)` с возвратом summary.
- `ocr_review`/`ocr_delegate` — всегда сначала `preview=true` + `exclude`, `concurrency ≤4`, `overallTimeoutMinutes ≤10`.
- MCP точечно, не «на всякий случай». Playwright — только для UI-проверок; sentry — включать только на разбор ошибок прода и выключать обратно.

## Project overview

- Стек: Next.js 15.5 + React 19 + TypeScript strict + Tailwind + lucide-react
- БД: Supabase self-hosted — `https://supabase.vds.dogovor.expert` (VDS `82.146.35.220`)
- Деплой: **Dokploy** (self-hosted, VDS `82.146.35.220`) собирает ветку **`master`** из локального git-зеркала `ssh://root@82.146.35.220/etc/dokploy/git/dogovor.git`; прод https://dogovor.expert за Traefik. `master` — источник правды и единственная деплой-ветка (веток `production`/`deploy` больше нет).
- Шаблонов: 369, PRO-подписка через YooKassa. Секреты — только env приложения в Dokploy, `.env*` не коммитить

## Setup commands

- Install: `npm install` · Dev: `npm run dev` · Verify: `npm run verify` (typecheck+lint+exports+test)
- Build: `npm run build` · Deploy: `npm run deploy` (= `git push vds master` + запуск сборки в Dokploy; без `DOKPLOY_API_KEY` — только push, сборку запустить в панели)
- Smoke (prod): `npm run check:smoke:prod` · Аудит: `npm run audit:full`

## 🚢 Деплой-надёжность (инциденты 2026-09-27/28, не наступать повторно)

- **Код берётся НЕ с GitHub.** С VDS до GitHub ~1 КБ/с и обрывы `git clone`
  (`fetch-pack: unexpected disconnect`, `fatal: early EOF`) — сборки падали или
  висели часами. Поэтому репозиторий зеркалится локально на сервере
  (`/etc/dokploy/git/dogovor.git`, ветка `master`), и Dokploy клонирует его по SSH.
  НЕ переключать Dokploy обратно на GitHub, пока троттлинг не уйдёт.
- **Push обновляет только зеркало** — сборку надо запускать в панели Dokploy
  (Applications → `dogovor-prod` → Deploy) либо через `npm run deploy` с
  `DOKPLOY_API_KEY`. Автоматического вебхука нет.
- **`origin` (GitHub) — бэкап-источник, не деплой.** Ветки `production`/`deploy`
  и workflows `deploy-branch.yml`/`branch-sync.yml` удалены 2026-09-28.
- **История похудела** (`git filter-repo`, 205→151 МБ, 2026-09-27; тогда же
  перезаписаны SHA `master`/`production`). Старые клоны несовместимы — свежий `git clone`.
- **НЕ коммитить крупные бинарники** (`public/workers/tesseract-core/*`, `tessdata/*`,
  `public/blank-previews/*.jpg`): они раздувают историю. Ассеты — через `.avif`/сборку.
- **OOM при сборке (exit 134):** на VDS ~8 ГБ RAM рядом живут Supabase и Dokploy —
  в `Dockerfile` стоит `ENV NODE_OPTIONS="--max-old-space-size=3072"`. Не убирать.
- **Гейт «client-exports»:** `"use client"` + серверный экспорт (`metadata`/`revalidate`/
  `dynamic`/…) роняет `next build` (exit 1). Автопроверка: `npm run check:exports`
  (в `verify` и pre-commit).
- **Cron задачи живут во внешнем crontab на VDS**, а не в Dokploy (он не планировщик):
  `tsl-refresh` и `daily-maintenance` требуют `CRON_SECRET` из env Dokploy.
- Инструменты без панели: `node scripts/deploy-watch.mjs` (ожидание выката),
  `node scripts/deploy-content.mjs "/path|маркер"` (проверка содержимого прода),
  `node scripts/deploy-push.mjs --dry-run` (план деплоя).

## Code style / Testing / Security (кратко)

- TS strict без `any`; ESLint+Prettier; Tailwind mobile-first; lucide по одному; React 19 `use()` + server actions; UI-строки на русском.
- Vitest (unit) + Playwright (e2e); перед коммитом `npm run verify`; coverage ≥60%, не снижать.
- Env — напрямую из `process.env` (единого Zod-модуля нет); server client — в actions, browser — в client; API: Zod + CSRF + rate limit; CSP через middleware (source-based); не логировать секреты/PII.

## Things to avoid

- `any`, хардкод русских строк, API route вместо Server Action, зависимости без обоснования, `ESLint disable` без reason, коммит `.env*`, крупные бинарники в git (см. «Деплой-надёжность»), переключение Dokploy на GitHub вместо локального зеркала.

## Commit conventions

- Conventional Commits (`feat/fix/chore/docs/refactor/test` + scope); release-please бампит версию сам.

## MCP-инструменты (экономно)

- **context7** — доки библиотек при сомнениях в API. **playwright** — UI-снимки localhost/прод. **gh_grep** — лёгкий, можно всегда. **sentry** — disabled по умолчанию.

## Личные файлы

Не коммитить/не редактировать: `prompt-для-нейросети.md`, `СКОРО_растаможка.md`, `на-потом.md`.

## Вложенные AGENTS.md (читать только при работе в этих путях)

- `src/lib/supabase/AGENTS.md` · `src/lib/cloud/AGENTS.md` · `src/components/AGENTS.md`
- `src/app/api/AGENTS.md` · `src/app/admin/AGENTS.md` · `src/lib/validations/AGENTS.md`

## IDE-обёртки

Канон — этот файл. Выжимки: `.github/copilot-instructions.md`, `.cursorrules`, `.clinerules`, `.windsurfrules`, `CLAUDE.md` (синк — `.github/workflows/sync-agents.yml`).
