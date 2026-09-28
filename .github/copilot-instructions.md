# GitHub Copilot — специфика

Прочитай `AGENTS.md` для общих правил. Copilot читает `.github/copilot-instructions.md`.

## Project context
- Next.js 15.5 App Router + React 19 + TypeScript strict
- Supabase (PostgreSQL + RLS) для БД (self-hosted на VDS)
- VDS/Dokploy deployment (док. — docs/DEPLOY.md)
- Юридические документы на русском (369 шаблонов)
- PRO-подписка через YooKassa
- Аналитика: Яндекс.Метрика (consent-gated)

## Code style
- TypeScript strict mode (no `any`, no `@ts-ignore` без reason)
- Tailwind utility classes
- lucide-react icons (one-by-one import)
- Server Components по умолчанию, `"use client"` только где нужно
- React 19: `use()` для promises, Server Actions
- Zod для валидации, CSRF + rate limit для API
- Conventional Commits: `feat:`, `fix:`, `chore:`

## Workflow
1. Перед edit: `node scripts/check-blast-radius.mjs <path>` (Blast Radius)
2. После edit: `npm run verify` (typecheck + lint + test)
3. Перед deploy: `npm run check:smoke:prod`

## Тесты
- Vitest для unit (296+ тестов)
- Playwright для e2e
- `npm run test:unit` перед коммитом

## Запрещено
- Изменять `src/middleware.ts` без Blast Radius
- `useState(null)+useEffect(setMounted)` — использовать `useSyncExternalStore`
- inline `style={{}}` — Tailwind
- `dangerouslySetInnerHTML` без DOMPurify
- Коммитить `.env*`, секреты
