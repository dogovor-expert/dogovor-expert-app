'use client';
import { useState, useEffect, useCallback } from 'react';
import type { CertValidationResult } from '@/lib/signCryptoPro';

declare global {
  interface Window {
    cadesplugin?: Promise<any>;
    cadespluginLoaded?: boolean;
  }
}

export interface CertInfo {
  thumbprint: string;
  subjectName: string;
  issuerName: string;
  validFrom: string;
  validTo: string;
  isQualified: boolean;
  hasPrivateKey: boolean;
  validation?: CertValidationResult;
}

function emptyValidation(message: string): CertValidationResult {
  return {
    isValid: false,
    isQualified: false,
    errors: [message],
    warnings: [],
    details: {
      subjectName: '',
      issuerName: '',
      validFrom: '',
      validTo: '',
      thumbprint: '',
      keyUsage: [],
      extendedKeyUsage: [],
      hasPrivateKey: false,
      chainValid: false,
      chainDetails: [],
      revocationStatus: 'unknown',
    },
  };
}

export function useCryptoPro() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<CertInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState<string | null>(null);

  const initialize = useCallback(async () => {
    if (typeof window === 'undefined') return;

    try {
      if (!window.cadesplugin) {
        setError('КриптоПро Browser Plugin не найден. Установите плагин и перезагрузите страницу.');
        setReady(false);
        return;
      }

      await window.cadesplugin;
      setReady(true);
      setError(null);
    } catch (e: any) {
      setError('Ошибка инициализации КриптоПро: ' + (e.message || String(e)));
      setReady(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (document.readyState === 'complete') {
      void initialize();
    } else {
      window.addEventListener('load', () => void initialize());
      return () => window.removeEventListener('load', () => void initialize());
    }
  }, [initialize]);

  const loadCertificates = useCallback(async () => {
    if (!ready || !window.cadesplugin) return;

    setLoading(true);
    setError(null);

    try {
      const cadesplugin = await window.cadesplugin;

      const store = await cadesplugin.CreateObjectAsync('CAdESCOM.Store');
      await store.Open(
        cadesplugin.CAPICOM_CURRENT_USER_STORE,
        cadesplugin.CAPICOM_MY_STORE,
        cadesplugin.CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED
      );

      const certs = await store.Certificates;
      const count = await certs.Count;
      const result: CertInfo[] = [];

      for (let i = 1; i <= count; i++) {
        try {
          const cert = await certs.Item(i);
          const thumbprint = await cert.Thumbprint;
          const subject = await cert.SubjectName;
          const issuer = await cert.IssuerName;
          const validFrom = await cert.ValidFromDate;
          const validTo = await cert.ValidToDate;
          const hasPrivateKey = await cert.HasPrivateKey();

          const isQualified = 
            subject.includes('OGRN') || 
            subject.includes('ОГРН') ||
            subject.includes('SNILS') ||
            subject.includes('СНИЛС') ||
            subject.includes('INN') ||
            subject.includes('ИНН');

          if (hasPrivateKey) {
            result.push({
              thumbprint,
              subjectName: subject,
              issuerName: issuer,
              validFrom,
              validTo,
              isQualified,
              hasPrivateKey,
            });
          }
        } catch (e) {
          console.warn('Error reading certificate', i, e);
        }
      }

      await store.Close();

      const { validateCertificate } = await import('@/lib/signCryptoPro');
      const validated = await Promise.all(
        result.map(async (c): Promise<CertInfo> => {
          try {
            const validation = await validateCertificate(c.thumbprint, {
              checkRevocation: true,
              checkChain: true,
            });
            return { ...c, validation };
          } catch (e: any) {
            return { ...c, validation: emptyValidation('Ошибка валидации: ' + (e?.message || String(e))) };
          }
        })
      );

      setCertificates(validated.filter(c => c.isQualified || c.validation?.isQualified));
    } catch (e: any) {
      setError('Ошибка чтения сертификатов: ' + (e.message || String(e)));
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  }, [ready]);

  const validateCert = useCallback(async (thumbprint: string) => {
    setValidating(thumbprint);
    try {
      const { validateCertificate } = await import('@/lib/signCryptoPro');
      const result = await validateCertificate(thumbprint, { checkRevocation: true, checkChain: true });
      setCertificates(prev => prev.map(c => 
        c.thumbprint === thumbprint ? { ...c, validation: result } : c
      ));
      return result;
    } catch (e: any) {
      const failed = emptyValidation('Ошибка валидации: ' + (e?.message || String(e)));
      setCertificates(prev => prev.map(c => 
        c.thumbprint === thumbprint ? { ...c, validation: failed } : c
      ));
      return failed;
    } finally {
      setValidating(null);
    }
  }, []);

  const signData = useCallback(async (
    data: Uint8Array,
    thumbprint: string,
    options?: {
      detached?: boolean;
      encodingType?: number;
      addTimestamp?: boolean;
      tsaUrl?: string;
    }
  ): Promise<string> => {
    if (!window.cadesplugin) throw new Error('Плагин не загружен');

    const cadesplugin = await window.cadesplugin;

    const base64 = btoa(String.fromCharCode(...data));

    const signer = await cadesplugin.CreateObjectAsync('CAdESCOM.CPSigner');
    await signer.propset_Certificate(thumbprint);
    await signer.propset_Options(cadesplugin.CAPICOM_CERTIFICATE_INCLUDE_WHOLE_CHAIN);

    const cadesAttrs = await cadesplugin.CreateObjectAsync('CAdESCOM.CPAttribute');
    await cadesAttrs.propset_Name(cadesplugin.CAPICOM_AUTHENTICATED_ATTRIBUTE_SIGNING_TIME);
    await cadesAttrs.propset_Value(new Date());

    const attrs = await signer.AuthenticatedAttributes2;
    await attrs.Add(cadesAttrs);

    const signedData = await cadesplugin.CreateObjectAsync('CAdESCOM.CadesSignedData');
    await signedData.propset_ContentEncoding(cadesplugin.CADESCOM_BASE64_TO_BINARY);
    await signedData.propset_Content(btoa(String.fromCharCode(...data)));

    const encodingType = options?.encodingType ?? cadesplugin.CADESCOM_ENCODE_BASE64;
    const detached = options?.detached ?? false;
    const addTimestamp = options?.addTimestamp ?? false;
    const tsaUrl = options?.tsaUrl ?? 'https://freetsa.org/tsr';

    // TSA Timestamp (CAdES-X-Long Type 1)
    if (addTimestamp) {
      // Внимание: для полноценного TSA нужен HTTP запрос к TSA серверу
      console.warn('TSA timestamp требует отдельного HTTP запроса к TSA серверу');
    }

    const cadesType = addTimestamp
      ? cadesplugin.CADESCOM_CADES_X_LONG_TYPE_1
      : cadesplugin.CADESCOM_CADES_BES;

    const signature = await signedData.SignCades(
      signer,
      cadesType,
      detached,
      encodingType
    );

    return signature;
  }, []);

  return {
    ready,
    error,
    certificates,
    loading,
    validating,
    loadCertificates,
    validateCert,
    initialize,
    signData,
  };
}

export function loadCryptoProScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Not in browser'));
      return;
    }

    if (window.cadespluginLoaded) {
      resolve();
      return;
    }

    const existingScript = document.querySelector('script[src*="cadesplugin"]');
    if (existingScript) {
      window.cadespluginLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.cryptopro.ru/sites/default/files/products/cades/current_release_2_0/cadesplugin_api.js';
    script.async = true;
    script.onload = () => {
      window.cadespluginLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load cadesplugin_api.js'));
    document.head.appendChild(script);
  });
}