# Dogovor — правила для агентов

> **Канонический источник правды** для AI-агентов (стандарт [agents.md](https://agents.md/)).
> Акция 299 ₽ до 2026-09-20 завершена — ориентируйся на `docs/GROWTH_PLAN.md` и тексты сайта.

## 🚨 Обязательные правила (нарушать = баг в проде)

1. **Проверка PDF-экспорта** — нельзя писать «PDF-баг исправлен» без прогона skill `pdf-export-verify`.
2. **Связанные элементы при наполнении контентом** — изменение шаблона/поля/раздела/модуля = НЕ изолированная правка. Карта связей: [`docs/CONTENT_RULES.md`](docs/CONTENT_RULES.md).
3. **Качественный барьер (Quality Gate)** — blast radius + vitest related + tsc + smoke. Регламент: [`docs/QUALITY_GATE.md`](docs/QUALITY_GATE.md).
4. **Деплой и проверка прода** — флоу на 19.08.2026: [`docs/DEPLOY.md`](docs/DEPLOY.md). Только `git push origin master:production` → CapRover-вебхук.
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
- Деплой: CapRover, прод https://dogovor.expert. `master` — источник правды; `production` — только деплой, обязана быть fast-forward от `master` (`.github/workflows/branch-sync.yml`)
- Шаблонов: 369, PRO-подписка через YooKassa. Секреты — только env CapRover, `.env*` не коммитить

## Setup commands

- Install: `npm install` · Dev: `npm run dev` · Verify: `npm run verify` (typecheck+lint+test)
- Build: `npm run build` · Deploy: `git push origin master:production`
- Smoke (prod): `npm run check:smoke:prod` · Аудит: `npm run audit:full`

## Code style / Testing / Security (кратко)

- TS strict без `any`; ESLint+Prettier; Tailwind mobile-first; lucide по одному; React 19 `use()` + server actions; UI-строки на русском.
- Vitest (unit) + Playwright (e2e); перед коммитом `npm run verify`; coverage ≥60%, не снижать.
- Env — напрямую из `process.env` (единого Zod-модуля нет); server client — в actions, browser — в client; API: Zod + CSRF + rate limit; CSP через middleware (source-based); не логировать секреты/PII.

## Things to avoid

- `any`, хардкод русских строк, API route вместо Server Action, зависимости без обоснования, `ESLint disable` без reason, коммит `.env*`.

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
