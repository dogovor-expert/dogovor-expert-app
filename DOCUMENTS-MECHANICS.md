# Механика документов и шаблонов (гайд для AI-агента)

> Цель файла: чтобы при добавлении/изменении шаблонов документов и бланков
> агент НЕ сломал сайт. Читай этот файл целиком перед любой правкой,
> связанной с `/blanks`, `/documents`, `/preview`, генерацией PDF и превью.

---

## 0. Главное правило (один источник истины)

HTML-шаблон в `src/data/templatePreviews.ts` (`TEMPLATE_PREVIEWS[<id>]`) — это
**единственный источник** для ВСЕГО визуала документа:

- скачиваемый PDF (`buildPdf`),
- живой предпросмотр в конструкторе (`PdfPreview`),
- статические картинки-превью на `/blanks/[slug]` (сгенерированные JPG).

Меняя `previewHtml` шаблона, ты меняешь PDF **и** превью одновременно — это
правильно, они остаются идентичны. Не пытайся «подогнать» превью отдельно от PDF.

---

## 1. Архитектура (пайплайн рендера)

```
TEMPLATE_PREVIEWS[id]  (HTML-строка, Mustache-маркеры {{field}})
        |  renderTemplateDocument(template, values, {previewTemplate, blank})
        v
   HTML-строка  ---------------------+
        |                            |
        |                   buildPdf(html, {design, fonts, pageNumbers})
        |                            |  (кастомный движок на pdf-lib, src/lib/exportPdf.ts)
        |                            v
        |                       PDF (Blob)  --> скачивание пользователем
        |                            |
        |  PdfPreview.tsx            |  растеризация pdf.js в <img>  (живой предпросмотр
        |  (/preview, /builder)     |  в браузере)
        |                            |
        +--> generate-blank-previews.mts (один раз при правке)
                  растеризует PDF в JPG -> public/blank-previews/{id}-{n}.jpg + index.json
                  -> страница /blanks/[slug] отдаёт <img> (статично, SEO)
```

Ключевые файлы:
- `src/data/templates.ts` — `LEGAL_TEMPLATES`: метаданные (`id`, `title`, `category`, `fields: TemplateField[]`, `presets`, `actSource`, …).
- `src/data/templatePreviews.ts` — `TEMPLATE_PREVIEWS`: карта `id -> HTML-строка` (тело документа с маркерами). **Само содержимое документа здесь.**
- `src/data/types.ts` — типы `LegalTemplate`, `TemplateField`.
- `src/lib/renderDocument.ts` — `renderTemplateDocument(t, values, opts)`: подставляет значения в Mustache, применяет пак-алиасы (`PACK_FIELD_ALIASES`), форматирует даты и суммы прописью (`rublesToWords`).
- `src/lib/exportPdf.ts` — `buildPdf(html, opts)`: кастомный PDF-движок на pdf-lib. Парсит HTML через `DOMParser`, сжимает в собственную модель (`paragraph`/`row`/`columns`/`table`/`image`/`line`/`sides`/`pricebox`), измеряет и рисует. **Это НЕ браузер и НЕ полноценный CSS** — поддерживается ограниченный набор тегов/классов (см. раздел 6).
- `src/components/PdfPreview.tsx` — клиентский компонент: `buildPdf` + pdf.js -> массив data-URL картинок. Используется в `/preview`, `/builder`, модалках.
- `src/app/blanks/[slug]/page.tsx` — **статическая** страница бланка. Читает `public/blank-previews/index.json`, отдаёт `<img src="/blank-previews/{id}-1.jpg">`. Если картинки нет — фолбэк на старый `dangerouslySetInnerHTML` (устаревший, НЕ соответствует PDF, оставлен только как запасной).
- `scripts/generate-blank-previews.mts` — генератор статических JPG-превью.
- `public/blank-previews/` — сгенерированные `{id}-{n}.jpg` + `index.json`.
- `public/fonts/*.ttf` — шрифты (PT Serif для дизайна `classic`, Inter для `modern`).

