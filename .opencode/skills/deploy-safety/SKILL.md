---
name: deploy-safety
description: Безопасный деплой Dogovor на прод (CapRover). Проверяет предусловия, выполняет деплой и верифицирует результат. Используй перед каждым деплоем на прод.
---

# Deploy Safety

## Когда использовать

Этот skill ОБЯЗАН использоваться при:
- Деплое на прод через `git push origin master:production` (CapRover-вебхук)
- Любых изменениях в `captain-definition`, `next.config.mjs`, `middleware.ts`
- Обновлении зависимостей, влияющих на сборку
- После исправления багов, требующих проверки на проде

## Предусловия (все должны быть OK)

1. **Типы чисты**: `npx tsc --noEmit` — 0 ошибок
2. **Тесты проходят**: `npm run test:unit` — все зелёные
3. **Нет незакоммиченных критических изменений**: `git status`

## Деплой

```powershell
git push origin master:production
```
Канон — `docs/DEPLOY.md`; `production` обязана быть fast-forward от `master`.

### Критические правила (из AGENTS.md)
- **НЕ исключать `*.png`** — `og-image.png` (1200x630) и `apple-icon.png` (180x180) обязаны попасть в деплой
- **НЕ заливать `.next/cache`** — build-кэш может уронить загрузку

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

- Статус «deployed» в панели CapRover НЕ означает доставку кода — проверять фактически (HTTP-коды + smoke)
- `package.json` в `.next` — служебный `{"type":"module"}`, подменять sha в манифесте
- Кириллица в PowerShell: `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8`
