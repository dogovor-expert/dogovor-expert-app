# ДОСЬЕ: Мировые эталоны сканеров документов — база для апгрейда DocScanner
*Собрано 31.08.2026. Источники: GitHub (tesseract.js, jscanify, scanic, scribeocr, mrz-scanner, web-mrz-reader, ocr-text-extract-lib, turbo-barnacle, textlift, document-autocapture), OpenCV.org, Scanbot SDK docs, PaddleOCR docs, DEV.to (MRZ), Tesseract ImproveQuality.*

---

## 1. Технологический ландшафт

### OCR-движки (браузер, локально, без сервера)
| Движок | Суть | Размер | Точность | Вердикт для нас |
|---|---|---|---|---|
| **Tesseract.js v7** (текущий) | Tesseract 5 WASM, LSTM, 100+ языков | ядро ~3 МБ + rus.traineddata 8.4 МБ | средняя для фото, высокая для чистых сканов | Оставить как основу v1 |
| **PaddleOCR.js (PP-OCRv5)** | DBNet-детекция строк + CRNN/CTNN, ONNX Runtime Web (WASM/WebGPU), официальный SDK `@paddleocr/paddleocr-js` + альтернативы `@ocr-web/core`, `ffocr` | mobile-вариант ~10-20 МБ | **заметно выше на фото/сложных фонах**, встроенная детекция строк с боксами и confidence | Главный кандидат на v2 (fallback-движок) |
| **Scribe.js** (ScribeOCR) | улучшенный Tesseract-модель, PDF, proofreading | тяжёлый | высокая | Не сейчас (AGPL-совместимость проверить) |

### Детекция границ документа / выравнивание
| Библиотека | Звёзды | Вес | Скорость warp | Вердикт |
|---|---|---|---|---|
| **Scanic** (Rust WASM + GPU canvas) | 39 (новая) | **~100 КБ gz** | ~10 мс | Лучший выбор: крошечная, быстрая, TS, MIT |
| jscanify (OpenCV.js) | 1754 | ~31 МБ (!) | ~200 мс | Точный, но OpenCV слишком тяжёл |
| document-autocapture | — | лёгкий | ML-first + CV fallback | Идея: авто-захват с quality-gates |
| OpenCV.js напрямую | — | ~30 МБ | 5 мс | Не тянуть целиком |

### MRZ паспорта (killer-фича для РФ-паспортов — только в загранпаспортах; у РФ-внутренних MRZ нет, поэтому критично только для загран)
| Библиотека | Подход | Что даёт |
|---|---|---|
| **mrz** (cheminfo, npm `mrz`) | парсер TD1/TD2/TD3 + autocorrect O↔0, I↔1 | готовый парсер + check digits |
| **web-mrz-reader** | кастомная Tesseract-модель под OCR-B + check digits | паттерн обучения кастомной модели |
| **alsenet-labs/mrz-scanner** | CNN 300КБ (ONNX) 37 классов + морфологическая детекция зоны MRZ + исправление ошибок по чек-суммам | архитектура: detect→OCR→parse с error-correction |

### Ключевые приёмы коммерческих SDK (Scanbot — эталон UX)
- **Quality gates перед OCR**: яркость (brightness threshold), блюр/резкость, блики, углы наклона (angle score), размер документа в кадре (size score), aspect ratio.
- **Статусы наведения камеры**: OK / TOO_SMALL / BAD_ANGLES / TOO_DARK / TOO_NOISY / ORIENTATION_MISMATCH — пользователь понимает, что исправить.
- **Auto-capture**: автоматический снимок, когда кадр хороший (sensitivity 0.66).
- **Document Quality Analyzer**: оценка качества результата «very poor → excellent», при низком качестве просит переснять.
- **DocumentEnhancer**: распрямление мяты/загибов.

---

## 2. Канонический пайплайн лучшего сканера (синтез всех источников)

```
Фото/PDF
  │
  ├─ 1. DECODE: createImageBitmap, даунскейл если > ~3200px по длинной стороне
  │
  ├─ 2. DETECT: границы документа (Scanic ~100KB WASM; Canny 75/200 + контуры + minArea)
  │       └─ Режимы: авто-обрезка (extract) или «документ не найден» → идём дальше целиком
  │
  ├─ 3. WARP: перспективная коррекция (гомография) — выравниваем документ в прямоугольник
  │
  ├─ 4. DESKEW: автоповорот по линиям текста (tesseract.js v4+ умеет rotate: auto)
  │
  ├─ 5. QUALITY GATES (до OCR, дёшево):
  │       brightness (средняя luminance), blur (variance of Laplacian),
  │       glare (доля пересветов), contrast
  │       └─ FAIL → сразу внятный совет пользователю («слишком темно», «не в фокусе»)
  │
  ├─ 6. PREPROCESS (в worker, canvas/OffscreenCanvas):
  │       grayscale → contrast stretch → adaptive threshold (Sauvola/Otsu) →
  │       → upscale коротких сторон (минимум ~300 DPI на текст: текст высотой ≥ 30px)
  │       ВАЖНО: тоже самое фото бинаризованное даёт +20 пунктов confidence
  │
  ├─ 7. OCR (worker, persistent):
  │       Tesseract.js: user_defined_dpi=300, preserve_interword_spaces=1,
  │       выход: text + confidence + words/blocks с боксами
  │       (v2: PaddleOCR PP-OCRv5 как второй движок → берём результат с большей confidence)
  │
  ├─ 8. POST-PROCESS (умный парсинг):
  │       • multi-pass: сырой текст и бинаризованный → выбираем лучший по confidence
  │       • char-confusion нормализация (O↔0, I↔1, S↔5, B↔8, З↔3, Ч↔4 в цифровых полях)
  │       • контекстные валидаторы: дата — валидная дата, серия 4 цифры, номер 6 цифр,
  │         VIN 17 (без I,O,Q), ИНН 10/12 с контрольной суммой, ВУ xx xx nnnnnn
  │       • чек-суммы где есть (MRZ, ИНН)
  │
  ├─ 9. FILL: маппинг в поля формы + подсветка заполненного + скролл (уже есть)
  │
  └─ 10. REVIEW: карточка «что распознано» с confidence по каждому полю,
          кликабельные боксы на фото (words из tesseract), быстрое исправление
```

