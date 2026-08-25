'use client';
import { useState } from 'react';
import { Loader2, ShieldCheck, AlertCircle, ExternalLink } from 'lucide-react';
import { useCryptoPro, loadCryptoProScript, type CertInfo } from '@/hooks/useCryptoPro';

interface CryptoProCertSelectorProps {
  onSelect: (thumbprint: string, cert: CertInfo) => void;
  onBack?: () => void;
}

export function CryptoProCertSelector({ onSelect, onBack }: CryptoProCertSelectorProps) {
  const { ready, error, certificates, loading, loadCertificates } = useCryptoPro();
  const [installing, setInstalling] = useState(false);

  const handleInstallClick = async () => {
    setInstalling(true);
    try {
      await loadCryptoProScript();
      setInstalling(false);
    } catch {
      setInstalling(false);
    }
  };

  if (error && !ready) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-800">КриптоПро Browser Plugin не обнаружен</p>
              <p className="text-sm text-red-600 mt-1">
                Для работы с квалифицированной электронной подписью (УКЭП) необходимо установить:
              </p>
              <ul className="text-sm text-red-600 mt-2 space-y-1 list-disc list-inside">
                <li>КриптоПро CSP 5.0 (криптопровайдер)</li>
                <li>КриптоПро Browser Plugin (плагин для браузера)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleInstallClick}
            disabled={installing}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 font-medium text-sm transition disabled:opacity-50"
          >
            {installing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Загрузка плагина...
              </>
            ) : (
              <>
                Загрузить плагин автоматически
                <ExternalLink className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          <a
            href="https://www.cryptopro.ru/products/csp/downloads"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium text-sm transition"
          >
            Скачать КриптоПро CSP
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <a
            href="https://www.cryptopro.ru/products/cades/plugin"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium text-sm transition"
          >
            Скачать Browser Plugin
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <p className="text-xs text-gray-500">
          Поддерживаемые браузеры: Chrome, Edge, Firefox (Windows, macOS, Linux). Safari и мобильные браузеры — не поддерживаются.
        </p>

        {onBack && (
          <button
            onClick={onBack}
            className="text-sm text-brand-600 hover:underline mt-2 inline-block"
          >
            ← Назад к выбору способа подписи
          </button>
        )}
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin text-brand-500 mb-2" />
        <p>Проверка наличия КриптоПро...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {onBack && (
        <button
          onClick={onBack}
          className="text-sm text-brand-600 hover:underline flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Назад
        </button>
      )}

      <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
        <ShieldCheck className="w-5 h-5 text-green-600" />
        <div>
          <p className="font-medium text-green-800">КриптоПро Browser Plugin готов</p>
          <p className="text-sm text-green-600">Выберите сертификат УКЭП для подписи</p>
        </div>
      </div>

      <button
        onClick={loadCertificates}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 font-medium text-sm transition disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Поиск сертификатов...
          </>
        ) : certificates.length > 0 ? (
          <>
            Повторить поиск сертификатов
          </>
        ) : (
          <>
            Загрузить сертификаты УКЭП
          </>
        )}
      </button>

      {certificates.length === 0 && !loading && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="font-medium text-amber-800">УКЭП не найдена</p>
          <ul className="text-sm text-amber-700 mt-2 space-y-1 list-disc list-inside">
            <li>Убедитесь, что токен/смарт-карта вставлен(а) в компьютер</li>
            <li>Проверьте, что драйверы токена установлены (Рутокен, JaCarta, eToken и др.)</li>
            <li>Сертификат должен быть в хранилище «Личные» текущего пользователя</li>
            <li>Сертификат должен иметь закрытый ключ (HasPrivateKey = true)</li>
          </ul>
        </div>
      )}

      {certificates.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900">Найдено сертификатов: {certificates.length}</p>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {certificates.map((cert) => (
              <button
                key={cert.thumbprint}
                onClick={() => onSelect(cert.thumbprint, cert)}
                className="w-full text-left p-4 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-brand-300 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{cert.subjectName}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-gray-500">
                      <span>Издатель: {cert.issuerName}</span>
                      <span>•</span>
                      <span>Действителен до: {new Date(cert.validTo).toLocaleDateString('ru-RU')}</span>
                    </div>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}