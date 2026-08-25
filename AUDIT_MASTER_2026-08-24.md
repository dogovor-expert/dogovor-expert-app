# МАСТЕР-АУДИТ — dogovor.expert (site Dogovor)
**Дата:** 2026-08-24 · **Состав:** Next.js 15.5.23 (App Router), React 19, Node 24, Supabase, Upstash, YooKassa, Tesseract, pdf-lib/docx, Vercel
**Глубина:** максимальная, чтение реального кода по всем доменам + сверка юр.формул с актуальным правом РФ (Гарант/Консультант/ФНС).
**Статус:** ТОЛЬКО АУДИТ. Правки не вносились.

---

## 0. Сводная оценка по доменам

| Домен | Оценка | Главный риск |
|---|---|---|
| Безопасность / Backend / API | **4/10 (HIGH RISK)** | XSS в превью, rate-limit fails-open, admin через RLS, webhook IP-spoof |
| Движок генерации документов | **6.5/10** | Не работает выравнивание по ширине (justify), XSS-превью, дубль логики склонений |
| Builder UI/UX + компоненты | **6.5/10 (B−)** | Нет focus-trap в модалках, hover-меню экспорта недоступно на тач, ре-рендер всего дерева |
| Конвертеры / OCR / Сканер | **4/10 (HIGH RISK)** | «Подпись» — не ЭП (юр.введение), JPG-подпись падает, OCR бьёт по CDN, ложные срабатывания паспорта |
| Калькуляторы / юр.логика | **4/10 (CRITICAL)** | 4 критических юр.ошибки (НДФЛ, ст.395, ПДД, УСН/НДС), выдаёт неверные суммы |
| SEO / Perf / Инфра / Аналитика / A11y | **6.7/10** | Метрика до согласия (152-ФЗ), Supabase на каждой публичной странице, слабый CSP |

**Общий вердикт:** функционально богатый продукт с сильным каркасом, но с **критическими дефектами в самых ответственных зонах** — юридическая корректность расчётов и безопасность пользовательских данных. Перед масштабированием трафика и доверия обязательны P0-исправления.

---

## 1. КРИТИЧЕСКИЕ находки (исправлять в первую очередь)

