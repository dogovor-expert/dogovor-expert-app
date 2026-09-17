"use client";
import Link from "next/link";
import { useRef, useState, useMemo, useEffect } from "react";
import {
  Camera,
  Check,
  ChevronDown,
  Loader2,
  RotateCcw,
  X,
  AlertTriangle,
  ScanLine,
  BadgeCheck,
  ShieldCheck,
  Image as ImageIcon,
  Moon,
  Sun,
  Zap,
} from "lucide-react";
import type { LegalTemplate } from "@/data/types";
import {
  getDocRequirements,
  type DocSlot,
} from "@/lib/docRequirements";
import {
  extractPassportData,
  extractVehicleData,
  applyPassportToRole,
  applyVehicleToTemplate,
  applyVucToRole,
  expectedFields,
} from "@/lib/docOcr";
import { track, goals } from "@/lib/analytics";
import { planFromScan } from "@/lib/docPlanner";
import { prepareDocumentImage, type ImageQuality } from "@/lib/docImage";
import { paddleRecognize, paddleWarmup } from "@/lib/paddleOcr";
import { tryParseMrz, applyMrzToRole, mrzManualHints, type MrzParseSuccess } from "@/lib/docMrz";
import {
  fetchOcularStatus,
  postOcrRequest,
  shouldUseServerOcr,
  OCR_CONSENT_STORAGE_KEY,
  type OcularStatus,
} from "@/lib/ocrStatus";

/** Порог уверенности Tesseract, ниже которого включается PaddleOCR. */
const PADDLE_FALLBACK_THRESHOLD = 60;

/**
 * Минимальная длина распознанного текста, при которой Tesseract считается
 * «уверенным» независимо от confidence. Если Tesseract вернул одно-два слова
 * с высоким confidence, но без маркеров («рождения:», «выдан», «дата») — это
 * почти всегда фрагмент после агрессивного кропа Scanic, а не валидный
 * разворот паспорта. PaddleOCR пересканирует весь кадр целиком и ловит
 * остальной текст, который Tesseract «не увидел».
 *
 * Эмпирика: реальный паспорт РФ (разворот) даёт ~150–400 символов. 80 — это
 * уверенный запас для СТС/ПТС, но отсекает случаи «одно слово 96% conf».
 */
const PADDLE_FALLBACK_MIN_TEXT_LENGTH = 80;

interface DocScannerProps {
  template: LegalTemplate;
  photos: Record<string, string[]>;
  onPhotosChange: (slotId: string, photos: string[]) => void;
  onFieldChange: (fieldId: string, value: string) => void;
}

