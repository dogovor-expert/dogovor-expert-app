---
name: deploy-safety
description: Безопасный деплой Dogovor на прод (VDS/Dokploy). Проверяет предусловия, выполняет деплой и верифицирует результат. Используй перед каждым деплоем на прод.
---

# Deploy Safety

## Когда использовать

Этот skill ОБЯЗАН использоваться при:
- Деплое на прод (`git push vds master` + Deploy в панели Dokploy)
- Любых изменениях в `Dockerfile`, `next.config.mjs`, `middleware.ts`
- Обновлении зависимостей, влияющих на сборку
- После исправления багов, требующих проверки на проде

## Предусловия (все должны быть OK)

1. **Типы чисты**: `npx tsc --noEmit` — 0 ошибок
2. **Тесты проходят**: `npm run test:unit` — все зелёные
3. **Нет незакоммиченных критических изменений**: `git status`

## Деплой

```powershell
npm run deploy          # = git push vds master + запуск сборки в Dokploy (нужен DOKPLOY_API_KEY)
# без API-ключа: git push vds master, затем Deploy в панели вручную
```
Канон — `docs/DEPLOY.md`. Ветка `master` — единственная деплой-ветка.

### Критические правила (из AGENTS.md)
- **НЕ исключать `*.png`** — `og-image.png` (1200x630) и `apple-icon.png` (180x180) обязаны попасть в деплой
- **НЕ заливать `.next/cache`** — build-кэш может уронить загрузку
- **НЕ переключать Dokploy на GitHub** — с VDS идёт троттлинг, код берётся из локального зеркала
- **НЕ пушить повторно «для ускорения»** — каждый лишний push = ещё один цикл сборки в очереди

## Пост-деплой верификация (ОБЯЗАТЕЛЬНА)

### 1. Бандл
Проверь что сайт отдаёт 200 на основных страницах.

### 2. OG-картинки
```
https://dogovor.expert/og-image.png → 200
https://dogovor.expert/apple-icon.png → 200
```

### 3. PDF-экспорт
Скачай тестовый PDF и проверь:
- Шапка присутствует
- Watermark: «Сформировано бесплатно на сервисе Dogovor»
- Нет пустых полей/плейсхолдеров

### 4. Robots.txt
```
Disallow: /documents$
Disallow: /documents/$
```
(НЕ `Disallow: /documents` — иначе убьёт посадочные)

### 5. Бандл с прода
Проверь маркер инверсии: `this.y=o.h-i.top` (ПРИСУТСТВУЕТ) вместо `this.y=i.top` (СТАРЫЙ КОД)

## Формат отчёта

```
## Deploy Report
- Предусловия: OK/FAIL
- Деплой: OK/FAIL (URL: ...)
- OG-картинки: OK/FAIL
- PDF-экспорт: OK/FAIL
- Robots.txt: OK/FAIL
- Бандл: OK/FAIL
- Статус: OK / FAIL
```

## Известные ловушки

- Статус `done` в панели Dokploy НЕ означает доставку кода — проверять фактически (HTTP-коды + smoke + `deploy-content.mjs`)
- `package.json` в `.next` — служебный `{"type":"module"}`, подменять sha в манифесте
- Кириллица в PowerShell: `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8`
