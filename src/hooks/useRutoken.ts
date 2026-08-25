'use client';
import { useState, useEffect, useCallback } from 'react';

declare global {
  interface Window {
    rutoken?: any;
  }
}

export interface RutokenCertificate {
  id: string;
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  hasPrivateKey: boolean;
  isQualified: boolean;
}

export function useRutoken() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plugin, setPlugin] = useState<any>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.rutoken) {
          resolve();
          return;
        }

        const existingScript = document.querySelector('script[src*="rutoken"]');
        if (existingScript) {
          const checkReady = setInterval(() => {
            if (window.rutoken) {
              clearInterval(checkReady);
              resolve();
            }
          }, 100);
          setTimeout(() => {
            clearInterval(checkReady);
            reject(new Error('Rutoken plugin timeout'));
          }, 10000);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://download.rutoken.ru/RutokenPlugIn/2.0.0/rutokenplugin.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load rutokenplugin.js'));
        document.head.appendChild(script);
      });
    };

    loadScript()
      .then(async () => {
        try {
          const rutoken = await window.rutoken.ready;
          setPlugin(rutoken);
          setReady(true);
          setError(null);
        } catch (e: any) {
          setError('Ошибка инициализации Рутокен: ' + (e.message || String(e)));
        }
      })
      .catch((e: any) => {
        setError('Не удалось загрузить Рутокен Web Plugin: ' + (e.message || String(e)));
      });
  }, []);

  const enumerateDevices = useCallback(async () => {
    if (!plugin) return [];

    setLoading(true);
    try {
      const devs = await plugin.enumerateDevices();
      setDevices(devs);
      return devs;
    } catch (e: any) {
      setError('Ошибка поиска устройств: ' + (e.message || String(e)));
      return [];
    } finally {
      setLoading(false);
    }
  }, [plugin]);

  const getCertificates = useCallback(async (deviceId?: string): Promise<RutokenCertificate[]> => {
    if (!plugin) return [];

    const devs: any[] = devices.length > 0 ? devices : await enumerateDevices();
    if (devs.length === 0) {
      setError('Рутокен не найден. Вставьте токен и нажмите «Обновить».');
      return [];
    }

    const targetDevice = deviceId ? devs.find((d: any) => d.id === deviceId) : devs[0];
    if (!targetDevice) return [];

    try {
      const certs = await plugin.enumerateCertificates(targetDevice.id, 'CERT_CATEGORY_USER');
      const result: RutokenCertificate[] = [];

      for (const cert of certs) {
        const hasPrivateKey = await plugin.getCertificateProperty(cert.id, 'HAS_PRIVATE_KEY');
        const subject = await plugin.getCertificateProperty(cert.id, 'SUBJECT_NAME');
        const issuer = await plugin.getCertificateProperty(cert.id, 'ISSUER_NAME');
        const validFrom = await plugin.getCertificateProperty(cert.id, 'VALID_FROM');
        const validTo = await plugin.getCertificateProperty(cert.id, 'VALID_TO');

        const isQualified = 
          subject.includes('OGRN') || 
          subject.includes('ОГРН') ||
          subject.includes('SNILS') ||
          subject.includes('СНИЛС') ||
          subject.includes('INN') ||
          subject.includes('ИНН');

        if (hasPrivateKey) {
          result.push({
            id: cert.id,
            subject,
            issuer,
            validFrom,
            validTo,
            hasPrivateKey,
            isQualified,
          });
        }
      }

      return result.filter(c => c.isQualified);
    } catch (e: any) {
      setError('Ошибка чтения сертификатов: ' + (e.message || String(e)));
      return [];
    }
  }, [plugin, devices, enumerateDevices]);

  const signHash = useCallback(async (
    certId: string,
    hash: Uint8Array,
    algorithm: 'GOST3411_2012_256' | 'GOST3411_2012_512' = 'GOST3411_2012_256'
  ): Promise<Uint8Array> => {
    if (!plugin) throw new Error('Плагин не загружен');

    try {
      const signature = await plugin.signHash(certId, hash, algorithm);
      return signature;
    } catch (e: any) {
      throw new Error('Ошибка подписи: ' + (e.message || String(e)));
    }
  }, [plugin]);

  const signData = useCallback(async (
    certId: string,
    data: Uint8Array,
    algorithm: 'GOST3411_2012_256' | 'GOST3411_2012_512' = 'GOST3411_2012_256'
  ): Promise<Uint8Array> => {
    const hashBuffer = await crypto.subtle.digest(
      algorithm === 'GOST3411_2012_256' ? 'SHA-256' : 'SHA-512',
      data as BufferSource
    );
    return signHash(certId, new Uint8Array(hashBuffer), algorithm);
  }, [signHash]);

  return {
    ready,
    error,
    plugin,
    devices,
    loading,
    enumerateDevices,
    getCertificates,
    signHash,
    signData,
  };
}

export function loadRutokenScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Not in browser'));
      return;
    }

    if (window.rutoken) {
      resolve();
      return;
    }

    const existingScript = document.querySelector('script[src*="rutoken"]');
    if (existingScript) {
      const checkReady = setInterval(() => {
        if (window.rutoken) {
          clearInterval(checkReady);
          resolve();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(checkReady);
        reject(new Error('Rutoken plugin timeout'));
      }, 10000);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://download.rutoken.ru/RutokenPlugIn/2.0.0/rutokenplugin.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load rutokenplugin.js'));
    document.head.appendChild(script);
  });
}