1. **[SEC/XSS] Неэкранированные `{{{field}}}` с пользовательским вводом → stored/self-XSS** в превью документа (`renderDocument.ts:193` `view[f.id]=raw`; шаблоны `parts.ts` и ~355 блоков в `templatePreviews.ts` через `{{{...}}}`; сток `DocPreview.tsx:108,196,209`). Исправление: заменить на `{{field}}`; добавить DOMPurify перед `dangerouslySetInnerHTML`. PDF/DOCX не затрагиваются (читают textContent).
2. **[CALC/CRIT] НДФЛ: детские вычеты не применяются** — `fin.ts:56-57` считает налог от `annualIncome`, игнорируя `taxable`. Родители переплачивают.
3. **[CALC/CRIT] Проценты ст.395 с платежами: теряется последний период** — `calc.ts:159-200` не добавляет `toStr` как конечное событие; сегмент «последнее событие → окончание» не считается.
4. **[CALC/CRIT] Штрафы ПДД: скидка 50%/20дн вместо 25%/30дн** — `koap.ts` + `PddFines.tsx`. ФЗ-490 (с 01.01.2025): скидка 25%, срок 30 дней.
5. **[CALC/CRIT] УСН/НДС: пороги 60М/250М вместо 20М/272,5М (2026)** — `fin.ts:81`. Утрата освобождения от НДС наступает при >20 млн (ФЗ-425/ФНС-2026); градации 5%/7% при 20–272,5 / 272,5–490,5 млн; утрата самой УСН — при >490,5 млн.
6. **[SEC] Rate-limit fails-open** — `ratelimit.ts:7-13,44-52`: при отсутствии `UPSTASH_REDIS_*` лимитер `null`, `checkRateLimit` → `{ok:true}`. Проверить наличие ключей в Vercel; сделать fail-closed.
7. **[SEC] Admin-авторизация только через RLS/anon** — `admin-auth.ts:35-42`, `middleware.ts:75-80`. Риск приват-эскалации при ошибке RLS. Перенести `is_admin` в JWT `app_metadata` + service-role.
8. **[SEC] Webhook YooKassa: IP-spoof через `X-Forwarded-For`** — `billing/webhook/route.ts:52-58`. Брать IP из `x-vercel-forwarded-for`; добавить подпись вебхука.
9. **[CONV/CRIT] «Подпись в PDF» — не электронная подпись** — `SignPdf.tsx` встраивает картинку (нет PKI/сертификата). Юр.введение пользователей. Переименовать в «факсимиле» + дисклеймер, либо интегрировать УКЭП.
10. **[CONV/CRIT] JPG-подпись падает** — `SignPdf.tsx:130-131`: `blob:`-URL всегда → `embedPng` → ошибка для JPG. Выбирать декодер по `file.type`.
11. **[CONV/CRIT] OCR сканера тянет Tesseract с CDN** — `ocr-worker.js:7,18` + `DocScanner.tsx:136` (`rus+eng`, а в `/workers/tessdata` только `rus`). Нарушение заявленного «не покидают браузер · 152-ФЗ», не работает офлайн/Safari. Использовать локальные `/workers/*` + `rus`.
12. **[UI/CRIT] Модалки без focus-trap/Escape** — `builder/page.tsx:1873-1942` (email), `SignCanvasModal.tsx:67-119`, `PaywallModal.tsx`. Сделать единый доступный `Modal`.
13. **[UI/CRIT] Экспорт DOCX/Email недоступен на тач** — `PreviewStage.tsx:123-168` только `group-hover`. Заменить на click-toggle dropdown.
14. **[SEO/LEGAL] Yandex Metrika грузится ДО согласия** — `YandexMetrika.tsx` + `AppLayout.tsx:337` (баннер косметический). Нарушение 152-ФЗ/GDPR. Грузить только после «Принять».
15. **[PERF/SEO] Supabase `getUser()` на каждой публичной `/documents/:slug`** — `middleware.ts:40-65,131`. +50–200 мс TTFB на 367 важнейших SEO-страниц. Early-return для публичных роутов.

---

## 2. Безопасность и Backend (детально)

