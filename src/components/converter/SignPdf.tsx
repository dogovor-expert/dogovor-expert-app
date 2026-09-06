"use client";
import { useRef, useState } from "react";
import { Loader2, FileText, Shield } from "lucide-react";
import dynamic from "next/dynamic";
import { usePaywall } from "@/hooks/usePaywall";

const UKEPSigner = dynamic(
  () => import("@/components/builder/UKEPSigner").then((m) => ({ default: m.UKEPSigner })),
  { ssr: false }
);

export default function SignPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pdfInput = useRef<HTMLInputElement>(null);
  const { subscriptionActive, openPaywall, modal } = usePaywall();

  const onPdf = async (list: FileList | null) => {
    const f = list?.[0];
    if (!f) return;
    const MAX_FILE_SIZE_MB = 50; // PDF-файлы обычно крупнее фото, лимит выше чем в OCR
    if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Файл слишком большой (${(f.size / 1024 / 1024).toFixed(1)} МБ). Максимальный размер — ${MAX_FILE_SIZE_MB} МБ.`);
      return;
    }
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
          <p className="font-semibold text-blue-800">Подписание вашей УКЭП (КриптоПро)</p>
          <p className="text-sm text-blue-600 mt-0.5">
            Сервис не выдаёт электронные подписи: вы подписываете PDF своим сертификатом через установленный КриптоПро. Закрытый ключ остаётся на вашем устройстве.
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
              subscriptionActive={subscriptionActive}
              onUpgrade={() => openPaywall("Подписание вашей УКЭП через КриптоПро — доступно в подписке PRO")}
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

      {modal}
    </div>
  );
}
