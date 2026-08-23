import { FileImage, PenLine } from "lucide-react";

interface EsignPanelProps {
  signSeller: string | null;
  signBuyer: string | null;
  onClear: (who: "seller" | "buyer") => void;
  onUpload: (who: "seller" | "buyer") => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDraw: (who: "seller" | "buyer") => void;
}

export default function EsignPanel({
  signSeller,
  signBuyer,
  onClear,
  onUpload,
  onDraw,
}: EsignPanelProps) {
  return (
    <div className="space-y-4">
      {(
        [
          ["seller", "Подпись продавца", signSeller],
          ["buyer", "Подпись покупателя", signBuyer],
        ] as const
      ).map(([key, label, img]) => (
        <div key={key}>
          <p className="text-xs font-medium text-gray-600 mb-1">
            {label}
          </p>
          {img && (
            <div className="flex items-center gap-2 mb-1.5">
              {/* локальная подпись user, dataURL — next/image неприменим */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={label}
                className="h-10 border border-gray-200 rounded bg-white p-1"
              />
              <button
                onClick={() => onClear(key)}
                className="text-[10px] text-red-500 hover:text-red-600"
              >
                Убрать
              </button>
            </div>
          )}
          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors">
            <FileImage className="w-3.5 h-3.5" />
            {img ? "Заменить подпись" : "Загрузить подпись (PNG)"}
            <input
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={onUpload(key)}
            />
          </label>
          <button
            onClick={() => onDraw(key)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <PenLine className="w-3.5 h-3.5" />
            Нарисовать
          </button>
        </div>
      ))}
      <p className="text-[10px] leading-relaxed text-gray-600">
        Подпись с прозрачным фоном вставится в раздел «Реквизиты и
        подписи сторон» документа при экспорте в PDF. Подпись
        сохраняется в этом браузере.
      </p>
    </div>
  );
}
