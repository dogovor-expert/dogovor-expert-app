'use client';
import { useState, useCallback } from 'react';
import { Loader2, Check, AlertCircle, Shield, FileText, ArrowLeft } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { CryptoProCertSelector } from './CryptoProCertSelector';
import { signPdfWithCryptoPro } from '@/lib/signCryptoPro';
import { createPAdESFromCMS_Alternative as createPAdESFromCMS } from '@/lib/embedPades';
import { downloadBytes } from '@/lib/converter/download';

interface UKEPSignerProps {
  pdfBytes: Uint8Array;
  fileName?: string;
  onClose?: () => void;
  onBack?: () => void;
}

type Step = 'provider' | 'certificate' | 'signing' | 'done' | 'error';

export function UKEPSigner({ pdfBytes, fileName = 'document', onClose, onBack }: UKEPSignerProps) {
  const [step, setStep] = useState<Step>('provider');
  const [selectedCert, setSelectedCert] = useState<{ thumbprint: string; subjectName: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signerName, setSignerName] = useState('');

  const handleProviderSelect = useCallback((provider: 'cryptopro' | 'rutoken') => {
    if (provider === 'cryptopro') {
      setStep('certificate');
    } else {
      setError('Рутокен Web Plugin будет доступен в следующем обновлении. Пока используйте КриптоПро.');
      setStep('error');
    }
  }, []);

  const handleCertSelect = useCallback((thumbprint: string, cert: { subjectName: string }) => {
    setSelectedCert({ thumbprint, subjectName: cert.subjectName });
    const nameMatch = cert.subjectName.match(/CN=([^,]+)/);
    setSignerName(nameMatch ? nameMatch[1].trim() : 'Подписант');
    setStep('signing');
  }, []);

  const handleSign = useCallback(async () => {
    if (!selectedCert) return;

    setError(null);

    try {
      const cmsBase64 = await signPdfWithCryptoPro(pdfBytes, selectedCert.thumbprint, {
        detached: false,
        encodingType: 'base64',
        addSigningTime: true,
      });

      const signedPdf = await createPAdESFromCMS(pdfBytes, {
        cmsBase64,
        signerName,
        signingDate: new Date(),
        reason: 'Подписано квалифицированной электронной подписью',
        appearance: {
          pageIndex: 0,
          showVisualSignature: true,
        },
      });

      const downloadName = fileName.replace(/\.pdf$/i, '') + '-signed-ukep.pdf';
      downloadBytes(signedPdf, downloadName);

      setStep('done');
    } catch (e: any) {
      console.error('UKEP signing error:', e);
      setError(e.message || 'Неизвестная ошибка при подписании');
      setStep('error');
    }
  }, [pdfBytes, fileName, selectedCert, signerName]);

  const handleRetry = useCallback(() => {
    setError(null);
    if (selectedCert) {
      setStep('signing');
    } else {
      setStep('certificate');
    }
  }, [selectedCert]);

  const handleBack = useCallback(() => {
    if (step === 'provider') {
      onBack?.();
      onClose?.();
    } else if (step === 'certificate') {
      setStep('provider');
      setSelectedCert(null);
    } else if (step === 'signing') {
      setStep('certificate');
    } else if (step === 'error') {
      setStep('certificate');
    }
  }, [step, onBack, onClose]);

  if (step === 'provider') {
    return (
      <div className="space-y-4">
        {onBack && (
          <button
            onClick={handleBack}
            className="text-sm text-brand-600 hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </button>
        )}

        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <Shield className="w-6 h-6 text-blue-600" />
          <div>
            <p className="font-semibold text-blue-800">Квалифицированная электронная подпись (УКЭП)</p>
            <p className="text-sm text-blue-600 mt-0.5">
              Документ подписывается вашей УКЭП через КриптоПро. Сервис не имеет доступа к закрытому ключу.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleProviderSelect('cryptopro')}
            className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-brand-400 hover:bg-brand-50/30 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-gray-900">КриптоПро CSP</div>
                <div className="text-sm text-gray-500">Browser Plugin + токен/смарт-карта</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleProviderSelect('rutoken')}
            disabled
            className="w-full p-4 border-2 border-gray-200 rounded-xl bg-gray-50 text-left opacity-60 cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-300 flex items-center justify-center text-gray-500">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Рутокен / JaCarta</div>
                <div className="text-sm text-gray-500">Web Plugin / WebUSB (скоро)</div>
              </div>
            </div>
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Поддерживаемые браузеры: Chrome, Edge, Firefox (Windows/macOS/Linux). Safari и мобильные — не поддерживаются.
        </p>
      </div>
    );
  }

  if (step === 'certificate') {
    return (
      <div className="space-y-4">
        <button
          onClick={handleBack}
          className="text-sm text-brand-600 hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к выбору способа
        </button>

        <CryptoProCertSelector
          onSelect={handleCertSelect}
          onBack={handleBack}
        />
      </div>
    );
  }

  if (step === 'signing') {
    return (
      <div className="space-y-4 text-center py-8">
        <button
          onClick={handleBack}
          className="self-start text-sm text-brand-600 hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </button>

        <Loader2 className="w-12 h-12 animate-spin text-brand-500 mx-auto mb-4" />

        <h3 className="text-lg font-semibold text-gray-900">Подписание документа...</h3>

        <p className="text-sm text-gray-600 max-w-xs mx-auto">
          Откроется окно КриптоПро для ввода PIN-кода токена.
          <br />
          <span className="font-medium">{selectedCert?.subjectName}</span>
        </p>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-left">
          <p className="font-medium text-blue-800 mb-2">Что произойдёт сейчас:</p>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>КриптоПро покажет окно выбора сертификата (если несколько)</li>
            <li>Введите PIN-код токена/смарт-карты</li>
            <li>Документ подпишется и скачается автоматически</li>
          </ol>
        </div>

        <button
          onClick={handleSign}
          disabled
          className="mt-6 w-full px-4 py-2.5 bg-brand-500 text-white rounded-xl font-medium text-sm opacity-50 cursor-not-allowed"
        >
          Подписывается...
        </button>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="space-y-4 text-center py-8">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-emerald-600" />
        </div>

        <h3 className="text-lg font-semibold text-gray-900">Документ подписан УКЭП</h3>

        <p className="text-sm text-gray-600 max-w-xs mx-auto">
          Файл <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{fileName.replace(/\.pdf$/i, '')}-signed-ukep.pdf</code> скачан.
        </p>

        <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-left">
          <p className="font-medium text-emerald-800 mb-2">Что проверить:</p>
          <ul className="text-sm text-emerald-700 space-y-1 list-disc list-inside">
            <li>Откройте PDF в Adobe Acrobat Reader — должна отображаться панель подписи</li>
            <li>Нажмите на подпись → «Свойства подписи» → проверьте сертификат</li>
            <li>Статус должен быть: «Подпись действительна»</li>
          </ul>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => {
              setStep('provider');
              setSelectedCert(null);
              setError(null);
            }}
            className="px-6 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 font-medium text-sm transition"
          >
            Подписать другой документ
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium text-sm transition"
            >
              Закрыть
            </button>
          )}
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="space-y-4 text-center py-8">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>

        <h3 className="text-lg font-semibold text-gray-900">Ошибка при подписании</h3>

        <p className="text-sm text-red-600 max-w-md mx-auto p-4 bg-red-50 border border-red-200 rounded-xl">
          {error}
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={handleRetry}
            className="px-6 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 font-medium text-sm transition"
          >
            Попробовать снова
          </button>
          <button
            onClick={handleBack}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium text-sm transition"
          >
            Назад
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Частые причины: неверный PIN, токен не вставлен, плагин не установлен, браузер не поддерживается.
        </p>
      </div>
    );
  }

  return null;
}

export function UKEPSignerDisclaimer() {
  return (
    <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
      <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-1.5">
        <Shield className="w-4 h-4" />
        Важная юридическая информация
      </h4>
      <div className="text-sm text-amber-700 space-y-2">
        <p>
          <strong>Сервис dogovor.expert не является удостоверяющим центром</strong> и не предоставляет услуги
          по созданию электронной подписи в Sinne ФЗ-63 «Об электронной подписи».
        </p>
        <p>
          Функция подписи документов УКЭП реализована через программное обеспечение, установленное
          на вашем устройстве (<strong>КриптоПро CSP</strong>, <strong>Рутокен Plugin</strong> и др.).
          Все криптографические операции (хеширование, подпись, встраивание в PDF)
          выполняются <strong>локально в вашем браузере</strong>.
        </p>
        <p>
          Сервер dogovor.expert <strong>не видит</strong>: сам документ, ваш закрытый ключ,
          PIN-код, сертификат, полученную подпись.
        </p>
        <p>
          Юридическая сила подписи определяется вашим сертификатом УКЭП и законодательством РФ.
          Сервис лишь предоставляет интерфейс для удобного встраивания подписи в PDF (формат PAdES-BES).
        </p>
      </div>
    </div>
  );
}