"use client";
import { useRef, useState } from "react";
import { Loader2, FileText, Shield } from "lucide-react";
import dynamic from "next/dynamic";

const UKEPSigner = dynamic(
  () => import("@/components/builder/UKEPSigner").then((m) => ({ default: m.UKEPSigner })),
  { ssr: false }
);

export default function SignPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pdfInput = useRef<HTMLInputElement>(null);

  const onPdf = async (list: FileList | null) => {
    const f = list?.[0];
    if (!f) return;
    setFile(f);
    setError(null);
    try {
      const arrayBuffer = await f.arrayBuffer();
      setPdfBytes(new Uint8Array(arrayBuffer));
    } catch {
      setError("Не удалось прочитать PDF — файл повреждён или защищён паролем");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <Shield className="w-6 h-6 text-blue-600" />
        <div>
          <p className="font-semibold text-blue-800">Квалифицированная электронная подпись (УКЭП)</p>
          <p className="text-sm text-blue-600 mt-0.5">
            Документ подписывается вашей УКЭП через КриптоПро. Сервис не имеет доступа к закрытому ключу.
          </p>
        </div>
      </div>

      <input
        ref={pdfInput}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          onPdf(e.target.files);
          e.target.value = "";
        }}
      />

      {!file && (
        <button
          onClick={() => pdfInput.current?.click()}
          className="w-full border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center gap-2 hover:border-brand-400 hover:bg-brand-50/30 transition-all cursor-pointer"
        >
          <FileText className="w-10 h-10 text-gray-300" />
          <span className="font-medium text-gray-900">Выберите PDF для подписания</span>
          <span className="text-sm text-gray-500">PDF-файл будет обработан локально в браузере</span>
        </button>
      )}

      {file && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-200 px-3 py-2">
            <FileText className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700 truncate">{file.name}</span>
            <button
              onClick={() => {
                setFile(null);
                setPdfBytes(null);
              }}
              className="ml-auto text-xs text-gray-500 hover:text-red-500"
            >
              Выбрать другой
            </button>
          </div>
          {pdfBytes ? (
            <UKEPSigner
              pdfBytes={pdfBytes}
              fileName={file.name}
              onBack={() => {
                setFile(null);
                setPdfBytes(null);
              }}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-brand-500" />
              <p className="text-sm text-gray-600">Загрузка документа...</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-xl p-3 flex items-start gap-2 text-xs bg-red-50 border border-red-200 text-red-700">
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
