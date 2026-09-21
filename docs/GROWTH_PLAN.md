# План роста dogovor.expert — полный blueprint

Дата: 21.09.2026. Основано на аудите кода HEAD, инвентаризации и внешнем исследовании (GitHub, Яндекс.Реклама, конкуренты).

---

## 0. Резюме и корректировка исходного плана

Присланный документ честен по математике (5–7 млн запросов/мес, потолок топ-1 ~20–35 тыс/сутки), но построен на допущении «у вас 50 шаблонов и ничего больше». Факт:

| Что предлагают «построить» | Факт в коде |
|---|---|
| PDF-комбайн (iLovePDF) | **Уже есть** — 14 инструментов, клиентские |
| Юркалькуляторы (395 ГК, госпошлина, ЖКХ) | **Уже есть** — 22 |
| Виральная ссылка контрагенту | **Уже есть** — `/approve/[token]` |
| 50–80 шаблонов | **369** |
| Штамп в PDF | **Уже есть** (футер всегда) |
| База по ИНН | **Отсутствует** — новый модуль |
| Монетизация рекламой | **Заготовка есть**, сети не подключены |

Следующий шаг — закрыть архитектурные упущения, обесценивающие вложенное, затем достраивать.

---

## 1. Находка №1 — `/converter` → 14 отдельных URL (**главная дешёвая победа**)

### Проблема
`src/app/converter/page.tsx` — `"use client"`, 14 инструментов = вкладки (`useState("merge")`, URL через `history.replaceState(?tool=)`). Один `<title>`/canonical `/converter` из `src/app/converter/layout.tsx`. Отдельных страниц под запросы «сжать pdf», «pdf в word» не существует → нет индексации → нет трафика.

