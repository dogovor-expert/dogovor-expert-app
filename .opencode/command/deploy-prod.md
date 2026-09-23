---
description: Безопасный деплой Dogovor на прод (CapRover) по регламенту AGENTS.md
---

## Безопасный деплой на прод (CapRover)

Канон — `AGENTS.md` + `docs/DEPLOY.md`. Vercel НЕ используется.

### Предварительная проверка
1. `npx tsc --noEmit` — 0 ошибок.
2. `npm run test:unit` — все зелёные.
3. `git status` — без критичных незакоммиченных изменений; `production` обязана быть fast-forward от `master`.

### Деплой
4. `git push origin master:production` → CapRover-вебхук сам собирает и деплоит прод.

### Пост-деплой проверка (ОБЯЗАТЕЛЬНА)
5. `og-image.png` и `apple-icon.png` отдают 200 (НЕ исключать `*.png`).
6. Основные страницы отдают 200; `npm run check:smoke:prod`.
7. `robots.txt`: `Disallow: /documents$`, посадочные не убиты.

Верни краткий отчет о статусе деплоя.
