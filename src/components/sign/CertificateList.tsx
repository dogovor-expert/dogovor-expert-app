"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Check, Loader2, ShieldCheck, AlertTriangle, Calendar } from "lucide-react";
import type { CadesPlugin, CertValidationResult } from "@/lib/signCryptoPro";

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

interface CertificateListProps {
  onSelect: (cert: CertInfo) => void;
  selectedThumbprint?: string;
  filterQualifiedOnly?: boolean;
  className?: string;
}

/** Парсит дату в формате, который возвращает КриптоПро (зависит от локали системы) */
function parseCadesDate(dateStr: string): Date {
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  // Fallback для DD.MM.YYYY (русская локаль)
  const parts = dateStr.split(".");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    const parsed = new Date(`${year}-${month}-${day}`);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  // Fallback для MM/DD/YYYY (US локаль)
  const parts2 = dateStr.split("/");
  if (parts2.length === 3) {
    const [month, day, year] = parts2;
    const parsed = new Date(`${year}-${month}-${day}`);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return new Date(NaN);
}

function formatDate(dateStr: string): string {
  try {
    return parseCadesDate(dateStr).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getSubjectCN(subjectName: string): string {
  const match = subjectName.match(/CN=([^,]+)/);
  return match ? match[1] : subjectName;
}

function getIssuerCN(issuerName: string): string {
  const match = issuerName.match(/CN=([^,]+)/);
  return match ? match[1] : issuerName;
}

function isExpired(validTo: string): boolean {
  return parseCadesDate(validTo).getTime() < Date.now();
}

function isExpiringSoon(validTo: string): boolean {
  const diff = parseCadesDate(validTo).getTime() - Date.now();
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000; // 30 дней
}

export function CertificateList({
  onSelect,
  selectedThumbprint,
  filterQualifiedOnly = true,
  className = "",
}: CertificateListProps) {
  const [certificates, setCertificates] = useState<CertInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadCertificates = useCallback(async () => {
    if (typeof window === "undefined" || !window.cadesplugin) {
      setError("КриптоПро Browser Plugin не загружен");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let store: Awaited<ReturnType<CadesPlugin["CreateObjectAsync"]>> | null = null;

    try {
      const cadesplugin = await window.cadesplugin;

      store = await cadesplugin.CreateObjectAsync("CAdESCOM.Store");
      await store.Open(
        cadesplugin.CAPICOM_CURRENT_USER_STORE,
        cadesplugin.CAPICOM_MY_STORE,
        cadesplugin.CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED
      );

      const certs = await store.Certificates;
      const count = await certs.Count;

      const result: CertInfo[] = [];

      for (let i = 1; i <= count; i++) {
        const cert = await certs.Item(i);
        const hasPrivateKey = await cert.HasPrivateKey();

        if (!hasPrivateKey) continue;

        const thumbprint = await cert.Thumbprint;
        const subjectName = await cert.SubjectName;
        const issuerName = await cert.IssuerName;
        const validFrom = await cert.ValidFromDate;
        const validTo = await cert.ValidToDate;

        // Быстрая проверка квалифицированности (EKU)
        let isQualified = false;
        try {
          const extensions = await cert.Extensions;
          const extCount = await extensions.Count;
          for (let j = 1; j <= extCount; j++) {
            const ext = await extensions.Item(j);
            const oid = await ext.OID;
            if (oid === "1.2.643.7.1.1.1.1") {
              isQualified = true;
              break;
            }
          }
        } catch {
          // ignore
        }

        result.push({
          thumbprint,
          subjectName,
          issuerName,
          validFrom,
          validTo,
          isQualified,
          hasPrivateKey: true,
        });

        // Явное обнуление COM-ссылок для помощи GC
        // (в современных браузерах не критично, но полезно для IE/старого Edge)
      }

      setCertificates(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки сертификатов");
    } finally {
      if (store) {
        try {
          await store.Close();
        } catch {
          // ignore close errors
        }
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCertificates();
  }, [loadCertificates]);

  // useMemo вместо useState + useEffect — чище и без лишних рендеров
  const filtered = useMemo(() => {
    let list = certificates;
    if (filterQualifiedOnly) {
      list = list.filter((c) => c.isQualified);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.subjectName.toLowerCase().includes(q) ||
          c.issuerName.toLowerCase().includes(q) ||
          c.thumbprint.toLowerCase().includes(q)
      );
    }
    // Сортировка: квалифицированные первыми, потом по дате окончания (позже — выше)
    list.sort((a, b) => {
      if (a.isQualified !== b.isQualified) return b.isQualified ? 1 : -1;
      return parseCadesDate(b.validTo).getTime() - parseCadesDate(a.validTo).getTime();
    });
    return list;
  }, [certificates, filterQualifiedOnly, search]);

  // Кэшируем вычисления состояний для каждого сертификата
  const certStates = useMemo(
    () =>
      new Map(
        filtered.map((cert) => [
          cert.thumbprint,
          {
            expired: isExpired(cert.validTo),
            expiringSoon: isExpiringSoon(cert.validTo),
            selected: cert.thumbprint === selectedThumbprint,
          },
        ])
      ),
    [filtered, selectedThumbprint]
  );

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`} role="status" aria-live="polite">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          <span>Загрузка сертификатов из хранилища…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-3 ${className}`} role="alert">
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
        <button
          type="button"
          onClick={loadCertificates}
          className="text-sm text-blue-600 hover:underline"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className={`space-y-3 ${className}`} role="status">
        <div className="text-center py-6 text-sm text-gray-500">
          {filterQualifiedOnly
            ? "Квалифицированные сертификаты с закрытым ключом не найдены"
            : "Сертификаты с закрытым ключом не найдены"}
          {search && " (поиск не дал результатов)"}
        </div>
        {!filterQualifiedOnly && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="text-sm text-blue-600 hover:underline mx-auto block"
          >
            Показать все (в т.ч. неквалифицированные)
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`} role="listbox" aria-label="Список сертификатов">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по владельцу, издателю или отпечатку…"
          className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Поиск сертификатов"
        />
      </div>

      <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg bg-white" role="list">
        {filtered.map((cert) => {
          const state = certStates.get(cert.thumbprint)!;
          return (
            <button
              key={cert.thumbprint}
              type="button"
              onClick={() => onSelect(cert)}
              className={`
                w-full text-left p-3 hover:bg-gray-50 transition-colors
                ${state.selected ? "bg-blue-50 border-l-4 border-blue-500" : ""}
                ${state.expired ? "opacity-60" : ""}
              `}
              role="option"
              aria-selected={state.selected}
              aria-disabled={state.expired}
              disabled={state.expired}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {state.selected ? (
                    <Check className="w-5 h-5 text-blue-600" aria-hidden="true" />
                  ) : (
                    <div className="w-5 h-5 rounded border-2 border-gray-300" aria-hidden="true" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 truncate block">
                      {getSubjectCN(cert.subjectName)}
                    </span>
                    {cert.isQualified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-green-700 bg-green-50 rounded-full">
                        <ShieldCheck className="w-3 h-3" aria-hidden="true" />
                        Квалифицированная
                      </span>
                    )}
                    {state.expired && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-red-700 bg-red-50 rounded-full">
                        <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                        Срок истёк
                      </span>
                    )}
                    {state.expiringSoon && !state.expired && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-amber-700 bg-amber-50 rounded-full">
                        <Calendar className="w-3 h-3" aria-hidden="true" />
                        Скоро истечёт
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
                    <span>
                      <strong>Издатель:</strong>{" "}
                      {getIssuerCN(cert.issuerName)}
                    </span>
                    <span>
                      <strong>Действителен до:</strong>{" "}
                      {formatDate(cert.validTo)}
                      {state.expiringSoon && !state.expired && " ⚠"}
                    </span>
                    <span>
                      <strong>Отпечаток:</strong>{" "}
                      <code className="font-mono">{cert.thumbprint}</code>
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 text-center">
        Найдено: {filtered.length} {filtered.length === 1 ? "сертификат" : filtered.length < 5 ? "сертификата" : "сертификатов"}
        {filterQualifiedOnly && " (только квалифицированные)"}
      </p>
    </div>
  );
}