---

## 2. Как добавить НОВЫЙ шаблон (бланк / договор)

Шаги (важен каждый):

1. **Метаданные.** В `src/data/templates.ts` добавь объект в `LEGAL_TEMPLATES` с
   уникальным `id` (kebab-case, напр. `dkp-boat`), `title`, `category`, `fields`
   (массив `TemplateField` с теми же `id`, что используются в маркерах), `presets`
   (значения по умолчанию/выпадающие списки), `actSource` и т.п.
   `id` используется в URL: `/blanks/<id>`, `/documents/<id>`, `/preview?t=<id>`.
   **Не переименовывай уже существующие `id`** — сломаются SEO-ссылки и `index.json`.

2. **HTML тела.** В `src/data/templatePreviews.ts` добавь запись
   `TEMPLATE_PREVIEWS[<тот_же_id>] = "<HTML-строка>"`. Это и есть текст документа.
   Копируй HTML ближайшего похожего шаблона и правь — не пиши «с нуля», чтобы
   сохранить понятные движку классы (см. раздел 6).

3. **Маркеры полей = Mustache.** Используй `{{field_id}}` (HTML-эскейпится),
   секции `{{#field_id}} ... {{/field_id}}` и инверсные `{{^field_id}} ... {{/field_id}}`.
   `field_id` должен совпадать с `id` из `fields` шага 1. Неиспользуемые маркеры
   останутся в PDF как есть (`{{field}}`) — проверяй.
   Особенность: чтобы показать значение в угловых скобках, пиши `<{{date}}>`
   (символы `<` `>` — буквальный текст, НЕ HTML-тег; движок так и понимает).

4. **Сверить маркеры и поля.** Каждый `{{field_id}}` в HTML должен иметь
   соответствующий `id` в `fields` шага 1 (или совпадать с одним из
   `PACK_FIELD_ALIASES` в `renderDocument.ts` — для пакетных документов-спутников).
   Лишние маркеры выведутся в PDF как есть: `{{field}}`.

5. **Локальная проверка.** `npm run dev`, открой `/preview?t=<id>` и (в конструкторе)
   `/builder`. Предпросмотр должен совпадать с тем, что позже будет в PDF.

6. **ОБЯЗАТЕЛЬНО сгенерировать превью.** Запусти генератор (см. раздел 4).
   Проверь, что появился `public/blank-previews/<id>-1.jpg` и запись `"<id>": N`
   в `public/blank-previews/index.json`. Если шаблон многостраничный — будет
   `<id>-1.jpg`, `<id>-2.jpg`, … (по числу страниц).

7. **Закоммитить ВМЕСТЕ с кодом** сгенерированные JPG и `index.json`. Они лежат в
   `public/` и НЕ заигнорены. Если не закоммитить — на проде `/blanks/<id>`
   не найдёт картинку и упадёт на фолбэк (старый HTML, не совпадает с PDF) или
   покажет битую картинку.

---

## 3. Как работает подстановка значений (`renderTemplateDocument`)

- Вход: `template` (из `LEGAL_TEMPLATES`), `values` (заполненные поля пользователя
  или `{}` для пустого бланка) и `options` (`previewTemplate`, `blank`, `blankMode`).
- `Mustache.render(previewTemplate, view)` подставляет значения. Для пустого бланка
  (`blank:true`) значения пусты, и движок `exportPdf` рисует подчёркнутые
  плейсхолдеры вместо текста (см. `applyBlankMarkers`).
- `PACK_FIELD_ALIASES` — переиспользование полей между документами одного пакета
  (напр. `seller_fio` <- `owner_fio`/`donor_fio`). Не ломай эти маппинги без нужды.
- Даты форматируются `formatRuDate` («5 июня 2016 г.»), суммы — `rublesToWords`.

---

## 4. Генерация статических превью (`/blanks`)

