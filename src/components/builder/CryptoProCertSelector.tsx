'use client';
import { useState } from 'react';
import {
  Loader2,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Info,
  RefreshCw,
} from 'lucide-react';
import { useCryptoPro, loadCryptoProScript, type CertInfo } from '@/hooks/useCryptoPro';

interface CryptoProCertSelectorProps {
  onSelect: (thumbprint: string, cert: CertInfo) => void;
  onBack?: () => void;
}

type RevocationStatus = 'valid' | 'revoked' | 'unknown' | 'offline';

function revocationLabel(status?: RevocationStatus): string {
  switch (status) {
    case 'valid':
      return 'OK';
    case 'revoked':
      return 'Отозван';
    case 'offline':
      return 'Нет связи';
    default:
      return '—';
  }
}

export function CryptoProCertSelector({ onSelect, onBack }: CryptoProCertSelectorProps) {
  const {
    ready,
    error,
    certificates,
    loading,
    loadCertificates,
    validating,
    validateCert,
    initialize,
  } = useCryptoPro();
  const [installing, setInstalling] = useState(false);

  const handleInstallClick = async () => {
    setInstalling(true);
    try {
      await loadCryptoProScript();
      await initialize();
    } catch {
      // Ошибка отобразится через поле error хука.
    } finally {
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
            {certificates.map((cert) => {
              const validation = cert.validation;
              const isChecking = validating === cert.thumbprint;
              const isPending = !validation && !isChecking;
              const isValid = validation?.isValid;
              const isQualified = validation?.isQualified;

              return (
                <div key={cert.thumbprint} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-stretch">
                    <button
                      type="button"
                      onClick={() => { if (!isPending && !isChecking) onSelect(cert.thumbprint, cert); }}
                      disabled={isPending || isChecking}
                      className="flex-1 min-w-0 text-left p-4 hover:bg-blue-50 transition-all disabled:cursor-wait"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-gray-900 truncate">{cert.subjectName}</p>
                            {isChecking && <Loader2 className="w-4 h-4 animate-spin text-brand-500" />}
                            {isPending && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-gray-500">
                            <span>Издатель: {cert.issuerName}</span>
                            <span>•</span>
                            <span>Действителен до: {new Date(cert.validTo).toLocaleDateString('ru-RU')}</span>
                          </div>

                          {isPending ? (
                            <p className="mt-2 text-xs text-gray-400">Проверка сертификата...</p>
                          ) : validation ? (
                            <>
                              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                  isValid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  <CheckCircle className="w-3 h-3" />
                                  {isValid ? 'Валиден' : 'Невалиден'}
                                </span>
                                {validation.isQualified && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                                    <ShieldCheck className="w-3 h-3" />
                                    УКЭП
                                  </span>
                                )}
                                {validation.warnings.length > 0 && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                                    <AlertTriangle className="w-3 h-3" />
                                    {validation.warnings.length} предупр.
                                  </span>
                                )}
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs">
                                  <Info className="w-3 h-3" />
                                  Цепочка: {validation.details.chainValid ? '✓' : '✗'}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs">
                                  <Info className="w-3 h-3" />
                                  Отзыв: {revocationLabel(validation.details.revocationStatus)}
                                </span>
                              </div>

                              {validation.errors.length > 0 && (
                                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                                  {validation.errors.map((e, i) => (
                                    <div key={i} className="flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                                      {e}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {validation.warnings.length > 0 && (
                                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                                  {validation.warnings.map((w, i) => (
                                    <div key={i} className="flex items-center gap-1">
                                      <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                                      {w}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {validation.details.chainDetails.length > 0 && (
                                <details className="mt-2">
                                  <summary className="text-xs text-gray-500 cursor-pointer">Цепочка доверия ({validation.details.chainDetails.length})</summary>
                                  <div className="mt-1 space-y-1 text-[11px] text-gray-600">
                                    {validation.details.chainDetails.map((c, i) => (
                                      <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded">
                                        <span className="font-mono text-[10px] text-gray-400">{i + 1}.</span>
                                        <span className="truncate flex-1">{c.subjectName}</span>
                                        {c.isTrustedRoot && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px]">Доверен</span>}
                                        {c.isRoot && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px]">Корневой</span>}
                                      </div>
                                    ))}
                                  </div>
                                </details>
                              )}
                              {validation.details.keyUsage.length > 0 && (
                                <details className="mt-2">
                                  <summary className="text-xs text-gray-500 cursor-pointer">Key Usage</summary>
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {validation.details.keyUsage.map((u, i) => (
                                      <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px]">{u}</span>
                                    ))}
                                  </div>
                                </details>
                              )}
                              {validation.details.extendedKeyUsage.length > 0 && (
                                <details className="mt-2">
                                  <summary className="text-xs text-gray-500 cursor-pointer">Extended Key Usage</summary>
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {validation.details.extendedKeyUsage.map((u, i) => (
                                      <span key={i} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] ${
                                        u.includes('qcSign') ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                      }`}>{u}</span>
                                    ))}
                                  </div>
                                </details>
                              )}
                            </>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-2">
                          {validation ? (
                            isValid && isQualified ? (
                              <ShieldCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                            ) : isValid ? (
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            )
                          ) : null}
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => validateCert(cert.thumbprint)}
                      disabled={isChecking}
                      title="Проверить снова"
                      className="flex-shrink-0 px-3 border-l border-gray-100 text-gray-400 hover:text-brand-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
