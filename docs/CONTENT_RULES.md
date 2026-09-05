# ГЛАВНОЕ ПРАВИЛО: связанные элементы при наполнении контентом

> Вынесено из AGENTS.md (19.08.2026). Причина: блок занимал 50 строк, раздувал основной файл. Теперь это отдельный документ, на который ссылается AGENTS.md.

Любое добавление/изменение шаблона документа, поля, раздела, модуля или «любого другого контента» — это **НЕ изолированная правка**. Ниже — карта связей и обязательный чек-лист. Если не знаешь, какие элементы затронуты — сначала исследование (grep по id/классу/имени), потом правка, потом ВСЕ прогоны из чек-листа. **НИКОГДА** не помечать задачу «сделано» без полного прогона.

## Карта связей «шаблон → рендер → сканер → образцы»

### A. Шаблон (`src/data/templates/*.ts`, `parts.ts`, `index.ts`)

- Каждый шаблон = объект LegalTemplate с полями (`src/data/types.ts`). Категория — из списка в `index.ts` (порядок важен: AUTO, FINANCE, REALTY, BUSINESS, RENTALS, SALES, CONTRACTS, HR, CLAIMS, FINANCE_ACTS, CORPORATE_WEB, FAMILY, OTHER, MIGRATION, LEGAL, POSTAL).
- Общие блоки — из `parts.ts` (pageShell, pairIntro, pairSign, sideFields, sideBlock, commonClauses, saleSign, rentSign). Повторяющиеся блоки/таблицы — из своего файла (finance-act.ts: itemsRepeating+itemsTable; corporate-web.ts: partyFields, operatorSign, foundersSign, signPairLeft).
- Обязательные поля типов: select/radio со значениями порождают флаги `field_is_<value>` (только ASCII-значения) в renderDocument; числовые поля автоматически получают `<id>_words` (прописью) — НЕ объявлять такие поля вручную.
- Счётчик шаблонов: `src/lib/__tests__/templates.test.ts` ожидает точное число (сейчас 369). Добавил шаблон → обнови счётчик.

### B. Поля и валидация

- `src/lib/format.ts` — applyFieldFormat (НИКОГДА не форматировать `*_words` как числа), buildTemplateDefaults (defaultValue + флаги статусов). Новый шаблон без дефолтов ломает загрузку черновиков (`builder/page.tsx:571` — слияние `{...buildTemplateDefaults(template), ...draft.values}`).
- `src/lib/validation.ts` — isFieldVisible/dependsOn; категории полей и статусы (`seller_status: person|ip|legal` и т.п.) должны быть согласованы с шаблоном (sideFields в parts.ts).
- Роль/статусные префиксы (seller, buyer, owner, driver, landlord, tenant, donor, donee, ...) — фиксированный список в `src/lib/docRequirements.ts` (PERSON_ROLES). Новый префикс роли → добавить в PERSON_ROLES + слоты + тесты docScanner.test.ts.

### C. Итоговые документы PDF/DOCX — КОНТРАКТНЫЕ классы и токены

- Рендереры читают ТОЛЬКО по классам HTML. Менять классы в шаблонах/parts.ts без сверки с рендерами = тихий слом:
  - `doc-title` (заголовок), `doc-sides` + `doc-sides-title` (блок «Стороны» — в PDF две колонки, в DOCX таблица 2×50% без рамок), `doc-price` (рамка цены), пустой `div.border-b` (линия-разделитель), `flex justify-between` (пара строк), таблицы `<table><th><td>`.
  - Размеры: px→pt = ×0.75 (text-xs = 9pt, text-sm = 10.5pt; кегли токенов: title 15, subheading 11.5, body 10.5, small 8.5, tiny 7.5), интервалы leading-normal/tight/relaxed, отступы mb-*.
- Токены — единый источник `src/lib/docDesign.ts` (3 стиля: classic/minimal/brand; диапазоны зафиксированы тестами docDesign.test.ts — менять токены = менять тесты). Шрифты: только TTF в `public/fonts` (OTF → CFF-сабсеттинг pdf-lib при save() крайне медленный). В тестах/скриптах Node шрифты оборачивать `new Uint8Array(readFileSync(...))` (jsdom-реалм, иначе pdf-lib падает).
- Известные баги-ловушки (исправлены 19.08.2026, регресс-тесты в docDesign.test.ts): орфан-цикл обязан удалять страницы предыдущего рендера (`removePage(0)` × prevCount); оценка высоты блоков sides/columns — только через LayoutEstimator (layoutLines), не «words.length × fontSize × lh»; в renderBlockWithWidth есть `case "row"`.

