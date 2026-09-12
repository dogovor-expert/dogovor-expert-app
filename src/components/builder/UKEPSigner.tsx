'use client';
import { useState, useCallback, useRef } from 'react';
import { Loader2, Check, AlertCircle, Shield, FileText, ArrowLeft } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { CryptoProCertSelector } from './CryptoProCertSelector';
import { signPdfWithCryptoPro } from '@/lib/signCryptoPro';
import { preparePAdESPlaceholder, embedCms, hexLengthOfCms, uint8ArrayToHex } from '@/lib/embedPades';
import { downloadBytes } from '@/lib/converter/download';

// Длина CMS детерминирована для конкретного сертификата (detached) → кэшируем, чтобы не запрашивать PIN дважды
const cmsLengthCache = new Map<string, number>();

interface UKEPSignerProps {
  pdfBytes: Uint8Array;
  fileName?: string;
  onClose?: () => void;
  onBack?: () => void;
  /** Если подписка не PRO, выбор способа подписи открывает шлюз onUpgrade */
  subscriptionActive?: boolean;
  onUpgrade?: () => void;
}

type Step = 'provider' | 'certificate' | 'confirm' | 'signing' | 'done' | 'error';

export function UKEPSigner({ pdfBytes, fileName = 'document', onClose, onBack, subscriptionActive = false, onUpgrade }: UKEPSignerProps) {
  const [step, setStep] = useState<Step>('provider');
  const [selectedCert, setSelectedCert] = useState<{ thumbprint: string; subjectName: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signerName, setSignerName] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const signingRef = useRef(false);

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
    setConfirmed(false);
    setStep('confirm');
  }, []);

  const handleSign = useCallback(async () => {
    if (!selectedCert || signingRef.current) return;
    signingRef.current = true;

    setError(null);

    try {
      const opts = {
        signerName,
        signingDate: new Date(),
        reason: 'Подписано квалифицированной электронной подписью',
        appearance: {
          pageIndex: 0,
          showVisualSignature: true,
        },
      };

      // 1) Узнаём длину CMS для этого сертификата (детерминирована) — кэшируем
      // addTimestamp должен быть одинаковым в probe и в финальной подписи,
      // иначе X-Long Type 1 изменит длину CMS и плейсхолдер не совпадёт.
      let cmsLen = cmsLengthCache.get(selectedCert.thumbprint);
      if (!cmsLen) {
        const probe = await preparePAdESPlaceholder(pdfBytes, 8192, opts);
        const cmsProbe = await signPdfWithCryptoPro(probe.signedContent, selectedCert.thumbprint, {
          detached: true,
          encodingType: 'base64',
          addSigningTime: true,
          addTimestamp: true,
        });
        cmsLen = hexLengthOfCms(cmsProbe);
        cmsLengthCache.set(selectedCert.thumbprint, cmsLen);
      }

      // 2) Готовим плейсхолдер точной длины и подписываем gap-удалённый контент
      const { placeholder, signedContent } = await preparePAdESPlaceholder(pdfBytes, cmsLen, opts);
      const cmsBase64 = await signPdfWithCryptoPro(signedContent, selectedCert.thumbprint, {
        detached: true,
        encodingType: 'base64',
        addSigningTime: true,
        addTimestamp: true,
      });

      const cmsHex = uint8ArrayToHex(Uint8Array.from(atob(cmsBase64), c => c.charCodeAt(0)));
      if (cmsHex.length !== cmsLen) {
        throw new Error(`Длина CMS не совпала с плейсхолдером (${cmsHex.length} ≠ ${cmsLen})`);
      }

      // 3) Встраиваем CMS в плейсхолдер
      const signedPdf = embedCms(placeholder, cmsHex);

      const downloadName = fileName.replace(/\.pdf$/i, '') + '-signed-ukep.pdf';
      downloadBytes(signedPdf, downloadName);

      setStep('done');
    } catch (e: any) {
      console.error('UKEP signing error:', e);
      signingRef.current = false;
      setError(e.message || 'Неизвестная ошибка при подписании');
      setStep('error');
    }
  }, [pdfBytes, fileName, selectedCert, signerName]);

  // Подписание запускается только явным подтверждением на шаге 'confirm' —
  // автозапуск удалён (УКЭП = юридически значимое действие).

  const handleRetry = useCallback(() => {
    setError(null);
    if (selectedCert) {
      setStep('confirm');
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
    } else if (step === 'confirm') {
      setStep('certificate');
      setSelectedCert(null);
      setConfirmed(false);
    } else if (step === 'signing') {
      setStep('confirm');
    } else if (step === 'error') {
      setStep('confirm');
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
            <p className="font-semibold text-blue-800">Подписание вашей УКЭП (КриптоПро)</p>
            <p className="text-sm text-blue-600 mt-0.5">
              Сервис не выдаёт электронные подписи: вы подписываете документ своим сертификатом УКЭП через установленный КриптоПро. Закрытый ключ остаётся на вашем устройстве.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => {
              if (!subscriptionActive) {
                onUpgrade?.();
                return;
              }
              handleProviderSelect('cryptopro');
            }}
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

  if (step === 'confirm') {
    return (
      <div className="space-y-4">
        <button
          onClick={handleBack}
          className="text-sm text-brand-600 hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к выбору сертификата
        </button>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <h3 className="font-semibold text-amber-900 flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            Подтвердите подписание
          </h3>
          <p className="text-sm text-amber-800">
            УКЭП юридически равнозначна собственноручной подписи. После подписания
            документ нельзя изменить — подпись станет недействительной.
          </p>
        </div>

        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-gray-500">Документ</span>
            <span className="font-medium text-gray-900 text-right truncate max-w-[60%]">{fileName}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-500">Подписант</span>
            <span className="font-medium text-gray-900 text-right">{signerName}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-500">Сертификат</span>
            <span className="font-mono text-xs text-gray-700 text-right break-all">{selectedCert?.thumbprint}</span>
          </div>
        </div>

        <label className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm text-gray-700">
            Я проверил(а) содержимое документа и подтверждаю подписание квалифицированной электронной подписью
          </span>
        </label>

        <button
          onClick={() => {
            setStep('signing');
            void handleSign();
          }}
          disabled={!confirmed}
          className="w-full px-4 py-2.5 bg-brand-500 text-white rounded-xl font-medium text-sm hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Подписать документ
        </button>
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
          <p className="font-medium text-blue-800 mb-2">Что происходит сейчас:</p>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>КриптоПро покажет окно выбора сертификата (если несколько)</li>
            <li>Введите PIN-код токена/смарт-карты</li>
            <li>Документ подпишется и скачается автоматически</li>
          </ol>
        </div>
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