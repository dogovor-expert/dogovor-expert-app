# Site Audit Protocol

> Вынесено из AGENTS.md (05.09.2026). Причина: регламент занимал 80+ строк, заслуживает отдельной документации.

## 1. Единая команда и файлы отчётов

- **`npm run audit:full`** — оркестратор аудита (3 фазы по скорости)
  - `--quick` только Phase 1 (typecheck + lint + blast + unit)
  - `--site-only` только Phase 3 (PSI + LHCI + Squirrelscan)
  - `--skip-prod` пропустить Phase 3
- **Файлы отчётов:**
  - `reports/audit-latest.md` — полный сводный отчёт (перезаписывается)
  - `reports/audit-history.md` — лог истории (дописывается по 1 строке)
  - `.lighthouseci/` — детальные отчёты Lighthouse по 5 страницам (gitignored)
  - `.squirrel/` — артефакты Squirrelscan (gitignored)

## 2. Phase 1 — Code static + unit (быстро, ~30с)

- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint (0 errors обязательно)
- `npm run check:blast -- --staged` — blast radius по staged-файлам
- `npm run test:unit` — vitest, исключая интеграционные

## 3. Phase 2 — E2E + smoke (средне, ~2-3м)

- `npm run check:smoke` — 5 критичных сценариев локально (главная, /templates, /builder, 404, cookie consent)
- `npm run test:e2e` — Playwright 15 projects (5 viewports × 3 браузера) — для регрессий
- `npm run check:smoke:prod` — те же 5 сценариев против https://dogovor.expert

## 4. Phase 3 — Site audit (медленно, ~5м, удалённый прод)

- **PSI** (`scripts/psi.mjs` → `npm run psi`): Google PageSpeed Insights API = pagespeed.web.dev engine. Lab Lighthouse (perf/seo/bp/a11y, FCP/LCP/TBT/CLS/SI) + field CrUX metrics. Нужен `PSI_API_KEY` (Google Cloud, pagespeedonline API).
- **Lighthouse CI** (`lighthouserc.json` → `npm run lighthouse`): 5 ключевых страниц, desktop preset, отчёты в `.lighthouseci/`. Assertions = warn (не gate).
- **Squirrelscan** (`squirrel.toml` → `npm run audit:squirrel`): 150-страничный краул + 260 правил (SEO/a11y/perf/security/agents), LLM-friendly вывод.

## 5. Прочие полезные инструменты (вне audit:full)

- `npm run audit:acts` — канонический реестр НПА (статьи/диапазоны)
- `npm run check:blast` — blast radius (только staged, без `--`)
- `npm run check:secrets` — gitleaks по staged-файлам
- `npm run knip` — неиспользуемые exports/files/deps
- `npm run biome:check` / `biome:fix` — быстрая проверка стиля (альтернатива ESLint)
- `npm run test:integration` — vitest с реальной Supabase (требует запущенного supabase)
- `npm run test:prod` — Playwright против прода (только `prod-export.spec.ts`)
- `npm run semgrep` — 9 кастомных SAST-правил (dangerouslySetInnerHTML, window.open без noopener, cookies() в use client, process.env в client и др.) — в CI через `.github/workflows/semgrep.yml`
- `npm run analyze` — bundle analyzer (`ANALYZE=true next build`)

## 6. Триггер 1 — Прямая команда пользователя

Если пользователь пишет: *«проведи анализ сайта»*, *«сделай аудит»*, *«проверь сайт»*:

1. Запусти `npm run audit:full`.
2. Дождись записи в `reports/audit-latest.md`.
3. Выведи в чат компактную сводку: TypeScript/Lint/Unit, Lighthouse perf/a11y по 5 страницам, Squirrel Health Score + топ-3 проблемы.

## 7. Триггер 2 — Проактивное предложение после крупных работ

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
- Изменение `next.config.mjs`, `Dockerfile`, `vercel.json` (легаси), `sentry.*.config.ts`, deploy-настройки CapRover (вебхук ветки `production`)
- Правка AGENTS.md / commitlint / husky / CI workflows

**Формат обязательного вопроса** в конце отчёта о крупной задаче:

> *«Внесены существенные изменения в [компоненты/страницы]. Запустить комплексный аудит (`npm run audit:full`) для обновления `reports/audit-latest.md`?»*

## 8. Примечания

- `audit:full` НЕ подключён в pre-commit / CI / Docker build — это ручной инструмент, медленный, требует прод-доступ.
- squirrel free tier: local crawl only (no JS rendering). `squirrel auth` разблокирует полный аудит.
- PSI 429 = дневная квота без ключа; используй `PSI_API_KEY` или запускай реже.
- Phase 2 + 3 требуют локально поднятого `next start` либо прямого доступа к https://dogovor.expert.
- При обновлении этого регламента — синхронизируй `.cursorrules`, `.clinerules`, `.windsurfrules`, `CLAUDE.md` (см. `.github/workflows/sync-agents.yml`).