### D. Сканер документов (OCR)

- Модули: `src/components/builder/DocScanner.tsx`, `OcrScanner.tsx`; логика — `src/lib/docRequirements.ts` (getDocRequirements/getTemplateRoles — слоты паспорт/прописка/ПТС/СТС/ЭПТС/ВУ по id полей) и `src/lib/docOcr.ts` (extractPassportData, extractVehicleData, applyPassportToRole, applyVehicleToTemplate). Конвертер: `src/app/converter` + `src/components/converter/*` (OcrTool, PdfToImages, SignPdf, MergePdf, SplitPdf, ImagesToPdf, DocxToPrint) — всё на pdfjs-dist.
- Связь: слоты сканера строятся по ПОЛЯМ шаблона. Если новый шаблон использует паспортные/авто-поля с нестандартными id — сканер его не распознает. Именование фиксировано: `<role>_passport`, `<role>_passport_series`, `<role>_passport_number`, `<role>_passport_issued_by`, `<role>_passport_code`, `<role>_address`, `<role>_birthday`, `car_vin`, `car_pts`, `car_epts`, `car_sts`.
- После любых изменений полей/шаблонов — прогнать `src/lib/__tests__/docScanner.test.ts` (роли, слоты, извлечение, применённые данные).

### E. Образцы и debug

- Папка `samples/` УДАЛЕНА 19.08.2026 (образцы больше не нужны пользователю). Тесты `src/lib/__tests__/gen-samples.test.ts` и `gen-samples-docs.test.ts` ИСКЛЮЧЕНЫ из vitest (см. vitest.config.ts) — при желании пересоздать образцы временно вернуть их в конфиг и прогнать вручную.
- `src/app/debug/pdf/page.tsx` — SAMPLE обязан содержать флаги статусов (`seller_status`, `buyer_status`, `seller_data_mode`, `buyer_data_mode`, `claim_period` и т.п.), иначе условные секции рендерятся ПУСТЫМИ (реальный кейс: пропал блок «Стороны», 19.08.2026).
- `_total_pretty` (итог repeating-таблиц) вычисляется в `src/lib/renderDocument.ts` для фиксированного списка id — новый табличный шаблон → добавить его id в этот список.

## Обязательный чек-лист перед завершением ЛЮБОЙ задачи

1. `npx tsc --noEmit` — чисто.
2. `npx vitest run` — все тесты (счётчик шаблонов, docDesign, docScanner, renderDocument, validation, format, gen-samples...).
3. Если менялся шаблон/рендер/токены — открыть свежие образцы в `samples/` и `samples/10-docs/` и программно проверить: шапка/подвал, число страниц, отсутствие пустых полей и плейсхолдеров, нет дублей страниц, нет «дыр» > 60pt (кроме штатных отступов дизайна, напр. 76pt после `doc-title`), блок «Стороны» присутствует.
4. Если менялись шаблоны/контент, влияющий на каталог/сканер — проверить соответствующие тесты (templates, docScanner).
5. Задеплоить и проверить прод фактически (см. `docs/DEPLOY.md`).

## Подсказки DaData и сохранённые лица

- Прокси `/api/dadata` (ops: find-party, suggest-party, suggest-address, suggest-fms_unit) возвращает `{error:"subscription required", fallback:true}` без серверного ключа — тогда фронт ходит напрямую в suggestions.dadata.ru с ключом пользователя из `localStorage.dadata_key`. НЕ менять формат ответа без сверки с `src/components/builder/DadataSuggest.tsx`.
- Автоподсказки в форме (`DadataSuggest.tsx` + FormField): поля `*_passport_code` → suggest-fms_unit, поля `*_address` → suggest-address. Заполнение связанных полей через `onSuggestFill` → `handleSuggestFill` (`builder/page.tsx`) — ТОЛЬКО к существующим и пустым полям.
- Маска `XXX-XXX` в `format.ts` применяется к `department_code` И `*_passport_code`.
- Таблица `public.persons` (миграция `008_persons.sql`) — сохранённые физлица. API `/api/persons` (GET/POST/DELETE) зеркалит `/api/contractors`. Панель «Сохранённые лица» (PersonsPanel) с кнопками по ролям из `getTemplateRoles` (PERSON_ROLES). Маппинг роль↔данные — `src/lib/personMapping.ts`.