---

## 3. Что уже есть у нас (не трогать — совпадает с эталоном)
- ✅ OCR в worker, persistent worker (переиспользование) — как у textlift
- ✅ Локальные ассеты (worker/core/tessdata) same-origin, без CDN — как у textlift (лучший приватный паттерн)
- ✅ user_defined_dpi=300, preserve_interword_spaces=1 — поставлено мной ранее
- ✅ Прогресс по стадиям, «Данные не покидают браузер», drag&drop
- ✅ Парсинг РФ-паспорта/ПТС/СТС/ВУ с нормализацией латиница→кириллица
- ✅ Подсветка заполненных полей + автоскролл

## 4. Разрывы с эталоном (приоритизировано)

### P0 — точность (самое ценное)
1. **Preprocessing pipeline** (grayscale → contrast → adaptive threshold → upscale): фото с телефона сейчас идут в OCR почти сырыми (компресс до 900px JPEG 0.72 — **плохо**: 900px мало для A4-документа, текст теряет разрешение. У эталонов: длинная сторона 2000-3200px). Пересмотреть compressImage: MIN длинная сторона 2000px, JPEG quality 0.85, и в OCR отправлять отдельную预处理-версию (для превью можно сжатую).
2. **Quality gates**: оценить яркость/блюр/блики ДО OCR → конкретные советы вместо общего «Попробуйте другое фото».
3. **Multi-pass OCR + выбор лучшего результата по confidence** (приём ocr-text-extract-lib): оригинал vs бинаризованный.
4. **Char-confusion в постобработке**: контекстные замены только в числовых полях (серия/номер/даты) — резко уменьшит «0» вместо «О» и наоборот.
5. **Контекстные валидаторы** полей (даты/длины/чек-суммы ИНН): битое поле помечать, а не молча вставлять.

### P1 — UX
6. **Кликабельный превью с боксами слов** (words + bbox из tesseract): пользователь видит, что именно распознано, тапает слово → правит поле (как ScribeOCR proofreading).
7. **Компактный режим просмотрщика**: сейчас фото 56px-миниатюры; добавить тап → полноразмерный просмотр с зумом.
8. **Персистентная инициализация**: прогреть worker сразу при открытии сканера (модель качается в фоне), а не при первой загрузке фото — экономит 5-15 сек первого скана.
9. **Quality-плашки**: «Слишком темно», «Блики», «Не в фокусе» — вместо универсального совета.

### P2 — killer-фичи
10. **Scanic (~100KB)** для автообрезки + перспективы: документ заполняет кадр → резко лучше качество распознавания.
11. **PaddleOCR PP-OCRv5 как второй движок** (наиболее сильная апгрейда точности на реальных фото; mobile-вариант, модели с jsDelivr/self-host). Стратегия: Tesseract дешёвый дефолт, Paddle — авто-фолбэк при низком confidence (<60).
12. **MRZ для загранпаспортов**: npm `mrz` + зона MRZ (последние 2 строки) — check digits дают 100% точность полей.
13. **VIN/ГРЗ whitelist-режим**: для слотов ПТС/СТС повторный проход только по найденной строке VIN с `tessedit_char_whitelist=ABCDEFGHJKLMNPRSTUVWXYZ0123456789`.

## 5. Ссылки-эталоны (сохранить)
- tesseract.js docs (API, setParameters, rects): https://github.com/naptha/tesseract.js/blob/HEAD/docs/api.md
- Tesseract ImproveQuality (бинаризация, PSM, DPI): https://tesseract-ocr.github.io/tessdoc/ImproveQuality.html
- Scanic: https://github.com/marquaye/scanic
- jscanify: https://github.com/puffinsoft/jscanify
- ocr-text-extract-lib (multi-pass, clean mode): https://github.com/Elango-P/ocr-text-extract-lib
- turbo-barnacle (полный preprocess-набор): https://github.com/adamstavely/turbo-barnacle
- textlift (self-host OCR архитектура): https://github.com/ben-gy/textlift
- mrz-scanner (CNN + error correction): https://github.com/alsenet-labs/mrz-scanner
- web-mrz-reader (кастомная модель MRZ): https://github.com/eringen/web-mrz-reader
- npm mrz (парсер + autocorrect): https://github.com/cheminfo-js/mrz
- PaddleOCR.js (официальный браузерный SDK): https://www.paddleocr.ai/latest/en/version3.x/inference_deployment/cross_platform/browser.html
- @ocr-web/core (PP-OCRv5 onnx, worker): https://github.com/bent2685/ocr-web
- Scanbot UX-статусы (эталон подсказок): https://docs.scanbot.io/web/document-scanner-sdk/custom-ui/how-to-get-started/
- OpenCV.js live-OCR pipeline (детекция→warp→threshold→OCR): https://opencv.org/smart-document-scanning-with-live-ocr-using-opencv-js/
- ScribeOCR (proofreading UX): https://github.com/scribeocr/scribeocr