Скрипт `scripts/generate-blank-previews.mts` (npm-скрипт `generate:blank-previews`):
- берёт ВСЕ `LEGAL_TEMPLATES`, для каждого рендерит пустой бланк
  (`renderTemplateDocument(t, {}, {previewTemplate, blank:true, blankMode:"pdf"})`),
- строит PDF тем же `buildPdf(design:"classic")`,
- растеризует страницы в JPG (scale 1.5, quality 0.88) через `pdfjs-dist` + `@napi-rs/canvas`,
- пишет `public/blank-previews/<id>-<n>.jpg` и манифест `index.json` (`{id: pageCount}`).

Запуск:
```
npm run generate:blank-previews                 # все 369+ шаблонов
LIMIT=5 npx tsx scripts/generate-blank-previews.mts   # только первые 5 (тест)
```
Важно: генерация — один раз при правке/добавлении, НЕ в рантайме. Страница
`/blanks/[slug]` просто отдаёт готовый `<img>`. Хелпер `getBlankPreviewImages(slug)`
в `page.tsx` читает `index.json` и проверяет `existsSync` файла; если картинки нет —
фолбэк на старый `dangerouslySetInnerHTML`.

---

## 5. Шрифты

- Лежат в `public/fonts/*.ttf`. Дизайн `classic` использует PT Serif
  (`pt-serif-regular/bold/italic/bolditalic.ttf`), `modern` — Inter.
- В браузере `buildPdf` сам делает `fetch('/fonts/...ttf')`. В Node-генераторе
  шрифты читаются локально и передаются в `buildPdf(html, { fonts })` байтами
  (см. `CLASSIC_FONTS` в скрипте) — иначе `fetch` относительного URL не сработает.
- Чтобы добавить шрифт: положи `.ttf` в `public/fonts/` и зарегистрируй 4 начертания
  в `src/lib/docDesign.ts` (`DesignFonts`). Без регистрации `buildPdf` не найдёт шрифт.

---

## 6. Что ПОНИМАЕТ PDF-движок (`src/lib/exportPdf.ts`)

Это кастомный layout-движок, НЕ браузер. Он парсит HTML (`DOMParser`) и сворачивает
в ограниченный набор блоков. Безопасно использовать:
- блочные: `div`, `p`, `section`, `article`, `h1`–`h4`;
- инлайн: `span`, `strong`/`b` (жирный), `em`/`i` (курсив), `u`;
- списки: `ul`/`ol` + `li` (класс `list-disc pl-6` и т.п.);
- таблицы: `table`/`tr`/`td`/`th`;
- картинки: `img` (только встроенные, с понятным `src`);
- размер шрифта движок берёт из Tailwind-классов через `sizeFromClass`
  (`text-base`, `text-xs`, `text-[10px]`, `text-[13px]` и др.);
- двухколоночные подписи — через `grid grid-cols-2` / `flex justify-between`;
- линия для ручной подписи — `border-b border-zinc-950 w-44 h-5`;
- служебные классы движка: `.doc-sides-title` (блок «Стороны»), `.doc-sides-*`.

**НЕ поддерживается** (сломает PDF/скачивание): `position: absolute/fixed`,
сложный `flex-wrap`, вложенные `grid` глубже 1 уровня, CSS-переменные,
произвольные стили через `style="..."` (движок читает только знакомые классы),
HTML-комментарии внутри значимых блоков.
Правило: копируй структуру и классы существующего похожего шаблона, не изобретай вёрстку.

---

## 7. Деплой (Vercel)

- Проект: **`dogovor-templates`** (`prj_cABOmf2bYKyHIff0lHOAJFxzG943`),
  команда `team_pXRjMlbYrIwcDzWq1TUGBdtU`. Токен у владельца репозитория.