| # | Sev | Локация | Проблема / Рекомендация |
|---|---|---|---|
| F1 | HIGH | ratelimit.ts:7-13 | fails-open (см. Критич.6) |
| F2 | HIGH | billing/webhook:52-58 | IP-spoof XFF (см. Критич.8) |
| F3 | HIGH | documents/[id]/route.ts:17-23 | Mass-assignment: `body` spread в UPDATE → смена `user_id`/статуса. Whitelist `{title,fields,checklist,versions,status}`. |
| F4 | HIGH | XSS `{{{}}}` + dangerouslySetInnerHTML | см. Критич.1 |
| F5 | HIGH | login/page.tsx:63,137,273,312; reset:13-16 | Open redirect через `next`. Добавить `isSafeRedirect` (только `/`-пути). |
| F6 | HIGH | export/email:38,47,67 | Email-бомбинг: любой получатель + 30 МБ. Ограничить своим `user.email`, кап 10 МБ, проверка `%PDF-`. |
| F7 | HIGH | admin-auth.ts:35-42 | admin через anon/RLS (см. Критич.7) |
| F8 | M-H | billing/webhook:127-139 | Race/idempotency: нет блокировки. Unique `provider_id` + conditional update. |
| F9 | M-H | billing/*create-payment,auto-renew,autoteka/pay | `host=req.headers.get("host")` → Host-header injection в return_url. Использовать `NEXT_PUBLIC_SITE_URL`. |
| F10 | MED | admin/export:6-10 | CSV-инъекция формул (`=cmd`). Префикс `'` для `=+-@`. |
| F11 | MED | preview:47-54, renderDocument:300-329, profile:54 | `signature` без валидации → self-XSS в `<img src="...">`. Валидировать `data:image/(png|jpeg|webp);base64`, экранировать атрибут. |
| F12 | MED | profile/route.ts | PATCH/DELETE без CSRF/origin + без rate-limit. Добавить `isSameOrigin`+limiter. |
| F13 | MED | supabase/*, middleware | Не заданы явно `httpOnly/secure/sameSite` куки. Задать явно + тест. |
| F14 | MED | feedback:138-143 | base64 декодируется до проверки размера (память DoS). Проверять до `Buffer.from`. |
| F15 | MED | import:14-36 | Безлимит `drafts`, без валидации полей. Кап 50, allowlist `template_id`. |
| F16 | MED | ratelimit.ts:38-42, dadata:92 | leftmost-XFF spoof. Использовать `x-vercel-forwarded-for`. |
| F17 | MED | middleware:5,127-138 | `/debug` защищён только «authenticated», не admin. Перенести под admin-гейт. |
| F18 | L-M | billing/* | Дублирующиеся активные подписки не предотвращены. Unique или дедуп. |
| F19 | LOW | autoteka/pay:55 | `Idempotence-Key: randomUUID()` каждый раз → ретраи создают новые платежи. Детерминировать от `(user_id,vin,premium)`. |
| F20 | LOW | JsonLd.tsx:5 | JSON.stringify в script — проверить отсутствие `</script>`. |
| F21 | LOW | audit.ts:1-26 | «tamper-resistant» не выполняется (plain insert, админ может удалить). Логировать ВСЕ admin-мутации. |
| F22 | LOW | login/page.tsx | Turnstile только при регистрации, не при логине (асимметрия, приемлемо). |
| F23 | INFO | .env* | Секреты server-side, не `NEXT_PUBLIC`, не в бандле — ОК. Service-role key байпасит RLS → макс. blast radius, ротейт + секрет-скан в CI. |

**Профессиональный эталон:** OWASP ASVS v4 (V4.1 auth, V4.5 rate-limit fail-closed, V4.8 redirects, V5.3 XSS), паттерны Supabase production (admin через JWT app_metadata, service-role только сервер), YooKassa официальная интеграция (verify по API + IP allowlist/subnet, либо подпись).

---

## 3. Движок генерации документов (детально)

| # | Sev | Локация | Проблема / Рекомендация |
|---|---|---|---|
| F1 | HIGH | exportPdf.ts:474-495 | **Justify не работает** для одно-стильных строк (fast-path игнорирует `extraSpace`). Тело договоров рендерится влево при `align:justify` по умолчанию. Применять `extraSpace` в per-word пути. |
| F2 | HIGH | renderDocument.ts:193 + `{{{}}}` | XSS в превью (см. Критич.1). |
| F3 | M-H | exportPdf.ts:121-139,487 | Длинный неразрывный токен (IBAN и т.п.) после посимвольного разрыва склеивается пробелами («К О Н Т Р А К Т»). Флаг `soft` → join `""`. |
| F4 | MED | renderDocument.ts:229-250 | `_words` генерится для ВСЕХ числовых полей (и `car_year` и т.п.). Ограничить regex `/_(amount|price|sum|cost)$/` или флагом. |
| F5 | MED | names.ts / decline.ts / calculator.ts | 3 копии склонений/чисел. `decline.ts` «Лев»→«Лева» (неправильно, должно «Льва»). Унифицировать в `names.ts`/`words.ts`. |
| F6 | MED | exportPdf.ts:1166 vs exportDocx.ts:433 | PDF justify, DOCX LEFT для `<p>` без класса. Унифицировать. |
| F7 | MED | exportPdf.ts:747 vs exportDocx.ts:379 | `doc-price` left (PDF) vs center (DOCX). Унифицировать (center). |
| F8 | MED | exportPdf.ts:1043-1051 | `flex justify-between` теряет средние дети при >2. Утвердить ровно 2 в тестах. |
| F9 | MED | renderDocument.ts:154-251 | Игнорирует `dependsOn`/`isFieldVisible` → скрытые значения попадают в pack-доки. Фильтровать через `isFieldVisible`. |
| F10 | MED | exportPdf.ts:447-458,1282-1294 | Atomic-block pagination vs estimate не согласованы → «fit one page» даёт 2. Учесть атомарность в оценке. |
| F11 | MED | exportPdf.ts:753,756 / exportDocx.ts:181 | Только равные колонки. Добавить токены `col-[40%]`. |
| F12 | MED | renderDocument.ts:207-209 | `_is_<value>` только для `[a-z0-9_]+`; кириллица/дефис → флаг не создаётся. CI-линт или расширить regex. |
| F13-L20 | LOW | см. отчёт агента | single-root assert, PNG-only DOCX, measureText без мемо, normalizeTypography мёртв, rublesToWords копейки off-by-1 на float-грани, cap 12 цифр. |
| TG | — | тесты | Нет тестов на justify/alignment parity/`{{{}}}`-XSS/кросс-реализацию склонений/адверсариал-ввод. |

**Эталон:** WeasyPrint/PagedJS/Html2Pdf (реальный justify), docx4j (пропорц. колонки), LawDepot/Rocket Lawyer (санитайз всех пользовательских данных).

---

## 4. Builder UI/UX и компоненты (детально)

**A11y:** A1 модалки без focus-trap (HIGH, см. Критич.12); A2 `bg-${accentColor}-900` (Tailwind JIT не генерит динамику) — мёртвый код; A3 табличные инпуты без label; A4 DaData-подсказки без клавиатуры (переиспользовать `HeaderSearch`); A5 `aria-invalid` только у text; A6/A7/A8 — heading order, контраст `gray-300`, canvas без label.

**UX:** U1 при блокировке превью аудит-панель спрятана за другой вкладкой (HIGH) — в `goToPreview` переключать `sidebarTab="preview"`; U2 тихое восстановление черновика (нет баннера); U3 нет undo/redo в форме; U4 `ProgressSteps` семантика; U5 `selectedTemplateId` не персистится (сброс на перезагрузке); U6 failure показывается как empty; U7 тач-экспорт (HIGH, см. Критич.13); U8 версии не видны в builder; U9 «100% бесплатно» vs PRO-гейт (честность).

**State:** S1 монолит `builder/page.tsx` (~1955 строк, 60+ useState, нет `React.memo`/`useCallback`) → ре-рендер всего дерева на каждый ввод (HIGH). Вынести `useBuilderForm`/context, мемоизировать `FormField`/`FormSection`. S2 мутация ref во время рендера; S3 autosave vs load ordering (latent); S4 DaData-key в localStorage (XSS-вектор); S5 `*_words` не очищается при очистке цены; S6 `designId="classic"` захардкожен (мёртвая возможность); S7 `templatePreviews.ts` 1.5 МБ (леджи-чанк ок).

**Responsive:** R1 двухколоночный layout только с `xl` (1280); R2 TemplateSelector — горизонтальный скролл; R3 тач-таргеты <44px; R4 моб. экспорт (см. U7).

**Error:** E1 `.catch(()=>{})` без сигнала (профиль/подписки/contractors/persons/approvals); E3 `String.fromCharCode.apply` может `RangeError` на больших PDF (Email) — слить чанками; E4 нет офлайн-индикации.

**Perf:** P1 re-render storm (S1); P2 двойной `renderPreview()` в `PreviewStage`; P3/P4 `qrCacheKey`/`costCalc` не `useMemo`.

**Consistency:** C1 builder НЕ использует `ui/Button|Input|Select|Card|Badge` (два словаря стилей) — HIGH; C2 неконсистентные кнопки; C3 slate vs gray; C5 Badge не используется.

**Dead code:** D1 `TopNav/SidebarLeft/Centered/SplitView/LivePreviewPanel` нигде не импортируются (в TopNav/SidebarLeft — баг из A2). Удалить или починить.

**Что хорошо:** автосейв с дебаунсом+версионированием+кросс-вкладка; `HeaderSearch` — эталонный a11y combobox; lazy `next/dynamic` тяжёлых панелей; live-аудит/чеклист/approval-QR.

---

## 5. Конвертеры / OCR / Сканер (детально)

| # | Sev | Локация | Проблема / Рекомендация |
|---|---|---|---|
| F1 | CRIT | ocr-worker.js:7,18; DocScanner:105-138 | OCR с CDN + `rus+eng` (см. Критич.11). Локальные `/workers/*` + `rus`. |
| F2 | CRIT | SignPdf (UI) / page.tsx:20,100 | «Подпись» — не ЭП (см. Критич.9). |
| F3 | CRIT | SignPdf.tsx:130-131 | JPG-подпись падает (см. Критич.10). |
| F4 | HIGH | docOcr.ts:84-92 | Паспорт: fallback `(\d{2})\s?(\d{2})\s?(\d{6})` → ложные срабатывания от телефонов/любых 10 цифр. Убрать fallback, требовать «серия»/контекст, валидировать диапазоны. |
| F5 | HIGH | docOcr.ts:177-189 | ПТС — тот же loose fallback. Аналогично F4. |
| F6 | HIGH | DocScanner.tsx:179-182 | OCR БЕЗУСЛОВНО перезаписывает заполненные поля. Заполнять только пустые или с подтверждением. |
| F7 | HIGH | SignPdf.tsx:70-77 vs 135-137 | Превью (top-origin) ≠ вывод (bottom-origin) + путаница x/y → не WYSIWYG. Единая система координат. |
| F8 | MED | ImagesToPdf.tsx:19,40 | accept webp/bmp, но эмбедит только PNG/JPG → краш. Ограничить accept или декодить через canvas. |
| F9 | MED | docOcr.ts:53 + passportReg | propiska-слот пишет `_passport_date` из даты регистрации, может выдумать ФИО. Выделить `extractPassportRegData` (только адрес). |
| F10 | MED | docOcr.ts:274-318 + DocScanner:154-162 | `applyVehicleToTemplate` для pts/sts/epts одинаково → «Не найдено» не по делу. Разбить на applyPts/Sts/Epts. |
| F11 | MED | все конвертеры | Нет лимитов размера/страниц → memory DoS (zip-bomb PDF). Кап 100 МБ / 100-200 стр. |
| F12 | MED | SplitPdf.tsx:121 | «Максимум 100 страниц» не enforced (false claim). Либо честно ограничить, либо убрать. |
| F13 | MED | OcrTool.tsx:103 | Нет deskew/бинаризации → плохой OCR на повёрнутых. Препроцессинг. |
| F14 | MED | DocScanner:110-138 / ocr-worker:16-20 | Tesseract ре-инит на каждый вызов → медленно, 60s timeout мало. Один persistent worker. |
| F15 | MED | PdfToImages/OcrTool | Нет AbortController/progress. Добавить отмену + ZIP для многостраничных. |
| F16 | L-M | Merge/Split/SignPdf `ignoreEncryption:true` | Байпас защиты паролем. Явно предупреждать. |
| F17 | L-M | SignPdf.tsx:128 | `getRotation()` прочитан, но не применён → неверное размещение на повёрнутых. |
| F18 | LOW | DocxToPrint.tsx:40-52 | filename в `<title>` не экранирован (self-XSS); `print()` может блокироваться. |
| F19 | LOW | SignPdf.tsx:40-41 | Два `createObjectURL`, один не revoke (утечка). |
| F20 | MED | docOcr.ts:64-70 | FIO может захватить случайную 3-словную строку. Якорить на «ФАМИЛИЯ/ИМЯ/ОТЧЕСТВО» или МЗД. |

**Профессиональный эталон:** DocuSign/Контур-ЭДО (реальная УКЭП + LTV), Adobe Fill & Sign (не перезаписывает заполненное, показывает diff), OCR.space/ABBYY (строгие паттерны серии, МЗД, препроцессинг), Smallpdf/iLovePDF (лимиты размера/страниц, прогресс).

---

## 6. Калькуляторы и юр.логика (проверено по актуальному праву РФ)

**Подтверждённые КРИТИЧЕСКИЕ (исправлять обязательно):**

1. **НДФЛ — детские вычеты не применяются** (`fin.ts:47-58`). `taxable` вычислен, но `return` использует `annualIncome`. Ст.218 НК: налог с `taxable`. Правка: `annualIncome`→`taxable` в строке 57. *Проверено по коду.*
2. **Проценты ст.395 с платежами — теряется хвост периода** (`calc.ts:159-200`). `toStr` не добавлен в `events` → последний сегмент не считается. Правка: `events.push({date:toStr,...})` до сортировки. *Проверено по коду.*
3. **Штрафы ПДД — 50%/20дн вместо 25%/30дн** (`koap.ts`, `PddFines.tsx`). ФЗ-490-ФЗ от 26.12.2024, **в силе с 01.01.2025**: «размер скидки уменьшен с 50% до 25%, льготный период увеличен с 20 до 30 дней» (Гарант, Консультант, garant.ru/news/1780277). Исключения (нетрезвые/повторные/ТО) уже отфильтрованы верно. Правка: `round(rate*0.75)`, `+30 дней`, обновить UI-текст.
4. **УСН/НДС — пороги 60М/250М вместо 20М/272,5М (2026)** (`fin.ts:81`). Согласно ФЗ-425 + разъяснениям ФНС (nalog.gov.ru, 15.12.2025): автоматическое освобождение от НДС утрачивается при доходе **>20 млн** (2026); спец.ставки НДС **5%** при 20–272,5 млн, **7%** при 272,5–490,5 млн; **утрата самой УСН** — при >**490,5 млн** (450×1,09). Код моделирует VAT-применимость с неверными порогами. Правка: триггер 20 млн, границы 272,5/490,5. *Уточнение к отчёту агента: «20 млн» — это порог утраты освобождения от НДС (ст.145 НК), а не утраты УСН (490,5 млн); направление исправления верное.*

**Подтверждённые ВЫСОКИЕ:**

5. **Апелляционная госпошлина завышена в 2 раза** (`calc.ts:334-335` возвращает 3000/15000). пп.9 п.1 ст.333.19 НК: апелляционная/кассационная жалоба = **50% от неимущественной** (неимущественная = 3000/20000 → 1500/10000). *Нюанс: пп.19 той же статьи = 3000/15000 относится к «кассационной жалобе на судебный приказ» (спецслучай) — уточнить, какой именно вид моделирует компонент `CourtFee.tsx`.* Рекомендуется сверить с действующей редакцией и поправить до 1500/10000 для общего случая.
6. **Задержка з/п ст.236 — +1 день** (`calc.ts:207-247`, `+1` на последней границе). При подаче `fromStr`=дата выплаты задержка считается со дня, следующего за ней → +1 лишний. Убрать `+1` (или считать `dueDate+1..payDate` без `+1`). *Зависит от того, что передаёт UI — проверить вызов.*
7. **Пени ЖКХ — текущая ставка на весь период** (`calc.ts:253-264`). ч.14 ст.155 ЖК РФ: пени по ключевой ставке, **действовавшей в период просрочки** (меняется). Код берёт `rateOn(today())`. Функция принимает `days`, а не диапазон дат — ограничение сигнатуры. Правка: перебор по дням через `rateOn(date)` или принимать date-range.

**Свежесть данных (риск неточности):** `autoDuty.ts:FX_RATES` захардкожены (USD 82.99/EUR 95.78…) → таможенные расчёты «плывут»; `calc.ts:KEY_RATES` точна (14% на 24.07.2026) но зашита; `fin.ts:TRANSPORT_REGIONS` — региональные ставки меняются ежегодно (сверить с законами субъектов); `DayCounter.tsx:HOLIDAYS` — нет переносов выходных (есть дисклеймер).

**Проверено КОРРЕКТНО (не трогать):** сумма прописью (род/падеж/склонение), валидаторы (СНИЛС/ОГРН/ИНН/БИК/Luhn), НПД, НДС 22%, КоАП 12.8/12.26=45к, имущественная/неимущественная госпошлина (кроме апелляции), алименты (1/4,1/3,1/2 и 0,5%/день), отпускные `avg/29.3*days`, федеральные ставки трансп.налога, прогрессивные НДФЛ-брэкеты, МРОТ 27 093.

**Тестовые пробелы:** ни один тест не покрывает вычеты НДФЛ, хвост ст.395, скидки ПДД, пороги УСН, апелляц.пошлину. Добавить «золотые» юр.кейсы из НК/КоАП.

---

## 7. SEO / Perf / Инфра / Аналитика / A11y (детально)

**SEO:** 1.1 middleware Supabase на публичных страницах (HIGH, см. Критич.15); 1.2 `dateModified` — рус.строка вместо ISO в JSON-LD (`documents/[slug]:96`); 1.3 Sitelinks SearchAction `search=` vs `q=` (`layout.tsx:80` ↔ `templates/page.tsx:84`); 1.4 дублирующий FAQ JSON-LD на 367 страницах; 1.5 каннибализация `/dkp` ↔ `/documents/dkp-auto`; 1.6 нет canonical на home/blog; 1.7 robots.txt не Disallow `/admin /debug /approve /auth`; 1.8 `/not-found` — индексируемый 200; 1.9 `truncateWord(desc,155)` vs AGENTS.md(200) — лучше привести AGENTS к 155; 1.10 проверить blog `datePublished/Modified` на ISO.
**Что хорошо SEO:** SSG `documents/[slug]` + `dynamicParams=false`; title-паттерн с `{YEAR}`; `robots index/follow + googleBot`; Breadcrumb+FAQ+WebPage JSON-LD; sitemap 16+367+blog с lastmod; IndexNow; www→apex 301; OG 1200×630.

**Perf:** 2.1 middleware (HIGH); 2.2 Google `@import` + TTF вместо `next/font` WOFF2 (`globals.css:5-90`); 2.3 `images.unoptimized:true`; 2.4 home — client component (конвертировать в RSC+остров). **Хорошо:** чанки тяжёлых либ (`next.config.js:19-61`), `lucide` отдельно, `dynamic()`.

**Инфра:** 3.1 слабый CSP (`unsafe-inline`+`unsafe-eval`, `next.config.js:87`) — nonce, убрать eval; 3.2 дублирующий HSTS, добавить `frame-ancestors 'self'`; 3.3 секреты не `NEXT_PUBLIC` — ОК; 3.4 запустить `npm audit`, выровнять `@next/bundle-analyzer` до 15.x.

**Аналитика:** 4.1 Metrika до согласия (HIGH/LEGAL, см. Критич.14); 4.2 возможен double pageview (`YandexMetrika.tsx:11` + `YandexMetrikaPageView:29`); 4.3 `location.pathname` → `usePathname()`. **Хорошо:** `webvisor:false`, bot-фильтр, PII вне Metrika.

**A11y:** 5.1 нет skip-link/`id="main"` (`AppLayout.tsx:329`); 5.2 нарушение порядка заголовков на home (`page.tsx:71` h4 до h2); 5.3 axe только 5 страниц, без `best-practice` — расширить + CI; 5.4 контраст `brand-400` (~2.6:1). **Хорошо:** `lang="ru"`, `:focus-visible`, aria у баннера/навигации.

---

## 8. Чек-лист верификации (что подтверждено, что требует человеческой юр.подписи)

- ✅ **Подтверждено по коду:** НДФЛ-вычеты (fin.ts:57), ст.395 хвост (calc.ts:159), XSS `{{{}}}` (renderDocument:193), mass-assignment (documents/[id]), JPG-подпись (SignPdf:130), OCR-CDN (ocr-worker:7), justify (exportPdf:474), монолит builder (page.tsx), Metrika до согласия, middleware Supabase.
- ✅ **Подтверждено по закону (web):** ПДД-скидка 25%/30дн (ФЗ-490), УСН/НДС 20М/272,5М/490,5М (ФНС ФЗ-425), апелляц.пошлина 50% (ст.333.19 пп.9).
- ⚠️ **Требует юр.подписи живого эксперта:** таможенные пошлины/акцизы/утилизационный сбор (`autoDuty.ts`) — сверка с ТК ЕАЭС/ПП №1291; региональные ставки трансп.налога 2025/2026 (`TRANSPORT_REGIONS`); предельные взносы ИП; точная редакция пп.19/пп.9 ст.333.19 для типа жалобы в `CourtFee.tsx`; пересмотр «неимущественной» госпошлины (3000/20000) на предмет актуальности 2026.
- ⚠️ **Требует проверки на проде:** наличие `UPSTASH_REDIS_*` (rate-limit), service-role key не в бандле, RLS-политики `profiles/leads/feedback/payments/subscriptions/documents/contractors/persons` (F3/F7/F16 зависят от них), работа OCR-сканера в Safari.

---

## 9. Дорожная карта приоритетов

**P0 (блокирует доверие/безопасность — до следующего релиза):**
- Юр.расчёты: НДФЛ, ст.395, ПДД, УСН/НДС, апелляц.пошлина, ст.236, ЖКХ-пени (раздел 6).
- Безопасность: XSS `{{{}}}`+DOMPurify, fail-closed rate-limit, admin через JWT, webhook IP/subnet+verify, mass-assignment whitelist, open-redirect, email-бомбинг (раздел 2).
- Конвертеры: переименовать «подпись»→факсимиле+дисклеймер, починить JPG, локальный OCR, ложные срабатывания паспорта/ПТС, не перезаписывать поля (раздел 5).
- Юр.этика: «100% бесплатно» vs PRO-гейт (честность оффера).

**P1 (качество/UX/perf — следующий спринт):**
- Builder: доступные модалки (focus-trap), тач-экспорт, переключение вкладки при блоке, мемоизация/useCallback, единый `ui/*` дизайн-системы, persist `selectedTemplateId`, удалить мёртвые layout-компоненты.
- Движок: justify, PDF↔DOCX parity (align/doc-price/columns), унификация склонений, `_words` только для денег.
- SEO/Perf: Metrika после согласия, убрать Supabase из middleware публичных, ISO `dateModified`, `next/font`, nonce-CSP, canonical/home/blog, Sitelinks `q=`.

**P2 (полировка/данные):**
- Свежесть: FX_RATES, KEY_RATES автообновление, региональные ставки, производственный календарь.
- A11y: skip-link, порядок заголовков, расширить axe + CI.
- Тесты: золотые юр.кейсы, тесты на justify/parity/XSS/кросс-реализацию.
- OCR-препроцессинг, персистентный worker, лимиты размера/страниц конвертеров.

---

*Полные отчёты по доменам (с цитатами кода) также сохранены агентами: `AUDIT_REPORT.md` (калькуляторы) в корне проекта. Настоящий мастер-файл — консолидированная выжимка всех 6 параллельных аудитов + ручная сверка по закону.*