interface OcrWord {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

interface ScanResult {
  ok: boolean;
  filled: number;
  missing: { id: string; label: string }[];
  filledFields: { id: string; label: string; value: string }[];
  error?: boolean;
  errorText?: string;
  confidence?: number;
  words?: OcrWord[];
  ocrWidth?: number;
  ocrHeight?: number;
  quality?: ImageQuality;
  manualHints?: string[];
  slotId: string;
}

/** Стадии tesseract.js → понятные подписи для пользователя. */
const STAGE_LABELS: Record<string, string> = {
  "loading tesseract core": "Загружаем движок распознавания…",
  "initializing tesseract": "Запускаем движок…",
  "loading language traineddata":
    "Первый запуск: загружаем русскую модель (~8 МБ)…",
  "initializing api": "Готовим распознавание…",
  "recognizing text": "Распознаём текст…",
};

/** Подсказки по качеству кадра (quality gates — эталон Scanbot). */
function qualityWarnings(
  q: ImageQuality
): { icon: "dark" | "blur" | "glare"; text: string }[] {
  const out: { icon: "dark" | "blur" | "glare"; text: string }[] = [];
  if (q.dark) out.push({ icon: "dark", text: "Кадр темноват — снимите при лучшем освещении" });
  if (q.blurry) out.push({ icon: "blur", text: "Кадр смазан — держите камеру неподвижно" });
  if (q.glare) out.push({ icon: "glare", text: "В кадре блики — измените угол съёмки" });
  return out;
}

export default function DocScanner({
  template,
  photos,
  onPhotosChange,
  onFieldChange,
}: DocScannerProps) {
  const slots = useMemo(() => {
    const base = getDocRequirements(template);
    if (base.length > 0) return base;
    // Для шаблонов без распознаваемых документов всё равно даём слот
    // «любой документ сделки», чтобы сканер был доступен везде.
    return [
      {
        id: "doc_generic",
        label: "Документ сделки / приложение",
        hint: "Сфотографируйте любой бумажный документ или приложение к сделке",
        maxPhotos: 4,
        ocrKind: null,
        optional: true,
      },
    ];
  }, [template]);
  const [scanningSlot, setScanningSlot] = useState<string | null>(null);
  const [progress, setProgress] = useState<
    Record<string, { status: string; progress: number } | null>
  >({});
  const [results, setResults] = useState<Record<string, ScanResult | null>>({});
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});
  const [collapsed, setCollapsed] = useState(false);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ slotId: string; index: number } | null>(null);
  const [ocularStatus, setOcularStatus] = useState<OcularStatus | null>(null);
  // TICKET-1: явный opt-in на серверный OCR (152-ФЗ ст. 9). По умолчанию —
  // выключен: без согласия работает только клиентский Tesseract/Paddle.
  const [ocrConsent, setOcrConsent] = useState(false);
  const fileInputsRef = useRef<Record<string, HTMLInputElement | null>>({});
  const lastFilesRef = useRef<Record<string, File | null>>({});

  const loadedCount = slots.filter(
    (s) => (photos[s.id] || []).length > 0
  ).length;

  // Прогрев: начинаем грузить wasm-ядро и модель сразу при открытии
  // сканера, чтобы первый скан не ждал 5-15 секунд.
  const warmedRef = useRef(false);
  useEffect(() => {
    if (collapsed || warmedRef.current) return;
    warmedRef.current = true;
    try {
      const w = new Worker(
        new URL("../../lib/workers/ocr-worker.js", import.meta.url),
        { type: "module" }
      );
      w.postMessage({ type: "warmup" });
      w.onmessage = (e: MessageEvent) => {
        if (e.data?.type === "ready-warm" || e.data?.type === "error") {
          w.terminate();
        }
      };
      // Резервный движок грузим в фоне тихо — он нужен только при
      // низком confidence основного.
      void paddleWarmup();
    } catch {
      // Прогрев опционален — при скане модель загрузится штатно.
    }
  }, [collapsed]);

  // Проверка доступности occular-сервера (для UI-индикатора). Делаем
  // один раз после монтирования — на 8-10 секундный кеш сервера.
  useEffect(() => {
    const ctrl = new AbortController();
    const id = window.setTimeout(() => {
      void fetchOcularStatus(ctrl.signal).then(setOcularStatus);
    }, 2000);
    return () => {
      ctrl.abort();
      window.clearTimeout(id);
    };
  }, []);

  // TICKET-1: восстановление согласия — локальный ключ сразу, сервер (для
  // синхронизации между устройствами) как источник истины, если доступен.
  useEffect(() => {
    try {
      if (localStorage.getItem(OCR_CONSENT_STORAGE_KEY) === "1") {
        setOcrConsent(true);
      }
    } catch {
      // localStorage недоступен (приватный режим) — остаёмся «без согласия».
    }
    const ctrl = new AbortController();
    void fetch("/api/ocr-consent", { cache: "no-store", signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { consented?: unknown } | null) => {
        if (d && typeof d.consented === "boolean") {
          setOcrConsent(d.consented);
          try {
            if (d.consented) localStorage.setItem(OCR_CONSENT_STORAGE_KEY, "1");
            else localStorage.removeItem(OCR_CONSENT_STORAGE_KEY);
          } catch {
            /* noop */
          }
        }
      })
      .catch(() => {
        // Сервер недоступен — решение по localStorage.
      });
    return () => ctrl.abort();
  }, []);

  const setServerOcrConsent = (granted: boolean) => {
    setOcrConsent(granted);
    try {
      if (granted) localStorage.setItem(OCR_CONSENT_STORAGE_KEY, "1");
      else localStorage.removeItem(OCR_CONSENT_STORAGE_KEY);
    } catch {
      /* noop */
    }
    // Фиксация в БД (доказательная база согласия). Ошибка сети не откатывает
    // локальный выбор: серверный OCR при отсутствии ocr_consent_at в БД
    // вернёт 403 и сканер бесшовно упадёт на клиентский движок.
    void fetch("/api/ocr-consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ granted }),
    }).catch(() => {
      /* noop */
    });
  };

  /** Скроллит форму к первому заполненному полю и подсвечивает все. */
  const focusFilledFields = (ids: string[]) => {
    if (ids.length === 0) return;
    window.setTimeout(() => {
      const first = document.querySelector<HTMLElement>(
        `[data-field="${CSS.escape(ids[0])}"]`
      );
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(() => {
        for (const id of ids) {
          const el = document.querySelector<HTMLElement>(
            `[data-field="${CSS.escape(id)}"]`
          );
          if (!el) continue;
          el.classList.add("ocr-field-flash");
          window.setTimeout(
            () => el.classList.remove("ocr-field-flash"),
            3000
          );
        }
      }, 450);
    }, 250);
  };

  const runOcr = (
    slot: DocSlot,
    raw: string,
    binary: string,
    params?: Record<string, string>
  ): Promise<{ text: string; confidence: number; words: OcrWord[] }> => {
    // Используем Web Worker — tesseract.js не попадает в основной бандл.
    // Относительный путь обязателен: webpack корректно собирает worker-чанк
    // только для статически разрешимого (не алиасного) URL.
    const worker = new Worker(
      new URL("../../lib/workers/ocr-worker.js", import.meta.url),
      { type: "module" }
    );

    // 4 минуты: multi-pass (2 прохода) + первый запуск качает модель (~11 МБ).
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        worker.terminate();
        reject(new Error("Превышено время ожидания распознавания"));
      }, 240000);

      worker.onmessage = (e: MessageEvent) => {
        const msg = e.data;
        if (msg.type === "result") {
          clearTimeout(timeout);
          worker.terminate();
          resolve({
            text: msg.text,
            confidence: msg.confidence ?? 0,
            words: (msg.words ?? []) as OcrWord[],
          });
        } else if (msg.type === "error") {
          clearTimeout(timeout);
          worker.terminate();
          reject(new Error(msg.message || "Ошибка распознавания"));
        } else if (msg.type === "progress") {
          setProgress((p) => ({
            ...p,
            [slot.id]: { status: msg.status, progress: msg.progress },
          }));
        }
      };

      worker.onerror = (err) => {
        clearTimeout(timeout);
        worker.terminate();
        reject(
          new Error(
            err.message?.includes("NetworkError") ||
              err.message?.includes("Importing")
              ? "Не удалось загрузить модуль распознавания"
              : `Ошибка воркера: ${err.message}`
          )
        );
      };

      worker.postMessage({
        type: "recognize",
        file: raw,
        binary,
        wantWords: true,
        params: params ?? {},
        vinRetry:
          slot.ocrKind === "pts" || slot.ocrKind === "sts" || slot.ocrKind === "epts",
      });
    });
  };

  const applyOcr = (
    slot: DocSlot,
    text: string
  ): Omit<
    ScanResult,
    "confidence" | "words" | "quality" | "ocrWidth" | "ocrHeight"
  > => {
    const values: Record<string, string> = {};
    const manualHints: string[] = [];
    let mrz: MrzParseSuccess | null = null;
    switch (slot.ocrKind) {
      case "passport":
      case "passportReg": {
        // 1) Пробуем MRZ (загранпаспорта): чек-суммы дают 100% точность
        //    номера и дат — приоритет над регэкспами по сыром тексту.
        mrz = tryParseMrz(text);
        if (mrz && slot.rolePrefix) {
          Object.assign(values, applyMrzToRole(template, slot.rolePrefix, mrz));
          manualHints.push(...mrzManualHints(template, slot.rolePrefix));
        }
        // 2) Регулярный парсинг РФ-паспорта (у него MRZ нет).
        const data = extractPassportData(text);
        if (slot.rolePrefix) {
          Object.assign(
            values,
            applyPassportToRole(template, slot.rolePrefix, data)
          );
        }
        break;
      }
      case "pts":
      case "sts":
      case "epts": {
        Object.assign(
          values,
          applyVehicleToTemplate(template, extractVehicleData(text))
        );
        break;
      }
      case "vuc": {
        if (slot.rolePrefix) {
          Object.assign(
            values,
            applyVucToRole(template, slot.rolePrefix, text)
          );
        }
        break;
      }
      default: {
        // Фаза 5: универсальный планировщик для слотов ИП/юрлиц и любых
        // расширенных профилей (ИНН, ОГРН, СНИЛС, ВУ-новое, ОСАГО, ЕГРН,
        // свидетельство о браке, доверенность и т.п.). Раньше эти слоты
        // просто возвращали ok:false и не заполняли поля.
        const plan = planFromScan(template, text);
        if (plan.values.length > 0) {
          for (const v of plan.values) values[v.fieldId] = v.value;
        } else {
          return {
            ok: false,
            filled: 0,
            missing: [],
            filledFields: [],
            slotId: slot.id,
          };
        }
        break;
      }
    }

    const fieldLabel = (id: string) =>
      template.fields.find((f) => f.id === id)?.label ?? id;

    const entries = Object.entries(values).filter(
      ([, v]) => v && String(v).trim()
    );
    for (const [fieldId, value] of entries) onFieldChange(fieldId, value);

    const expected = expectedFields(template, slot);
    const missing = expected.filter(
      (e) => !values[e.id] || !String(values[e.id]).trim()
    );
    const filledFields = entries.map(([id, value]) => ({
      id,
      label: fieldLabel(id),
      value,
    }));

    return {
      ok: entries.length > 0,
      filled: entries.length,
      missing,
      filledFields,
      manualHints: manualHints.length > 0 ? manualHints : undefined,
      slotId: slot.id,
    };
  };

  const handleFile = async (slot: DocSlot, file: File) => {
    const MAX_FILE_SIZE_MB = 15;
    lastFilesRef.current[slot.id] = file;
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setResults((r) => ({
        ...r,
        [slot.id]: {
          ok: false,
          filled: 0,
          missing: [],
          filledFields: [],
          error: true,
          errorText: `Файл больше ${MAX_FILE_SIZE_MB} МБ — уменьшите фото и попробуйте снова`,
          slotId: slot.id,
        },
      }));
      return;
    }
    setScanningSlot(slot.id);
    setResults((r) => ({ ...r, [slot.id]: null }));
    setProgress((p) => ({
      ...p,
      [slot.id]: { status: "loading tesseract core", progress: 0 },
    }));
    try {
      // 1) Подготовка: превью + OCR-версии (2000px, grayscale+contrast,
      //    adaptive threshold) + оценка качества кадра.
      const prepared = await prepareDocumentImage(file);
      const existing = photos[slot.id] || [];
      const next =
        existing.length >= slot.maxPhotos
          ? [...existing.slice(1), prepared.preview]
          : [...existing, prepared.preview];
      onPhotosChange(slot.id, next);

      if (slot.ocrKind) {
        // 2) Multi-pass OCR: raw + binary, выбор по confidence.
        // PSM 6 (несколько блоков) — оптимально для документов с мелким шрифтом
        // (СТС/ПТС/ЭПТС). Остальные типы — PSM 3 (AUTO) по умолчанию.
        const isVehicle =
          slot.ocrKind === "pts" || slot.ocrKind === "sts" || slot.ocrKind === "epts";
        const tesseractParams = isVehicle
          ? { tessedit_pageseg_mode: "6" }
          : undefined;
        let ocr = await runOcr(slot, prepared.ocrRaw, prepared.ocrBinary, tesseractParams);

        // 2a) Серверный occular-OCR (домашний/VDS) — точный распознаватель
        //     для русских документов. Используется, только если сервер доступен
        //     И пользователь явно включил точный режим (TICKET-1, 152-ФЗ).
        //     Любая ошибка (offline, таймаут, 403 без согласия в БД) — бесшовный
        //     fallback на локальный движок, без уведомления пользователя.
        if (shouldUseServerOcr(ocularStatus, ocrConsent)) {
          try {
            setProgress((p) => ({
              ...p,
              [slot.id]: { status: "Точный серверный OCR…", progress: 0.05 },
            }));
            const ocularBlob = await (await fetch(prepared.ocrRaw)).blob();
            const ocularResult = await postOcrRequest(
              ocularBlob,
              `${slot.id}-${Date.now()}.jpg`
            );
            if (
              ocularResult.source === "server" &&
              ocularResult.lines.length > 0
            ) {
              const avgConf =
                ocularResult.lines.reduce(
                  (s, l) => s + (Number.isFinite(l.confidence) ? l.confidence : 0),
                  0
                ) / ocularResult.lines.length;
              const ocularText = ocularResult.lines
                .map((l) => l.text)
                .join("\n");
              if (
                ocularText.trim().length >= 20 &&
                avgConf >= 0.7 &&
                avgConf > ocr.confidence / 100
              ) {
                // Серверный OCR лучше — берём его текст, боксы оставляем
                // от Tesseract (приблизительная подсветка сохранится).
                ocr = {
                  text: ocularText,
                  confidence: Math.round(avgConf * 100),
                  words: ocr.words,
                };
              }
            }
          } catch {
            // Серверный OCR недоступен — остаётся результат Tesseract/PP-OCRv5.
          }
        }

        // 3) Fallback: пробуем PP-OCRv5 (точнее на реальных фото), если
        //    Tesseract либо не уверен, либо вернул слишком короткий текст
        //    (типичный артефакт агрессивного кропа Scanic — Tesseract
        //    «видит» одно слово с conf 96%, а форму заполнить нечем).
        //    Берём движок с большим confidence.
        //    LAZY: если и Tesseract, и (возможно) серверный occular дали
        //    уверенный+длинный результат — Paddle даже не скачивается/не
        //    запускается (экономия ~2 сек на хорошо распознанных сканах).
        const alreadyGood =
          ocr.confidence >= 85 &&
          ocr.text.trim().length >= PADDLE_FALLBACK_MIN_TEXT_LENGTH * 1.25;
        if (
          !alreadyGood &&
          (ocr.confidence < PADDLE_FALLBACK_THRESHOLD ||
            ocr.text.trim().length < PADDLE_FALLBACK_MIN_TEXT_LENGTH)
        ) {
          try {
            const paddle = await paddleRecognize(prepared.ocrRaw);
            if (paddle.confidence > ocr.confidence) {
              ocr = {
                text: paddle.text,
                confidence: paddle.confidence,
                words: ocr.words, // боксы остаются от tesseract (приблизительная подсветка)
              };
            }
          } catch {
            // Paddle недоступен (сеть/CDN) — остаётся результат Tesseract.
          }
        }

        const res = applyOcr(slot, ocr.text);
        const full: ScanResult = {
          ...res,
          confidence: Math.round(ocr.confidence),
          words: ocr.words,
          ocrWidth: prepared.width,
          ocrHeight: prepared.height,
          quality: prepared.quality,
        };
        setResults((r) => ({ ...r, [slot.id]: full }));
        setShowDetails((s) => ({ ...s, [slot.id]: false }));
        if (res.ok && res.filledFields.length > 0) {
          focusFilledFields(res.filledFields.map((f) => f.id));
        }
        track(goals.scannerUsed, {
          doc_type: slot.ocrKind,
          server_ocr: String(shouldUseServerOcr(ocularStatus, ocrConsent)),
        });
      } else {
        setResults((r) => ({
          ...r,
          [slot.id]: {
            ok: true,
            filled: 0,
            missing: [],
            filledFields: [],
            quality: prepared.quality,
            slotId: slot.id,
          },
        }));
      }
    } catch (e) {
      setResults((r) => ({
        ...r,
        [slot.id]: {
          ok: false,
          filled: 0,
          missing: [],
          filledFields: [],
          error: true,
          errorText:
            e instanceof Error && e.message
              ? e.message
              : "Не удалось распознать текст",
          slotId: slot.id,
        },
      }));
    }
    setScanningSlot(null);
    setProgress((p) => ({ ...p, [slot.id]: null }));
    const input = fileInputsRef.current[slot.id];
    if (input) input.value = "";
  };

  const retrySlot = (slot: DocSlot) => {
    const file = lastFilesRef.current[slot.id];
    if (file) void handleFile(slot, file);
    else fileInputsRef.current[slot.id]?.click();
  };

  const removePhoto = (slotId: string, index: number) => {
    const existing = photos[slotId] || [];
    onPhotosChange(
      slotId,
      existing.filter((_, i) => i !== index)
    );
  };

  const clearAll = () => {
    for (const slot of slots) {
      if ((photos[slot.id] || []).length > 0) onPhotosChange(slot.id, []);
    }
    setResults({});
    setShowDetails({});
  };

  const dismissResult = (slotId: string) =>
    setResults((r) => ({ ...r, [slotId]: null }));

  if (slots.length === 0) return null;

  const tileFor = (slot: DocSlot) => {
    const slotPhotos = photos[slot.id] || [];
    const res = results[slot.id] ?? null;
    const showDet = showDetails[slot.id] ?? false;
    const isScanning = scanningSlot === slot.id;
    const prog = progress[slot.id] ?? null;
    const pct =
      prog && prog.status === "recognizing text"
        ? Math.max(5, Math.round(prog.progress * 100))
        : null;
    const stageLabel = prog
      ? (STAGE_LABELS[prog.status] ?? "Распознаём документ…")
      : "Распознаём документ…";

    const uploadBtn = (
      <div className="shrink-0 flex flex-wrap items-center justify-end gap-1.5">
        <label
          className={`inline-flex items-center justify-center whitespace-nowrap font-semibold text-[11px] rounded-xl gap-1.5 px-3 py-2 border cursor-pointer transition-all ${
            isScanning
              ? "bg-slate-100 text-slate-600 border-slate-200 cursor-wait"
              : "bg-brand-600 text-white hover:bg-brand-700 border-brand-700 shadow-sm"
          }`}
        >
          {isScanning ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Camera className="w-3.5 h-3.5" />
          )}
          {isScanning
            ? "Работаем…"
            : slotPhotos.length > 0
            ? "Переснять"
            : "Фото"}
          <input
            ref={(el) => {
              fileInputsRef.current[slot.id] = el;
            }}
            type="file"
            accept="image/*"
            capture="environment"
            disabled={isScanning}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(slot, file);
            }}
            className="hidden"
          />
        </label>
        <label
          className={`inline-flex items-center justify-center whitespace-nowrap font-semibold text-[11px] rounded-xl gap-1.5 px-3 py-2 border cursor-pointer transition-all ${
            isScanning
              ? "bg-slate-100 text-slate-600 border-slate-200 cursor-wait"
              : "bg-white text-brand-700 hover:bg-brand-50 border-brand-200"
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          Файл
          <input
            type="file"
            accept="image/*"
            disabled={isScanning}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(slot, file);
            }}
            className="hidden"
          />
        </label>
      </div>
    );

    let body: React.ReactNode = null;
    if (isScanning) {
      body = (
        <div
          role="status"
          className="mt-2 rounded-xl border border-brand-100 bg-brand-50 px-3 py-2.5"
        >
          <div className="flex items-center gap-2 text-[11px] font-medium text-brand-700">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span className="truncate">{stageLabel}</span>
            {pct !== null && (
              <span className="ml-auto tabular-nums font-semibold">{pct}%</span>
            )}
          </div>
          {pct !== null && (
            <div className="mt-1.5 h-1 rounded-full bg-brand-100 overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          )}
        </div>
      );
    } else if (res) {
      const qWarns = res.quality ? qualityWarnings(res.quality) : [];
      if (res.ok) {
        body = (
          <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
              <Check className="w-3.5 h-3.5 shrink-0" />
              {res.filled > 0
                ? `Заполнено: ${res.filled} ${
                    res.filled === 1
                      ? "поле"
                      : res.filled < 5
                      ? "поля"
                      : "полей"
                  }`
                : "Фото добавлено"}
              {typeof res.confidence === "number" && res.filled > 0 && (
                <span
                  className={`ml-auto tabular-nums font-semibold ${
                    res.confidence >= 80
                      ? "text-emerald-700"
                      : res.confidence >= 60
                      ? "text-amber-600"
                      : "text-red-500"
                  }`}
                  title="Уверенность распознавания"
                >
                  {res.confidence}%
                </span>
              )}
            </div>
            {qWarns.length > 0 && (
              <div className="mt-1.5 space-y-1">
                {qWarns.map((w, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-1.5 py-1"
                  >
                    {w.icon === "dark" ? (
                      <Moon className="w-3 h-3 shrink-0" />
                    ) : w.icon === "blur" ? (
                      <Zap className="w-3 h-3 shrink-0" />
                    ) : (
                      <Sun className="w-3 h-3 shrink-0" />
                    )}
                    {w.text}
                  </div>
                ))}
              </div>
            )}
            {res.manualHints && res.manualHints.length > 0 && (
              <div className="mt-1.5 space-y-1">
                {res.manualHints.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-1.5 text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-1.5 py-1"
                  >
                    <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                    {h}
                  </div>
                ))}
              </div>
            )}
            {res.filledFields.length > 0 && (
              <>
                <button
                  onClick={() =>
                    setShowDetails((s) => ({ ...s, [slot.id]: !showDet }))
                  }
                  className="mt-1 text-[11px] text-emerald-600 underline underline-offset-2"
                >
                  {showDet ? "Скрыть" : "Что распознано?"}
                </button>
                {showDet && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {res.filledFields.map((f, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-md bg-white border border-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-800"
                      >
                        <span className="text-emerald-500">{f.label}:</span>
                        {f.value}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
            <div className="mt-1.5 flex items-center gap-3">
              <button
                onClick={() => fileInputsRef.current[slot.id]?.click()}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 hover:text-emerald-900"
              >
                <RotateCcw className="w-3 h-3" /> Переснять
              </button>
              {slotPhotos.length > 0 && (
                <button
                  onClick={() =>
                    setLightbox({
                      slotId: slot.id,
                      index: slotPhotos.length - 1,
                    })
                  }
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 hover:text-emerald-900"
                >
                  <ImageIcon className="w-3 h-3" /> Проверить по фото
                </button>
              )}
            </div>
          </div>
        );
      } else {
        body = (
          <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-800">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {res.error ? "Не удалось распознать текст" : "Поля не распознаны"}
            </div>
            {res.error ? (
              <>
                {res.errorText && (
                  <p className="mt-1 text-[10.5px] text-amber-700">
                    {res.errorText}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => retrySlot(slot)}
                    className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-amber-600"
                  >
                    <RotateCcw className="w-3 h-3" /> Повторить
                  </button>
                  <button
                    onClick={() => dismissResult(slot.id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-white border border-amber-200 px-2.5 py-1.5 text-[11px] font-semibold text-amber-700 hover:bg-amber-100"
                  >
                    Заполнить вручную
                  </button>
                </div>
              </>
            ) : (
              <>
                {res.missing.length > 0 && (
                  <p className="mt-1 text-[10.5px] text-amber-700">
                    <span className="font-medium">Не найдено:</span>{" "}
                    {res.missing.map((m) => m.label).join(", ")}
                  </p>
                )}
                <ul className="mt-1.5 space-y-0.5 text-[10px] text-amber-700">
                  <li>• Ровный свет без бликов и теней</li>
                  <li>• Держите документ прямо, заполните кадр</li>
                  <li>• Убедитесь, что текст в фокусе</li>
                </ul>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => fileInputsRef.current[slot.id]?.click()}
                    className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-amber-600"
                  >
                    <RotateCcw className="w-3 h-3" /> Переснять
                  </button>
                  <button
                    onClick={() => dismissResult(slot.id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-white border border-amber-200 px-2.5 py-1.5 text-[11px] font-semibold text-amber-700 hover:bg-amber-100"
                  >
                    Заполнить вручную
                  </button>
                </div>
              </>
            )}
          </div>
        );
      }
    }

    const thumbnails =
      slotPhotos.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {slotPhotos.map((src, i) => (
            <div
              key={i}
              className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 bg-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={slot.label}
                className="w-full h-full object-cover cursor-zoom-in"
                onClick={() => setLightbox({ slotId: slot.id, index: i })}
              />
              <button
                onClick={() => removePhoto(slot.id, i)}
                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                title="Удалить фото"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      ) : null;

    const tileClass = isScanning
      ? "border-brand-300 bg-brand-50/40"
      : res && res.ok
      ? "border-emerald-200 bg-white"
      : res
      ? "border-amber-200 bg-white"
      : dragOver === slot.id
      ? "border-brand-500 bg-brand-50 border-solid"
      : "border-dashed border-slate-300 bg-slate-50/50 hover:border-brand-300 hover:bg-brand-50/40";

    return (
      <div
        key={slot.id}
        className={`rounded-2xl border p-2.5 transition-colors ${tileClass}`}
        onDragOver={(e) => {
          e.preventDefault();
          if (!isScanning) setDragOver(slot.id);
        }}
        onDragLeave={() => setDragOver(null)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(null);
          if (isScanning) return;
          const file = Array.from(e.dataTransfer.files).find((f) =>
            f.type.startsWith("image/")
          );
          if (file) void handleFile(slot, file);
        }}
      >
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-start sm:justify-between gap-2">
          <div className="flex items-start gap-2 min-w-[150px] flex-1">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                res && res.ok
                  ? "bg-emerald-500 text-white"
                  : "bg-brand-100 text-brand-600"
              }`}
            >
              <Camera className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 leading-snug break-words">
                {slot.label}
              </p>
              <p className="text-[10px] text-slate-600 mt-0.5 leading-snug line-clamp-2 break-words">
                {slot.hint}
              </p>
            </div>
          </div>
          {uploadBtn}
        </div>
        {thumbnails}
        {body}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-soft overflow-hidden">
      <div className="sticky top-0 z-10 relative bg-gradient-to-br from-brand-500 to-brand-700 px-4 py-4 text-white">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0">
              <ScanLine className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-bold leading-tight">
                  Сканер документов
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide">
                  <BadgeCheck className="w-3 h-3" /> PRO
                </span>
              </div>
              <p className="text-[11px] text-white/80 leading-tight mt-0.5">
                Фото → заполнение полей за секунды
              </p>
              {ocularStatus === null ? (
                <p
                  className="text-[10px] text-white/60 leading-tight mt-1 flex items-center gap-1"
                  title="Проверяем доступность улучшенного серверного OCR"
                >
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full bg-white/40"
                    aria-hidden
                  />
                  Проверяем точный режим…
                </p>
              ) : ocularStatus.available ? (
                ocrConsent ? (
                  <p
                    className="text-[10px] text-emerald-100 leading-tight mt-1 flex items-center gap-1"
                    title={`Серверный OCR (${ocularStatus.languages ?? "ru"}, ${ocularStatus.threads ?? "?"} потоков) — повышенная точность на русских документах`}
                  >
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"
                      aria-hidden
                    />
                    Точный режим включён
                  </p>
                ) : (
                  <p
                    className="text-[10px] text-white/60 leading-tight mt-1 flex items-center gap-1"
                    title="Серверный OCR доступен, но выключен: включите согласие в подписи ниже"
                  >
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full bg-white/40"
                      aria-hidden
                    />
                    Точный режим доступен (выключен)
                  </p>
                )
              ) : (
                <p
                  className="text-[10px] text-white/60 leading-tight mt-1 flex items-center gap-1"
                  title={
                    ocularStatus.reason === "unconfigured"
                      ? "OCCULAR_BASE_URL не задан в env — будет использован встроенный OCR"
                      : `Серверный OCR недоступен (${ocularStatus.reason}) — будет использован встроенный OCR`
                  }
                >
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full bg-white/40"
                    aria-hidden
                  />
                  Базовый режим
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {loadedCount > 0 && (
              <button
                onClick={clearAll}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-white/80 hover:text-white transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Очистить
              </button>
            )}
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
              aria-label={collapsed ? "Развернуть сканер" : "Свернуть сканер"}
              title={collapsed ? "Развернуть" : "Свернуть"}
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  collapsed ? "" : "rotate-180"
                }`}
              />
            </button>
          </div>
        </div>
        {ocularStatus?.available ? (
          <label className="mt-2.5 flex items-start gap-2 text-[10.5px] text-white/80 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={ocrConsent}
              onChange={(e) => setServerOcrConsent(e.target.checked)}
              className="mt-0.5 w-3.5 h-3.5 shrink-0 accent-emerald-400 cursor-pointer"
            />
            <span>
              {ocrConsent ? (
                <>
                  <AlertTriangle className="inline w-3 h-3 -mt-0.5 mr-1 text-amber-200" aria-hidden />
                  Точный режим: фото передаётся на защищённый сервер распознавания
                  (Россия), не сохраняется и не используется иначе.{" "}
                  <Link href="/privacy" className="underline font-semibold">
                    Политика
                  </Link>
                </>
              ) : (
                <>
                  <ShieldCheck className="inline w-3 h-3 -mt-0.5 mr-1" aria-hidden />
                  Базовый режим — данные не покидают браузер. Отметьте, чтобы
                  включить точный серверный OCR (фото передастся на сервер
                  распознавания в России, не сохраняется).{" "}
                  <Link href="/privacy" className="underline font-semibold">
                    Подробнее
                  </Link>
                </>
              )}
            </span>
          </label>
        ) : (
          <p className="mt-2.5 flex items-center gap-1.5 text-[10.5px] text-white/70">
            <ShieldCheck className="w-3.5 h-3.5" /> Данные не покидают браузер
          </p>
        )}
      </div>

      {collapsed ? (
        <button
          onClick={() => setCollapsed(false)}
          className="w-full px-4 py-2.5 text-left text-[11px] text-slate-600 hover:text-brand-600 transition-colors"
        >
          Сканер свёрнут
          {loadedCount > 0
            ? ` · загружено ${loadedCount}/${slots.length}`
            : ""}
          {" — нажмите, чтобы развернуть"}
        </button>
      ) : (
        <>
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-600">Загружено:</span>
              <span className="font-bold text-brand-700">
                {loadedCount}/{slots.length}
              </span>
              {loadedCount === slots.length && (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              )}
            </div>
            <span className="text-[10px] text-slate-600">
              Можно перетащить файл в слот
            </span>
          </div>

          <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {slots.map((slot) => tileFor(slot))}
          </div>
        </>
      )}

      {lightbox &&
        (() => {
          const slot = slots.find((s) => s.id === lightbox.slotId);
          const src = (photos[lightbox.slotId] || [])[lightbox.index];
          const res = results[lightbox.slotId];
          if (!slot || !src) return null;
          const ow = res?.ocrWidth || 0;
          const oh = res?.ocrHeight || 0;
          const words = res?.words ?? [];
          return (
            <div
              className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
              onClick={() => setLightbox(null)}
              role="dialog"
              aria-modal="true"
              aria-label="Просмотр фото документа"
            >
              <div
                className="relative max-w-full max-h-full"
                onClick={(e) => e.stopPropagation()}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={slot.label}
                  className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
                />
                {words.length > 0 && ow > 0 && (
                  <div className="absolute inset-0">
                    {words.map((w, i) => {
                      const left = (w.bbox.x0 / ow) * 100;
                      const top = (w.bbox.y0 / oh) * 100;
                      const width = ((w.bbox.x1 - w.bbox.x0) / ow) * 100;
                      const height = ((w.bbox.y1 - w.bbox.y0) / oh) * 100;
                      const color =
                        w.confidence >= 80
                          ? "border-emerald-400 bg-emerald-400/10"
                          : w.confidence >= 60
                          ? "border-amber-400 bg-amber-400/10"
                          : "border-red-400 bg-red-400/10";
                      return (
                        <div
                          key={i}
                          className={`absolute border rounded-sm ${color}`}
                          style={{
                            left: `${left}%`,
                            top: `${top}%`,
                            width: `${width}%`,
                            height: `${height}%`,
                          }}
                          title={`${w.text} (${Math.round(w.confidence)}%)`}
                        />
                      );
                    })}
                  </div>
                )}
                <button
                  onClick={() => setLightbox(null)}
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white text-slate-700 shadow-lg flex items-center justify-center hover:bg-slate-100"
                  aria-label="Закрыть"
                >
                  <X className="w-4 h-4" />
                </button>
                {words.length > 0 && (
                  <p className="mt-2 text-center text-[11px] text-white/70">
                    Рамки — распознанные слова: зелёные надёжные,
                    жёлтые/красные — проверьте вручную
                  </p>
                )}
              </div>
            </div>
          );
        })()}
    </div>
  );
}
