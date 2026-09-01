---
name: deploy-safety
description: Безопасный деплой проекта Dogovor на Vercel. Проверяет предусловия, выполняет деплой и верифицирует результат. Используй перед каждым деплоем на прод.
---

# Deploy Safety

## Когда использовать

Этот skill ОБЯЗАН использоваться при:
- Деплое на Vercel через `npx vercel --prod`
- Любых изменениях в `.vercel.json`, `next.config.mjs`, `middleware.ts`
- Обновлении зависимостей, влияющих на сборку
- После исправления багов, требующих проверки на проде

## Предусловия (все должны быть OK)

1. **Типы чисты**: `npx tsc --noEmit` — 0 ошибок
2. **Тесты проходят**: `npm run test:unit` — все зелёные
3. **Нет незакоммиченных критических изменений**: `git status`

## Деплой

```powershell
npx vercel --prod --yes --cwd "D:\Мои сайты\site Dogovor"
```

### Критические правила (из AGENTS.md)
- **НЕ исключать `*.png`** из robocopy — `og-image.png` (1200x630) и `apple-icon.png` (180x180) обязаны попасть в деплой
- **НЕ заливать `.vercel`** (и `.vercel/output`) — Vercel подхватит как prebuilt build artifacts → 404
- **НЕ заливать `.next/cache`** — build-кэш, большой `0.pack` может уронить загрузку
- **`proj` должен содержать ВЕСЬ проект** — Vercel запускает реальный `next build`

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

- «READY+PROMOTED» НЕ означает доставку кода — проверять фактически
- `package.json` в `.next` — служебный `{"type":"module"}`, подменять sha в манифесте
- Кириллица в PowerShell: `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8`
