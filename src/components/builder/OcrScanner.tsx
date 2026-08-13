import { Camera, Check, FileText, Loader2 } from "lucide-react";
import type { RefObject } from "react";

interface OcrScannerProps {
  isScanning: boolean;
  scanSuccess: string | null;
  fileInputRef: RefObject<HTMLInputElement>;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function OcrScanner({
  isScanning,
  scanSuccess,
  fileInputRef,
  onPhotoUpload,
}: OcrScannerProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Сканер документов
            </h3>
            <p className="text-xs text-gray-500">
              Загрузите фото — данные заполнятся автоматически
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center justify-center font-medium transition-all px-3 py-1.5 text-xs rounded-lg gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 cursor-pointer">
            <Camera className="w-3.5 h-3.5" />
            Паспорт
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onPhotoUpload}
              className="hidden"
            />
          </label>
          <label className="inline-flex items-center justify-center font-medium transition-all px-3 py-1.5 text-xs rounded-lg gap-1.5 bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 cursor-pointer">
            <FileText className="w-3.5 h-3.5" />
            ПТС/СТС
            <input
              type="file"
              accept="image/*"
              onChange={onPhotoUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>
      {isScanning && (
        <div className="mt-3 flex items-center gap-2 text-xs text-brand-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          Распознавание текста...
        </div>
      )}
      {scanSuccess && (
        <div className="mt-3 bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <p className="text-xs text-emerald-700">{scanSuccess}</p>
        </div>
      )}
    </div>
  );
}
