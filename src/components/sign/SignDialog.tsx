"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { CertificateList, type CertInfo } from "@/components/sign/CertificateList";
import { signPdfWithCryptoPro } from "@/lib/signCryptoPro";
import { embedCms, hexLengthOfCms, uint8ArrayToHex } from "@/lib/embedPades";
import { uint8ToBase64 } from "@/lib/bytes";

/**
 * Длина CMS детерминирована для сертификата (цепочка + метка времени), поэтому
 * измеряем её один раз пробным подписанием и кэшируем — иначе на каждое
 * подписание приходилось бы дважды вызывать КриптоПро.
 * Тот же приём используется в UKEPSigner.
 */
const CMS_LEN_CACHE = new Map<string, number>();

/** Опции подписи: ОБЯЗАНЫ совпадать в пробном и финальном проходе. */
const SIGN_OPTS = {
  detached: true,
  encodingType: "base64" as const,
  addSigningTime: true,
  addTimestamp: true,
};

interface SignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentTitle: string;
  designId?: string;
}

interface DisclaimerState {
  accepted: boolean;
  timestamp?: number;
}

interface PrepareResponse {
  placeholderPdfBase64: string;
  signedContentBase64: string;
  cmsHexLen: number;
  /** true — пробный проход (место под CMS зарезервировано «на глазок»). */
  isProbe: boolean;
  documentHash: string;
  documentId: string;
}

