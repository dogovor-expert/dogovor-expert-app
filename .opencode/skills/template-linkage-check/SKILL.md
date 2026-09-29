---
name: template-linkage-check
description: Проверка целостности связей «шаблон → рендер → сканер → тесты» при любых изменениях в юридических шаблонах. Используй при добавлении, изменении или удалении шаблонов, полей, классов HTML или токенов дизайна.
---

# Template Linkage Check

## Когда использовать

Этот skill ОБЯЗАН использоваться при:
- Добавлении нового юридического шаблона
- Изменении полей существующего шаблона
- Изменении классов HTML в шаблонах или `parts.ts`
- Изменении токенов дизайна в `docDesign.ts`
- Изменении логики рендера в `renderDocument.ts`
- Изменении логики сканера в `docRequirements.ts` или `docOcr.ts`

## Порядок проверки

### 1. Исследование (grep/glob)
Перед правкой найди ВСЕ затронутые файлы:
```
grep -r "template_id" src/
grep -r "field_id" src/
grep -r "class_name" src/
```

### 2. Карта связей — что проверять

| Тип изменения | Затронутые модули | Тесты |
|---|---|---|
| Новый шаблон | `src/data/templates/*.ts`, `index.ts` | `templates.test.ts` (счётчик 570 + валидность `suggestedDocs` + `TEMPLATE_COUNT`), `docScanner.test.ts` |
| Новое поле | `format.ts`, `validation.ts`, `docRequirements.ts` | `format.test.ts`, `validation.test.ts` |
| Изменение класса HTML | `renderDocument.ts`, `exportPdf.ts` | `renderDocument.test.ts`, `docDesign.test.ts` |
| Изменение токена | `docDesign.ts` | `docDesign.test.ts` |
| Изменение роли | `docRequirements.ts`, `personMapping.ts` | `docScanner.test.ts` |

### 3. Обязательный прогон тестов
```
npx tsc --noEmit
npx vitest run
```

### 4. Запрещённые действия
- Менять классы HTML без сверки с рендерерами
- Добавлять шаблон без обновления счётчика в `templates.test.ts` и `TEMPLATE_COUNT` (`src/lib/site.ts`)
- Объявлять `field_is_*` флаги вручную (они генерируются автоматически)
- Менять токены `docDesign.ts` без обновления тестов `docDesign.test.ts`
- Использовать OTF-шрифты вместо TTF

### 5. Формат отчёта
```
## Linkage Check Report
- Изменение: [описание]
- Затронутые файлы: [список]
- Связи: шаблон/рендер/сканер/тесты
- Тесты: OK/FAIL
- Статус: OK / FAIL
```
