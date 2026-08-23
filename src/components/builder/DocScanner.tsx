"use client";
import { useRef, useState, useMemo } from "react";
import {
  Camera,
  Check,
  ChevronDown,
  Loader2,
  RotateCcw,
  Trash2,
  X,
  AlertTriangle,
  ScanLine,
  BadgeCheck,
  ShieldCheck,
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

interface DocScannerProps {
  template: LegalTemplate;
  photos: Record<string, string[]>;
  onPhotosChange: (slotId: string, photos: string[]) => void;
  onFieldChange: (fieldId: string, value: string) => void;
}

interface ScanResult {
  ok: boolean;
  filled: number;
  missing: { id: string; label: string }[];
  filledFields: { label: string; value: string }[];
  error?: boolean;
  slotId: string;
}

const compressImage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const MAX = 900;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.onerror = () => reject(new Error("image"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("read"));
    reader.readAsDataURL(file);
  });

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
  const [results, setResults] = useState<Record<string, ScanResult | null>>({});
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});
  const [collapsed, setCollapsed] = useState(false);
  const fileInputsRef = useRef<Record<string, HTMLInputElement | null>>({});

  const loadedCount = slots.filter(
    (s) => (photos[s.id] || []).length > 0
  ).length;

  const runOcr = async (slot: DocSlot, file: File): Promise<string> => {
    // Используем Web Worker — tesseract.js не попадает в основной бандл.
    // Относительный путь обязателен: webpack корректно собирает worker-чанк
    // только для статически разрешимого (не алиасного) URL.
    const worker = new Worker(
      new URL("../../lib/workers/ocr-worker.js", import.meta.url),
      { type: "module" }
    );

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        worker.terminate();
        reject(new Error("OCR timeout"));
      }, 60000);

      worker.onmessage = (e: MessageEvent) => {
        const msg = e.data;
        if (msg.type === "result") {
          clearTimeout(timeout);
          worker.terminate();
          resolve(msg.text);
        } else if (msg.type === "error") {
          clearTimeout(timeout);
          worker.terminate();
          reject(new Error(msg.message));
        }
        // progress игнорируем — UI обновляется через scanningSlot
      };

      worker.onerror = (err) => {
        clearTimeout(timeout);
        worker.terminate();
        reject(new Error(`Worker error: ${err.message}`));
      };

      worker.postMessage({ type: "recognize", file, lang: "rus+eng" });
    });
  };

  const applyOcr = (slot: DocSlot, text: string): ScanResult => {
    const values: Record<string, string> = {};
    switch (slot.ocrKind) {
      case "passport":
      case "passportReg": {
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
      default:
        return { ok: false, filled: 0, missing: [], filledFields: [], slotId: slot.id };
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
      label: fieldLabel(id),
      value,
    }));

    return {
      ok: entries.length > 0,
      filled: entries.length,
      missing,
      filledFields,
      slotId: slot.id,
    };
  };

  const handleFile = async (slot: DocSlot, file: File) => {
    setScanningSlot(slot.id);
    setResults((r) => ({ ...r, [slot.id]: null }));
    try {
      const dataUrl = await compressImage(file);
      const existing = photos[slot.id] || [];
      const next =
        existing.length >= slot.maxPhotos
          ? [...existing.slice(1), dataUrl]
          : [...existing, dataUrl];
      onPhotosChange(slot.id, next);

      if (slot.ocrKind) {
        const text = await runOcr(slot, file);
        const res = applyOcr(slot, text);
        setResults((r) => ({ ...r, [slot.id]: res }));
        setShowDetails((s) => ({ ...s, [slot.id]: false }));
      } else {
        setResults((r) => ({
          ...r,
          [slot.id]: {
            ok: true,
            filled: 0,
            missing: [],
            filledFields: [],
            slotId: slot.id,
          },
        }));
      }
    } catch {
      setResults((r) => ({
        ...r,
        [slot.id]: {
          ok: false,
          filled: 0,
          missing: [],
          filledFields: [],
          error: true,
          slotId: slot.id,
        },
      }));
    }
    setScanningSlot(null);
    if (fileInputsRef.current[slot.id]) {
      fileInputsRef.current[slot.id]!.value = "";
    }
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

    const uploadBtn = (
      <label
        className={`shrink-0 inline-flex items-center justify-center font-semibold text-[11px] rounded-xl gap-1.5 px-3 py-2 border cursor-pointer transition-all ${
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
          ? "Распознаём…"
          : slotPhotos.length > 0
          ? "Переснять"
          : "Загрузить"}
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
    );

    let body: React.ReactNode = null;
    if (isScanning) {
      body = (
        <div className="mt-2 flex items-center gap-2 text-[11px] font-medium text-brand-700 bg-brand-50 rounded-xl px-3 py-2.5">
          <Loader2 className="w-4 h-4 animate-spin" />
          Распознаём документ…
        </div>
      );
    } else if (res) {
      if (res.ok) {
        body = (
          <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
              <Check className="w-3.5 h-3.5 shrink-0" />
              Заполнено: {res.filled}{" "}
              {res.filled === 1 ? "поле" : "поля"}
            </div>
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
            <div className="mt-1.5">
              <button
                onClick={() => fileInputsRef.current[slot.id]?.click()}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 hover:text-emerald-900"
              >
                <RotateCcw className="w-3 h-3" /> Переснять
              </button>
            </div>
          </div>
        );
      } else {
        body = (
          <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-800">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {res.error
                ? "Не удалось распознать текст"
                : "Поля не распознаны"}
            </div>
            {res.error ? (
              <p className="mt-1 text-[10.5px] text-amber-700">
                Попробуйте другое фото. Данные можно ввести вручную.
              </p>
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
              </>
            )}
            <div className="mt-2 flex gap-2">
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
              <img
                src={src}
                alt={slot.label}
                className="w-full h-full object-cover"
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
      ? "border-brand-200 bg-brand-50/40"
      : res && res.ok
      ? "border-emerald-200 bg-white"
      : res
      ? "border-amber-200 bg-white"
      : "border-dashed border-slate-300 bg-slate-50/50 hover:border-brand-300 hover:bg-brand-50/40";

    return (
      <div
        key={slot.id}
        className={`rounded-2xl border p-2.5 transition-colors ${tileClass}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
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
              <p className="text-xs font-semibold text-slate-800 leading-snug">
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
      <div className="relative bg-gradient-to-br from-brand-500 to-brand-700 px-4 py-4 text-white">
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
        <p className="mt-2.5 flex items-center gap-1.5 text-[10.5px] text-white/70">
          <ShieldCheck className="w-3.5 h-3.5" /> Данные не покидают браузер ·
          соответствует 152-ФЗ
        </p>
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
            <span className="text-[10px] text-slate-600">Платная подписка</span>
          </div>

          <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {slots.map((slot) => tileFor(slot))}
          </div>
        </>
      )}
    </div>
  );
}
