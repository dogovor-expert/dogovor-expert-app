# Прочитай сначала корневой `AGENTS.md` — это канонические правила проекта.
# Этот файл (CLAUDE.md) существует потому, что Claude Code ищет именно его.
# Все специфичные для Claude инструкции — здесь.

## Claude Code — специфика

### Workflow
- Перед ЛЮБОЙ правкой → прочитай `AGENTS.md` и ближайший `src/*/AGENTS.md`
- Перед изменением файла → `node scripts/check-blast-radius.mjs <файл>` (Blast Radius Protocol)
- После правок → `npm run verify` (typecheck + lint + vitest related)
- Перед деплоем → `npm run check:smoke:prod`

### Tool usage
- Edit/Write: только с предварительным Blast Radius + проверкой
- Bash: предпочитать `npm run` / `npx` (не прямые команды)
- Read: сначала AGENTS.md → потом специфика файла
- Grep: `node scripts/check-blast-radius.mjs` лучше чем `grep -r`

### Когда НЕ использовать Edit
- Если задача > 30 строк изменений в 1 файле → сначала спросить подход
- Если меняется публичный API → проверить всех потребителей (Blast Radius)
- Если добавляется новая зависимость → обоснование + проверка лицензии (MIT/Apache)
- Если меняется CSP/security → ОБЯЗАТЕЛЬНО smoke test на prod после деплоя

### Известные ловушки Claude
- Может сломать CSP при правке middleware.ts — НЕ ТРОГАТЬ без Blast Radius
- Может "починить" localStorage в SSR-компонентах → гидратация падает
- Может добавить `useState(mounted)+useEffect(setMounted)` антипаттерн — использовать `useSyncExternalStore` или `suppressHydrationWarning`
- Может забыть `await` для async server actions → unhandled promise

### MCP
- `firecrawl` — для research (не для production deployment)
- `sentry` — только при разборе prod-ошибок (включить-выключить)

### Помни
- `npm run verify` перед коммитом
- `git commit --no-verify` ТОЛЬКО для экстренных hotfix (задокументировать в CHANGELOG)
- Деплой: `git push origin master:production` → CapRover-вебхук собирает и деплоит прод (см. `docs/DEPLOY.md`; НЕ Vercel)