- ВНИМАНИЕ: есть старый дубликат-проект `dogovor-expert` (`prj_tCT0dlJBCe8X9BwvJ9wLw6E1s2uw`)
  — его НЕ трогай, не деплой туда. `.vercel/project.json` в корне репозитория
  должен указывать на `dogovor-templates` (projectId выше).
- Прод-деплой из корня репозитория:
  ```
  vercel deploy --prod --token <TOKEN> --yes
  ```
  Домен `dogovor.expert` (+ `www`) автоматически алиасится на новый прод-билд.
- `npm run build` (Next.js) собирает `/blanks/[slug]` и `/documents/[slug]` как
  SSG по ВСЕМ шаблонам через `generateStaticParams`. Новый шаблон из `LEGAL_TEMPLATES`
  появится на сайте автоматически после сборки + деплоя.

---

## 8. ЧЕГО НЕЛЬЗЯ ДЕЛАТЬ (критично — иначе сломаешь сайт)

1. **Не возвращай `/blanks` на сырой `dangerouslySetInnerHTML(previewHtml)`.**
   Это вернёт баг: HTML-обёртка страницы имеет свои отступы, а внутри шаблона ещё
   `pl-[35mm] pr-[8mm] pt-[20mm] ...` — двойные/конфликтующие отступы, и превью
   визуально НЕ совпадает со скачиваемым PDF. Превью `/blanks` ДОЛЖНО быть картинкой
   из `public/blank-previews` (как сейчас реализовано в `page.tsx`).
2. **Не удаляй и не игнорируй `public/blank-previews/*` и `index.json`** без
   перегенерации — иначе превью пропадут.
3. **Не переименовывай `id` существующих шаблонов** — сломаются SEO-URL
   (`/blanks/<id>`, `/documents/<id>`) и ключи в `index.json`.
4. **Не добавляй маркер `{{field}}` без поля в `fields`** — в PDF он выведется как
   буквальный `{{field}}`.
5. **Не меняй `buildPdf` / `docDesign` / `renderDocument`, не перегенерировав ВСЕ
   превью** (`npm run generate:blank-previews` полностью) — иначе картинки на
   `/blanks` разъедутся с актуальным PDF.
6. **Не пиши в `previewHtml` HTML/CSS, который движок не парсит** (раздел 6) —
   сломается не только превью, но и скачивание PDF.
7. **Не выноси картинки превью в Git LFS / не добавляй их в `.gitignore`** —
   Vercel грузит статику из `public/` репозитория; без файлов в репо превью не будет.
8. **Не деплой в проект `dogovor-expert`** — только `dogovor-templates`.

---

## 9. Чек-лист проверки перед коммитом и деплоем

- [ ] `npm run build` проходит без ошибок.
- [ ] `npm run generate:blank-previews` (полный) сгенерировал JPG для нового
      и всех изменённых шаблонов.
- [ ] `public/blank-previews/index.json` содержит `"<id>": N`.
- [ ] Локально `/blanks/<id>` отдаёт `<img src="/blank-previews/<id>-1.jpg">`,
      картинка открывается (HTTP 200); `/preview?t=<id>` визуально совпадает с PDF.
- [ ] `git status` показывает новые/изменённые `public/blank-previews/*.jpg` и
      `index.json` — закоммить их вместе с правкой кода.
- [ ] Деплой только в `dogovor-templates`.

---

## 10. Полезные команды

```
npm run dev                                  # локальная разработка
npm run build                                # production-сборка (SSG всех шаблонов)
npm run generate:blank-previews              # перегенерация всех JPG-превью
LIMIT=5 npx tsx scripts/generate-blank-previews.mts   # тест на 5 шаблонах
vercel deploy --prod --token <TOKEN> --yes   # прод-деплой
```

---

> Этот файл — контракт. Любую правку, связанную с документами/бланками/PDF/превью,
> делай строго по разделам 2 и 8. При сомнениях: единый источник визуала —
> `TEMPLATE_PREVIEWS`, а превью на сайте — это картинка из `public/blank-previews`,
> а не сырой HTML.