### Референс
[PDFCraftTool/pdfcraft](https://github.com/PDFCraftTool/pdfcraft) / [pdfkoi/pdfkoi](https://github.com/pdfkoi/pdfkoi) — тот же стек (Next.js 15 App Router, pdf.js + pdf-lib, PyMuPDF WASM), но каждый инструмент на своём URL. Подсмотреть структуру и состав инструментов (у них 80–95, у нас 14).

### Как делать правильно
1. Новый источник данных `src/data/converter-tools.ts`: `slug, h1, title, description, keywords[], faq[{q,a}], howTo, relatedTools[], componentKey`.
2. Роут `src/app/converter/[tool]/page.tsx` (server component):
   - `export const dynamicParams = false;`
   - `generateStaticParams()` → все слаги (пререндер на билде);
   - `generateMetadata({ params })` → уникальные `title`/`description`/`canonical: /converter/<slug>`/OG; невалидный слаг → `notFound()`.
3. Клиентский раннер `src/components/converter/ConverterRunner.tsx` (`"use client"`) — принимает `tool`, монтирует существующие компоненты `dynamic(..., { ssr:false })`. Сами `src/components/converter/*` **не трогаем**.
4. `/converter` остаётся хаб-каталогом: карточки-ссылки на `/converter/<slug>`.
5. On-page: `<h1>` под запрос, блок «Как … онлайн», **уникальный FAQ** + `JsonLd` (`FAQPage`) через `src/components/seo/JsonLd.tsx`, `HowTo` где уместно, перелинковка «похожие инструменты».
6. `src/app/sitemap.ts` — добавить все 14 URL (priority 0.7, weekly).
7. Внутренние ссылки: со страниц шаблонов/блога → релевантный инструмент.
8. Реклама: см. раздел 6 (слот `CONVERTER_FOOTER` + `CONVERTER_RELATED`), **не внутри рабочей зоны инструмента**.

### Приоритет запросов (РФ)
объединить PDF · сжать PDF · PDF в Word · JPG в PDF · PDF в JPG · разделить PDF · распознать PDF (OCR) · водяной знак PDF · подписать PDF · извлечь текст PDF · нумерация страниц.

### Проверки
`npx tsc --noEmit`, `npm run lint`, `npm run test:unit`, `npm run check:smoke`, blast-radius по `src/app/converter/**`.

---

## 2. Находка №2 — виральный брендинг (**усилить, не строить**)

Футер уже есть всегда: `src/lib/exportPdf.ts` `drawFooter()` (421–459) — «Стр. N из M» + «Сформировано на dogovor.expert» на каждой странице. Бланки: `src/lib/renderDocument.ts:457–459`.

Улучшения:
- Добавить **QR-код** на страницу создания документа в футер (библиотека `qrcode` уже используется в `renderDocument.ts`).
- Короткая кликабельная ссылка `dogovor.expert` (в PDF — как аннотация-ссылка через `pdf-lib`).
- **Снять брендинг на платном тарифе** (мягкий стимул к оплате).
- **Недокрут:** `watermark` для free не передаётся при экспорте (`src/app/builder/page.tsx:1031,1284`) — проверить и включить.

---

## 3. Находка №3 — измерение K-фактора approval-ссылок

В `src/lib/userEvents.ts` `EVENT_CATALOG` есть `approval_created`, нет воронки. Добавить:
- `approval_opened` — GET `/approve/[token]` (`src/app/api/approval/[token]/route.ts`);
- `approval_unlocked` — успешная разблокировка паролем;
- `approval_signup` — регистрация после захода по approval-ссылке (связка sessionId/referrer_host).

Далее: на `/approve/[token]` для незалогиненного контрагента после заполнения — ненавязчивый CTA «Создайте свой документ бесплатно». K-фактор = (новые юзеры из approval-ссылок) / (созданные approval-ссылки).

---

## 4. Programmatic SEO вариаций шаблонов (дисциплина, не залп)

**Риск:** апдейт Яндекса-2026 против малополезного контента жёстко понижает массово-шаблонные страницы; фильтр применяется к **домену**, а не к отдельной странице.

Правила:
- Не 5000 разом, а **100–200 вариаций за спринт**.
- Контроль: Яндекс.Вебмастер «Страницы в поиске» + Search Console — через 2–4 недели смотреть долю проиндексированных и показы, лишь потом следующая партия.
- **Порог уникальности** (прописать в `docs/SEO_INVARIANTS.md`): свой FAQ, блок «особенности вариации», своя SEO-справка со ссылками на нормы, уникальные title/description/H1, при пересечении с материнским шаблоном — корректный `canonical`.
- Матрица: **тип документа × специфика (регион/сфера) × стороны сделки** — только там, где вариация реально меняет содержание.
- Технология: `generateStaticParams` (App Router), `dynamicParams = false` для известных вариаций; `revalidate` — только для публичных каталогов.

---

## 5. База проверки контрагентов по ИНН (новый модуль)

### Источники (GitHub/интернет)
- **Open-data ФНС (бесплатно):** `nalog.gov.ru/opendata/7707329152-egrul/`, `.../egrip/` — суточные XML-ZIP, полный слепок ~15 ГБ, лицензия принимается один раз на сайте ФНС. Форматы ЕГРЮЛ 4.08 / ЕГРИП 4.07 (с 01.02.2026), старые — до 22.01.2027.
- **[govpun1-web/mcp-egrul](https://github.com/govpun1-web/mcp-egrul)** (MIT) — импортёр дампов ФНС в **SQLite + FTS5**, инкрементально по cron, Docker. Не писать ETL с нуля.
- **[atomno-mcp/mcp-fns-check](https://github.com/atomno-mcp/mcp-fns-check)** (MIT) — клиент `egrul.nalog.ru` (двухшаговый POST: `POST /` → `{t:token}`, затем `POST /search-result/<token>`).
- **Checko API** — `api.checko.ru/v2/company?key=&inn=`, JSON, `source=true` отдаёт сырой ЕГРЮЛ.
- **DaData `findById/party`** — уже интегрирован (`src/app/api/dadata/route.ts`), до 300 результатов.

### Этапы
1. **MVP (дни):** публичный роут `/company/[inn]` на DaData/Checko + кэш в Postgres (`companies`), `generateMetadata` + JSON-LD `Organization`, кнопка **«Составить договор с этой компанией»** → автозаполнение реквизитов в конструктор (переиспользовать паттерн `DadataPanel`/`DadataSuggest`).
2. **Прод (месяцы):** своя БД из дампов ФНС по модели mcp-egrul; инкрементальное обновление кроном.
3. **Юридика:** данные публичны, но при миллионах страниц — политика удаления карточки по требованию субъекта (право на забвение), как у Checko/Rusprofile; прописать в `docs/`.

---

## 6. Яндекс.Реклама (РСЯ) — подключение и карта рекламных мест

### 6.1. Текущее состояние в коде
- `src/components/ads/AdSlot.tsx` — слот: рендерит `<div>` с `SLOT_MIN_HEIGHT` и `aria-label="Реклама"`, подключает загрузчик РСЯ (`https://yandex.ru/ads/system/context.js`) и рендерит RTB-блок **только** при `NEXT_PUBLIC_ADS_ENABLED=1` **и** согласии `categories.marketing` (152-ФЗ). Без заполненного `NEXT_PUBLIC_RTB_<SLOT>` блок не рендерится, место резервируется.
- Все 13 слотов определены и **расставлены** по страницам: `HOME_INFEED, BLOG_INFEED, BLOG_SIDEBAR, ARTICLE_INLINE, ARTICLE_SIDEBAR, ARTICLE_FOOTER, TEMPLATES_INFEED, CALC_RESULT, LANDING_INFEED, CONVERTER_FOOTER, CONVERTER_RELATED, DOC_TEMPLATE_FOOTER, RESUME_INFEED`.
- Расстановка: `ARTICLE_*` + `BLOG_*` в блоге; `CONVERTER_FOOTER`/`CONVERTER_RELATED` в `src/app/converter/[tool]/page.tsx`; `DOC_TEMPLATE_FOOTER` в `src/app/documents/[slug]/page.tsx`; `RESUME_INFEED` в `/resume`; `CALC_RESULT` в `/utils`; `TEMPLATES_INFEED` в `/templates`; `HOME_INFEED` на главной; `LANDING_INFEED` на лендингах `/dkp /osago /autoteka /epts /tahograph /techosmotr`.
- RTB-идентификаторы берутся из `NEXT_PUBLIC_RTB_*` (см. `src/lib/ads.ts`). Пока не заполнены → слоты резервируют место, рекламы нет.

### 6.2. Как работает РСЯ (по офиц. документации Яндекса)
Две части кода:
1. **Код загрузчика** — один раз в `<head>` всех страниц с рекламой.
2. **Код рекламного блока** — в каждой точке показа (RTB-блок; выдаётся в кабинете «Реклама на сайтах → RTB-блоки → Получить код»).

Типы блоков: **Баннер** (в контенте), **Лента** (после основного контента), **Top Ad / Floor Ad** (overlay, прилипает к краю).

Ограничения Яндекс.Рекламы (соблюдать обязательно):
- Top Ad и Floor Ad **нельзя одновременно** на одной странице.
- Лента **не может показываться на одном экране** с Floor/Top Ad.
- overlay только Floor Ad (desktop), кнопка «Закрыть» — **вне** креатива; мобильный overlay — только ширина экрана 320–420 px.
- Полноэкранный SD — только в блоках «Полноэкранный»/«Rewarded»; Rewarded — только после действия пользователя.
- Рекламные блоки Яндекса должны **отличаться** от блоков других систем; нельзя перекрывать элементы креатива; нельзя менять режим просмотра страницы ради показа.

### 6.3. Критично: политика безопасности (CSP)
`src/middleware.ts:188–202` — текущий CSP **заблокирует** скрипты РСЯ. Для подключения добавить:
- `script-src`: `https://yastatic.net https://an.yandex.ru`;
- `img-src`: `https://an.yandex.ru https://avatars.mds.yandex.net`;
- `frame-src`: `https://an.yandex.ru`;
- `connect-src`: `https://an.yandex.ru https://ads.yandex.ru`.

Это осознанное ослабление CSP ради монетизации — зафиксировать в `docs/INVARIANTS.md`.

### 6.4. Согласие и загрузка
Загрузчик и блоки подключать **только после согласия `marketing`** (иначе — нарушение cookie-политики и 152-ФЗ). Реализация: `next/script strategy="afterInteractive"` внутри компонента, монтируемого при `categories.marketing`.

### 6.5. Карта рекламных мест (где ставить и где нельзя)

**Ставить:**

| Страница | Слот | Тип блока РСЯ | Позиция |
|---|---|---|---|
| `/` (главная) | `HOME_INFEED`, `LANDING_INFEED` | Баннер | между секциями контента |
| `/blog` | `BLOG_INFEED`, `BLOG_SIDEBAR` | Баннер | после 3–4 карточек / сайдбар |
| `/blog/[slug]` | `ARTICLE_INLINE`, `ARTICLE_SIDEBAR`, `ARTICLE_FOOTER` | Баннер | после 2-го абзаца / сайдбар / после статьи |
| `/templates`, `/blanks` | `TEMPLATES_INFEED` | Баннер | между карточками шаблонов |
| `/documents/[id]` | `DOC_TEMPLATE_FOOTER` *(новый)* | Баннер | после SEO-текста/FAQ, **не над кнопкой создания** |
| `/utils` (калькуляторы) | `CALC_RESULT` | Баннер | **под** результатом, не перекрывая |
| `/converter/[tool]` | `CONVERTER_FOOTER` + `CONVERTER_RELATED` *(новые)* | Баннер | под SEO-текстом/FAQ и после «других инструментов»; **не в рабочей зоне** |
| Лендинги `/dkp /osago /autoteka /epts /tahograph /techosmotr` | `LANDING_INFEED` | Баннер | после контента |
| `/resume` | `RESUME_INFEED` *(новый)* | Баннер | после блоков |

**НЕ ставить (принципиально):**
- `/builder` — рабочая зона, ядро платной ценности.
- `/dashboard`, `/billing`, `/settings`, `/security`, `/admin`, `/notifications` — приватные.
- `/login`, `/auth/*` — аутентификация.
- `preview`, `debug` — служебные.
- Внутри рабочей зоны любого инструмента конвертера.

**UX/техника:**
- Резервировать высоту (уже: `SLOT_MIN_HEIGHT`) → не ломать CLS/Core Web Vitals.
- Не размещать два overlay-блока; не совмещать Ленту и Floor/Top на одном экране.
- Помечать блоки `aria-label="Реклама"` (уже есть) и визуально отличать.
- Начисление: реклама на бесплатных страницах; платный тариф без рекламы — ещё один стимул к оплате.

### 6.6. Порядок подключения
1. Добавить сайт в кабинет Яндекс.Рекламы, пройти модерацию.
2. Создать RTB-блоки под каждый формат; получить коды.
3. Расширить CSP (см. 6.3).
4. Заполнить `NEXT_PUBLIC_RTB_<SLOT>` для каждого слота (см. `src/lib/ads.ts`), `NEXT_PUBLIC_ADS_ENABLED=1`.
5. Проверить: CSP не блокирует, CLS не растёт, блоки не показываются до согласия.

---

## 7. Конкуренты (для ориентира)

- **freshdoc.ru** — ИКС ~890, Alexa ~58k, 88.5% РФ; конструктор документов + юрконсультации.
- **dogovor24.ru** — конструктор юрдокументов для бизнеса.
- Вывод: конкурировать по глубине каталога (369 шаблонов), инструментам (конвертер/калькуляторы) и виральности — там, где у них слабее.

---

## 8. Дорожная карта (по отдаче на вложения)

| # | Шаг | Оценка | Эффект |
|---|---|---|---|
| 1 | `/converter` → 14 URL + метаданные/FAQ/JSON-LD + sitemap | недели | самый дешёвый и денежный |
| 2 | Усилить брендинг в экспорте (+QR, снятие на платном) | дни | виральный канал |
| 3 | События K-фактора approval + CTA на `/approve` | дни | измеримость виральности |
| 4 | Programmatic SEO вариаций (спринтами, с контролем) | месяцы | основной объём трафика |
| 5 | Яндекс.РСЯ (CSP + слоты + модерация) | дни-недели | монетизация трафика |
| 6 | База ИНН (MVP DaData/Checko → прод на дампах ФНС) | отдельный проект | новый пласт |

Порядок: **1 → 2 → 3 → 5 → 4 → 6**. Рекламу (5) можно включать сразу после 1, когда появится трафик на страницах инструментов.

---

## 9. Технические промты для агентов

### 9.1. `/converter` → отдельные URL
> Разбей `/converter` на отдельные SEO-роуты, не меняя функционал инструментов.
> 1. Создай `src/data/converter-tools.ts` — массив из 14 объектов `{slug, h1, title, description, keywords, faq[], seoText, componentKey, relatedTools[]}`.
> 2. Создай `src/app/converter/[tool]/page.tsx` (server) с `dynamicParams=false`, `generateStaticParams()` и `generateMetadata({params})` (уникальные title/description/canonical; неизвестный слаг → `notFound()`).
> 3. Создай `src/components/converter/ConverterRunner.tsx` (`"use client"`), принимающий `tool` и монтирующий существующие компоненты через `dynamic(..., {ssr:false})`.
> 4. `/converter/page.tsx` переделай в хаб-каталог со ссылками `<Link href="/converter/<slug>">`.
> 5. На каждой странице: `<h1>`, блок «Как … онлайн», уникальный FAQ + `JsonLd` (`FAQPage`) из `src/components/seo/JsonLd.tsx`, перелинковка relatedTools.
> 6. Добавь URL в `src/app/sitemap.ts` (priority 0.7, weekly).
> 7. Соблюдай `docs/SEO_INVARIANTS.md`. Проверки: tsc, lint, test:unit, check:smoke, blast-radius.

### 9.2. Яндекс.РСЯ
> Подключи РСЯ, не нарушая CSP и cookie-политику.
> 1. Расширь CSP в `src/middleware.ts:188–202`: script-src += `https://yastatic.net https://an.yandex.ru`; img-src += `https://an.yandex.ru https://avatars.mds.yandex.net`; frame-src += `https://an.yandex.ru`; connect-src += `https://an.yandex.ru https://ads.yandex.ru`.
> 2. В `src/components/ads/AdSlot.tsx` добавь загрузку загрузчика РСЯ (`next/script`, afterInteractive) и инжект кода блока по `id` — **только** при `ADS_ENABLED && categories.marketing`.
> 3. Добавь слоты `CONVERTER_FOOTER`, `CONVERTER_RELATED`, `DOC_TEMPLATE_FOOTER`, `RESUME_INFEED` с `SLOT_MIN_HEIGHT`.
> 4. Размести слоты по карте из раздела 6.5. **Не размещай** в `/builder`, `/dashboard`, `/billing`, `/settings`, auth и внутри рабочих зон инструментов.
> 5. Проверь: скрипты не блокируются CSP, CLS не растёт, до согласия реклама не грузится.

---

## 10. Что уже есть / что новый

**Переиспользуем:** конвертер и его компоненты, `AdSlot` (расширить), `JsonLd`, `userEvents`, DaData-роут, паттерн автозаполнения, `qrcode` в `renderDocument`.
**Новое:** `converter-tools.ts` + роут `[tool]`, события approval-воронки, слоты РСЯ + CSP-ослабление, programmatic-вариации (по спринтам), база ИНН.

---

## 11. Что изучить дальше (по ходу)

- Реальные условия РСЯ по нашему типу контента (юрдокументы) — при прохождении модерации.
- Финальный список инструментов, которых нет у нас (сверить с PDFCraft).
- Каких вариаций шаблонов реально не хватает (анализ спроса: Wordstat/Вебмастер).