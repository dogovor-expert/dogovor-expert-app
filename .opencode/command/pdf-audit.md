---
description: Программная проверка PDF-экспорта по чек-листу pdf-export-verify
---

## PDF Export Audit

Проведи полную программную проверку PDF-экспорта по правилам skill `pdf-export-verify`:

### Шаг 1: Сборка и тесты
1. Запусти `npm run test:unit` — проверь что тесты рендера проходят.
2. Проверь `src/lib/exportPdf.ts` на наличие изменений.

### Шаг 2: Программный анализ
3. Если есть скачанные PDF с прода (`%LOCALAPPDATA%\Temp\opencode\prod-*.pdf`):
   - Запусти `python C:\Users\alikpc\AppData\Local\Temp\opencode\pdf-vision.py <файл.pdf>`
   - Проверь y-координаты блоков (шапка ~57-90, watermark ~800-822)
   - Проверь текст watermark: «Сформировано бесплатно на сервисе Dogovor»
4. Если PDF нет — запусти `npm run test:prod` для скачивания.

### Шаг 3: Проверка бандла
5. Проверь наличие маркера инверсии вертикали `this.y=o.h-i.top` в `.next/static/chunks/2172-*.js`.

### Шаг 4: Итог
Верни структурированный отчет:
- Статус: OK / FAIL
- Координаты блоков
- Статус watermark
- Статус бандла
