---
description: Безопасный деплой Dogovor на прод (VDS/Dokploy) по регламенту AGENTS.md
---

## Безопасный деплой на прод (Dokploy)

Канон — `AGENTS.md` + `docs/DEPLOY.md`. Vercel НЕ используется, GitHub как
источник кода НЕ используется (троттлинг с VDS — код берётся из локального зеркала).

### Предварительная проверка
1. `npx tsc --noEmit` — 0 ошибок.
2. `npm run test:unit` — все зелёные.
3. `git status` — без критичных незакоммиченных изменений; ветка `master`.

### Деплой
4. `npm run deploy` (= `git push vds master`) → затем **Deploy в панели Dokploy**
   (Applications → `dogovor-prod` → Deploy), либо одной командой, если задан
   `DOKPLOY_API_KEY`.

### Пост-деплой проверка (ОБЯЗАТЕЛЬНА)
5. `og-image.png` и `apple-icon.png` отдают 200 (НЕ исключать `*.png`).
6. Основные страницы отдают 200; `npm run check:smoke:prod`.
7. `robots.txt`: `Disallow: /documents$`, посадочные не убиты.

Верни краткий отчет о статусе деплоя.