export function SignDialog({
  isOpen,
  onClose,
  documentId,
  documentTitle,
  designId,
}: SignDialogProps) {
  const [step, setStep] = useState<"disclaimer" | "certificate" | "signing" | "embedding" | "complete" | "error">("disclaimer");
  const [disclaimer, setDisclaimer] = useState<DisclaimerState>({ accepted: false });
  const [selectedCert, setSelectedCert] = useState<CertInfo | null>(null);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placeholderPdf, setPlaceholderPdf] = useState<Uint8Array | null>(null);
  const [signedContent, setSignedContent] = useState<Uint8Array | null>(null);
  const [cmsHexLen, setCmsHexLen] = useState<number>(0);
  const [documentHash, setDocumentHash] = useState<string | null>(null);

  /**
   * Запрос подготовки документа. Без cmsHexLen — пробный проход, с cmsHexLen —
   * финальный плейсхолдер точной длины (только так ByteRange совпадёт с CMS).
   */
  const requestPrepare = useCallback(
    async (cmsHexLen?: number): Promise<PrepareResponse> => {
      const res = await fetch("/api/sign/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          designId,
          ...(cmsHexLen ? { cmsHexLen } : {}),
        }),
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({ error: "prepare failed" }))) as { error?: string };
        throw new Error(err.error || "Не удалось подготовить документ");
      }

      return (await res.json()) as PrepareResponse;
    },
    [documentId, designId]
  );

  // Загружаем PDF и данные для подписания при открытии диалога
  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;

    async function prepare() {
      try {
        setSigning(true);
        const data = await requestPrepare();
        if (mounted) {
          const placeholder = Uint8Array.from(atob(data.placeholderPdfBase64), (c) => c.charCodeAt(0));
          const content = Uint8Array.from(atob(data.signedContentBase64), (c) => c.charCodeAt(0));
          setPlaceholderPdf(placeholder);
          setSignedContent(content);
          setCmsHexLen(data.cmsHexLen);
          setDocumentHash(data.documentHash);
          setSigning(false);
          setStep("disclaimer");
        }
      } catch (e) {
        if (mounted) {
          setError(e instanceof Error ? e.message : "Ошибка подготовки");
          setStep("error");
        }
      }
    }

    void prepare();

    return () => {
      mounted = false;
    };
  }, [isOpen, requestPrepare]);

  // Сброс при закрытии
  useEffect(() => {
    if (!isOpen) {
      setStep("disclaimer");
      setDisclaimer({ accepted: false });
      setSelectedCert(null);
      setSigning(false);
      setError(null);
      setPlaceholderPdf(null);
      setSignedContent(null);
      setCmsHexLen(0);
      setDocumentHash(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDisclaimerAccept = () => {
    setDisclaimer({ accepted: true, timestamp: Date.now() });
    setStep("certificate");
  };

  const handleCertificateSelect = (cert: CertInfo) => {
    setSelectedCert(cert);
  };

  const handleSign = async () => {
    if (!selectedCert || !placeholderPdf || !signedContent || !cmsHexLen || !documentHash) return;

    setSigning(true);
    setError(null);

    try {
      const thumbprint = selectedCert.thumbprint;

      // 1. Точная длина CMS. Она детерминирована для сертификата (цепочка +
      // метка времени), но заранее неизвестна — измеряем пробным подписанием.
      // Без этого шага зарезервированное место не совпадёт с подписью и
      // встроить её в PDF не получится (ByteRange поедет).
      let cmsLen = CMS_LEN_CACHE.get(thumbprint);
      if (!cmsLen) {
        setStep("signing");
        const probeBase64 = await signPdfWithCryptoPro(signedContent, thumbprint, SIGN_OPTS);
        cmsLen = hexLengthOfCms(probeBase64);
        CMS_LEN_CACHE.set(thumbprint, cmsLen);
      }

      // 2. Финальный плейсхолдер — ровно под длину CMS.
      const finalPrep = await requestPrepare(cmsLen);
      const finalPlaceholder = Uint8Array.from(atob(finalPrep.placeholderPdfBase64), (c) => c.charCodeAt(0));
      const finalContent = Uint8Array.from(atob(finalPrep.signedContentBase64), (c) => c.charCodeAt(0));

      // 3. Подписываем именно финальный контент (у него свои ByteRange).
      setStep("signing");
      const signatureBase64 = await signPdfWithCryptoPro(finalContent, thumbprint, SIGN_OPTS);

      // 4. Встраиваем подпись в PDF (PAdES: adbe.pkcs7.detached).
      setStep("embedding");
      const cmsHex = uint8ArrayToHex(
        new Uint8Array(Buffer.from(signatureBase64, "base64"))
      );
      if (cmsHex.length !== finalPrep.cmsHexLen) {
        throw new Error(
          `Длина подписи не совпала с плейсхолдером (${cmsHex.length} ≠ ${finalPrep.cmsHexLen}). Попробуйте ещё раз.`
        );
      }
      const signedPdfBytes = embedCms(finalPlaceholder, cmsHex);

      // 5. Скачиваем подписанный PDF
      const blob = new Blob([signedPdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `signed-${documentTitle}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // 6. Отправляем подписанный PDF на сервер для сохранения и аудита.
      // Чанкованное преобразование: `String.fromCharCode.apply` на весь массив
      // бросает RangeError на документах больше ~130 КБ.
      const signedPdfBase64 = uint8ToBase64(signedPdfBytes);

      const res = await fetch("/api/sign/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          signedPdfBase64,
          thumbprint,
          subjectName: selectedCert.subjectName,
          validTo: selectedCert.validTo,
          // Подпись создаётся с меткой времени → CAdES-X-Long Type 1
          // (в БД на это значение есть CHECK-ограничение).
          algorithm: "CAdES-X-Long-Type-1",
        }),
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({ error: "accept failed" }))) as { error?: string };
        throw new Error(err.error || "Не удалось сохранить подпись на сервере");
      }

      await res.json();
      setStep("complete");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка подписания");
      setStep("error");
    } finally {
      setSigning(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    if (step === "error") {
      setStep(selectedCert ? "certificate" : "disclaimer");
    }
  };

  // Disclaimer контент
  const DISCLAIMER_ITEMS = [
    "Подписание производится <strong>вашей электронной подписью</strong> через установленный КриптоПро CSP 5.0+.",
    "Сайт <strong>не хранит ваш закрытый ключ</strong> и не имеет к нему доступа — все криптографические операции выполняются на вашем компьютере.",
    "После подписания подписанный PDF и метаданные сертификата (ФИО, издатель, отпечаток, срок действия) <strong>передаются на сервер и хранятся как техническая копия</strong> (по умолчанию 3 года). Подробности — в Политике конфиденциальности.",
    "Юридическая значимость определяется <strong>вашим сертификатом и удостоверяющим центром</strong> (63-ФЗ). Техническая проверка подписи на сайте носит справочный характер.",
    "Убедитесь, что сертификат <strong>действующий</strong> и выдан <strong>аккредитованным УЦ</strong> (КриптоПро УЦ, Контур, Тензор, Аналитика и др.), и что вы вправе передавать данные участников документа.",
    "Сайт не несёт ответственности за действия удостоверяющего центра, отзыв сертификата или его недействительность на момент подписания.",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="sign-dialog-title">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" aria-hidden="true" />
            <div>
              <h2 id="sign-dialog-title" className="text-lg font-semibold text-gray-900">
                Подписать документ
              </h2>
              <p className="text-sm text-gray-500 truncate max-w-xs">{documentTitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={signing}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Progress steps */}
        <div className="hidden md:flex px-4 py-3 border-b border-gray-100 bg-gray-50">
          {["disclaimer", "certificate", "signing", "embedding", "complete"].map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`flex items-center gap-2 ${
                  (step === s || (step === "complete" && s !== "complete") || (step === "error" && s !== "complete")) ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    step === s ? "bg-blue-600 text-white" :
                    (step === "complete" || step === "error") ? "bg-green-600 text-white" :
                    "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step === "embedding" && !signing ? (
                    <CheckCircle className="w-4 h-4" aria-hidden="true" />
                  ) : (i + 1)}
                </div>
                <span className="text-xs font-medium capitalize">{s}</span>
              </div>
              {i < 4 && <div className="flex-1 h-0.5 bg-gray-200 mx-2" aria-hidden="true" />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
          {/* Step 1: Disclaimer */}
          {step === "disclaimer" && (
            <div className="space-y-4" role="alert">
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div className="text-sm text-amber-800">
                  <h3 className="font-medium text-amber-900 mb-2">Важная информация перед подписанием</h3>
                  <p className="mb-3">
                    Вы собираетесь подписать документ своей квалифицированной электронной подписью.
                    Пожалуйста, внимательно прочитайте следующее:
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    {DISCLAIMER_ITEMS.map((item, i) => (
                      <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                    ))}
                  </ul>
                </div>
              </div>

              <label className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={disclaimer.accepted}
                  onChange={(e) => setDisclaimer({ accepted: e.target.checked, timestamp: Date.now() })}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  aria-describedby="disclaimer-desc"
                  required
                />
                <div className="flex-1 text-sm text-gray-700">
                  <span id="disclaimer-desc" className="font-medium">Я прочитал и понимаю вышеуказанное.</span>
                  <p className="mt-1">Подпись создаётся моим ключом, сайт не несёт ответственности за действия удостоверяющего центра.</p>
                </div>
              </label>

              <button
                type="button"
                onClick={handleDisclaimerAccept}
                disabled={!disclaimer.accepted}
                className="w-full py-3 px-4 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Продолжить к выбору сертификата
              </button>
            </div>
          )}

          {/* Step 2: Certificate Selection */}
          {step === "certificate" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ShieldCheck className="w-5 h-5 text-green-600" aria-hidden="true" />
                <span>КриптоПро Browser Plugin загружен. Выберите сертификат для подписания.</span>
              </div>

              <CertificateList
                onSelect={handleCertificateSelect}
                selectedThumbprint={selectedCert?.thumbprint}
                filterQualifiedOnly={true}
                className="mb-4"
              />

              <button
                type="button"
                onClick={() => { void handleSign(); }}
                disabled={!selectedCert || signing}
                className="w-full py-3 px-4 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {signing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    Подготовка…
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" aria-hidden="true" />
                    Подписать документ
                  </>
                )}
              </button>
            </div>
          )}

          {/* Step 3: Signing (progress) */}
          {step === "signing" && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" aria-hidden="true" />
              <div className="text-gray-700">
                <p className="font-medium">Создание электронной подписи…</p>
                <p className="text-sm text-gray-500 mt-1">
                  Откройте КриптоПро CSP, выберите контейнер и введите PIN-код при запросе.
                </p>
              </div>
              {selectedCert && (
                <div className="w-full max-w-md p-3 bg-gray-50 rounded-lg text-sm text-gray-600 text-left">
                  <p className="font-medium text-gray-900">{getSubjectCN(selectedCert.subjectName)}</p>
                  <p className="font-mono text-xs">{selectedCert.thumbprint}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Embedding */}
          {step === "embedding" && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" aria-hidden="true" />
              <div className="text-gray-700">
                <p className="font-medium">Встраивание подписи в PDF (PAdES)…</p>
                <p className="text-sm text-gray-500 mt-1">Создание финального подписанного документа.</p>
              </div>
            </div>
          )}

          {/* Step 5: Complete */}
          {step === "complete" && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Документ успешно подписан!</h3>
                <p className="text-sm text-gray-500 mt-1">Подписанный PDF сохранён и скачан.</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Закрыть
              </button>
            </div>
          )}

          {/* Error */}
          {step === "error" && (
            <div className="space-y-4" role="alert">
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div className="text-sm text-red-800">
                  <h3 className="font-medium text-red-900 mb-1">Ошибка</h3>
                  <p>{error}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="flex-1 py-3 px-4 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Попробовать снова
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Отмена
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getSubjectCN(subjectName: string): string {
  const match = subjectName.match(/CN=([^,]+)/);
  return match ? match[1] : subjectName;
}