# Dogovor — правила для агентов

> **Канонический источник правды** для AI-агентов (соответствует стандарту [agents.md](https://agents.md/) — Linux Foundation).
> Для IDE-обёрток (Cursor, Cline, Windsurf, Copilot) — см. секцию «IDE-обёртки» ниже.

## 🚨 Обязательные правила (нарушать = баг в проде)

1. **Проверка PDF-экспорта** — нельзя писать «PDF-баг исправлен» без прогона skill `pdf-export-verify` (реальные данные, скачивание PDF с прода, программный анализ координат, проверка бандла).
2. **Связанные элементы при наполнении контентом** — любое изменение шаблона/поля/раздела/модуля = НЕ изолированная правка. Полная карта связей и чек-лист: [`docs/CONTENT_RULES.md`](docs/CONTENT_RULES.md).
3. **Качественный барьер (Quality Gate)** — blast radius + vitest related + tsc + smoke + модульная изоляция. Полный регламент: [`docs/QUALITY_GATE.md`](docs/QUALITY_GATE.md). Финальный чек-лист перед сдачей — там же.
4. **Деплой и проверка прода** — актуальный флоу на 19.08.2026: [`docs/DEPLOY.md`](docs/DEPLOY.md).
5. **SEO-инварианты** — не ломать robots/sitemap/canonical/JSON-LD. Полный список: [`docs/SEO_INVARIANTS.md`](docs/SEO_INVARIANTS.md).
6. **Аудит-фиксы 20.08.2026** — YooKassa webhook, RLS write-lock, экранирование, rate limit, Next 15 API: [`docs/AUDIT_FIXES.md`](docs/AUDIT_FIXES.md).
7. **Site audit protocol** — единая команда `npm run audit:full` + триггеры предложения аудита. Полный регламент: [`docs/SITE_AUDIT.md`](docs/SITE_AUDIT.md).
8. **Правила среды выполнения (Windows / OpenCode)** — LF, UTF-8 no-BOM, безопасная замена: [`docs/ENV_RULES.md`](docs/ENV_RULES.md).

## Project overview

- Стек: Next.js 15.5 + React 19 + TypeScript strict + Tailwind + lucide-react
- БД: Supabase (PostgreSQL + RLS)
- Деплой: Vercel (`team=alikmmmm`, прод https://dogovor.expert)
- Шаблонов: 369, PRO-подписка через YooKassa (акция 299 ₽ до 2026-09-20)
- Аналитика: Яндекс.Метрика (consent-gated), Sentry
- Ветка: `master` (PR не используются)
- Секреты: `.env.production` для локального `next start`, prod-окружение на Vercel

## Setup commands

- Install: `npm install`
- Dev: `npm run dev`
- Verify (typecheck+lint+test): `npm run verify`
- Build: `npm run build`
- Deploy: `npx vercel --prod --yes --cwd "D:\Мои сайты\site Dogovor"`
- Smoke (prod): `npm run check:smoke:prod`
- Полный аудит: `npm run audit:full` (PSI + LHCI + Squirrelscan)

## Code style

- TypeScript strict, без `any` и `@ts-ignore`
- ESLint + Prettier (Biome — отдельно для скорости)
- Tailwind utility, mobile-first
- lucide-react icons (импортировать по одному)
- React 19: `use()` для promises, server actions где возможно
- Все строки UI — на русском

## Testing instructions

- Vitest для unit (296+ тестов), Playwright для e2e
- Перед коммитом: `npm run verify` (typecheck + lint + test:unit)
- Перед деплоем: `npm run check:smoke:prod` (5 сценариев)
- Coverage: ≥ 60% (v8), не снижать

## Security considerations

- Все env vars — через Zod-валидацию (`src/lib/env.ts`)
- Supabase: server client в server actions, browser client в client components
- API routes: Zod-схема + CSRF (`@/lib/csrf`) + rate limit (`@/lib/ratelimit`)
- CSP через middleware (source-based; см. `src/middleware.ts`; НЕ nonce/strict-dynamic — несовместимо с SSG prerender)
- Sentry для мониторинга (НЕ отключать)
- НЕ логировать токены, ключи, персональные данные

## Things to avoid

- НЕ использовать `any` (strict mode)
- НЕ хардкодить строки на русском — выносить в константы
- НЕ создавать API route, если можно Server Action
- НЕ добавлять зависимости без обоснования (`package.json` diff)
- НЕ отключать линтер-правила, ESLint disable без reason
- НЕ коммитить `.env*`, секреты, ключи

## Commit conventions

- Conventional Commits (enforce через commitlint)
- `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- Scope: `feat(auth):`, `fix(cookies):`, `chore(deps):`
- Breaking: `feat(api)!:` или footer `BREAKING CHANGE:`
- release-please автоматически бампит версию + CHANGELOG.md

## MCP-инструменты (экономно используй)

- **context7** — документация библиотек (Next.js 15, React 19, pdf-lib, supabase-js). Когда не уверен в API/версии — `use context7`.
- **playwright** (local MCP) — браузер для проверки UI/снимков на localhost и проде. Дополняет e2e.
- **gh_grep** (grep.app) — примеры кода на GitHub. Лёгкий, можно всегда.
- **firecrawl** — живой веб-поиск/скрейпинг (конкуренты, проверка SEO).
- **sentry** — по умолчанию disabled. Включать (`enabled: true`) только когда нужен разбор ошибок прода. Всегда выключай обратно.

Правило: MCP-инструменты добавляют токены в контекст. Используй точечно, не «на всякий случай».

## Личные файлы

Не коммитить и не редактировать: `prompt-для-нейросети.md`, `СКОРО_растаможка.md`, `на-потом.md` (в корне репозитория).

## Вложенные AGENTS.md (специфичные правила по разделам)

- `src/lib/supabase/AGENTS.md` — правила Supabase (RLS, миграции, безопасные клиенты)
- `src/lib/cloud/AGENTS.md` — облачные провайдеры (Google Drive, Яндекс.Диск, Dropbox)
- `src/components/AGENTS.md` — правила UI (a11y, Storybook, Tailwind, lucide-react)
- `src/app/api/AGENTS.md` — правила API routes (Zod, rate limit, CSRF)
- `src/app/admin/AGENTS.md` — админка (защита, аудит, RLS-политики)
- `src/lib/validations/AGENTS.md` — Zod-схемы (контракты, реэкспорт)

## IDE-обёртки (агент читает по своим правилам)

| IDE/Агент | Файл | Статус |
|---|---|---|
| AGENTS.md (стандарт) | `AGENTS.md` | ✅ источник правды |
| GitHub Copilot | `.github/copilot-instructions.md` | ✅ краткая выжимка |
| Cursor | `.cursorrules` | ✅ краткая выжимка |
| Cline (VS Code) | `.clinerules` | ✅ краткая выжимка |
| Windsurf | `.windsurfrules` | ✅ краткая выжимка |
| Aider | `.aider.conf.yml` | read=AGENTS.md |
| Continue.dev | `.continuerules.json` | ✅ |
| opencode | `AGENTS.md` (нативно) | ✅ |

При обновлении этого регламента — синхронизируй `.cursorrules`, `.clinerules`, `.windsurfrules`, `CLAUDE.md` (см. `.github/workflows/sync-agents.yml`).