"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  Cloud,
  CheckCircle,
  XCircle,
  Settings,
  HardDrive,
  Download,
  Upload,
  ExternalLink,
  AlertTriangle,
  Info,
  Loader2,
  X,
} from "lucide-react";
import {
  getAllProviders,
  getConfig,
  setClientId,
  connectProvider,
  disconnectProvider,
  getConnectedProviders,
  exportAllVaultDocuments,
  listCloudFiles,
  importVaultFromCloud,
} from "@/lib/cloud/manager";
import { listVaultDocs, getVaultDoc } from "@/lib/vault/documents";
import { initVault, isUnlocked } from "@/lib/vault/keyManager";
import type { CloudProviderId } from "@/lib/cloud/types";

interface ProviderStatus {
  id: CloudProviderId;
  name: string;
  description: string;
  connected: boolean;
  userInfo?: { name?: string; email?: string };
  clientId: string;
  connecting?: boolean;
  error?: string;
}

export default function ConnectionsPage() {
  const [statuses, setStatuses] = useState<ProviderStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [vaultReady, setVaultReady] = useState(false);
  const [exporting, setExporting] = useState<CloudProviderId | null>(null);
  const [exportResult, setExportResult] = useState<{ success: number; failed: string[] } | null>(null);
  const [importing, setImporting] = useState<CloudProviderId | null>(null);
  const [importFiles, setImportFiles] = useState<Array<{ name: string; path: string; size: number; modified: string }> | null>(null);
  const [importPassphrase, setImportPassphrase] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      await initVault();
      setVaultReady(true);
      await refresh();
    }
    init();
  }, []);

  const refresh = async () => {
    setLoading(true);
    const providers = getAllProviders();
    const connected = await getConnectedProviders();
    const connectedMap = new Map(connected.map((c) => [c.id, c]));
    const newStatuses: ProviderStatus[] = providers.map((p) => {
      const cfg = getConfig(p.id);
      const conn = connectedMap.get(p.id);
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        connected: !!conn,
        userInfo: conn?.userInfo,
        clientId: cfg.clientId,
      };
    });
    setStatuses(newStatuses);
    setLoading(false);
  };

  const handleClientIdChange = (id: CloudProviderId, value: string) => {
    setClientId(id, value);
    setStatuses((s) => s.map((st) => (st.id === id ? { ...st, clientId: value } : st)));
  };

  const handleConnect = async (id: CloudProviderId) => {
    setStatuses((s) => s.map((st) => (st.id === id ? { ...st, connecting: true, error: undefined } : st)));
    try {
      await connectProvider(id);
      await refresh();
    } catch (e) {
      setStatuses((st) => st.map((s) => (s.id === id ? { ...s, error: (e as Error).message, connecting: false } : s)));
    }
  };

  const handleDisconnect = async (id: CloudProviderId) => {
    await disconnectProvider(id);
    await refresh();
  };

  const handleExportAll = async (id: CloudProviderId) => {
    setExporting(id);
    setExportResult(null);
    try {
      const docs = [];
      const metaList = await listVaultDocs();
      for (const meta of metaList) {
        const payload = await getVaultDoc(meta.templateId);
        if (payload) docs.push({ meta, payload });
      }
      const result = await exportAllVaultDocuments(id, docs);
      setExportResult(result);
    } catch (e) {
      setExportResult({ success: 0, failed: [(e as Error).message] });
    } finally {
      setExporting(null);
    }
  };

  const handleListImportFiles = async (id: CloudProviderId) => {
    setImporting(id);
    setImportFiles(null);
    setImportError(null);
    setImportSuccess(null);
    setImportPassphrase("");
    try {
      const files = await listCloudFiles(id);
      setImportFiles(files.filter((f) => f.name.endsWith(".json")));
    } catch (e) {
      setImportError((e as Error).message);
    } finally {
      setImporting(null);
    }
  };

  const handleImportFile = async (id: CloudProviderId, filePath: string) => {
    setImportError(null);
    setImportSuccess(null);
    try {
      await importVaultFromCloud(id, filePath, importPassphrase || undefined);
      setImportSuccess("Хранилище успешно восстановлено из облака!");
      setImportFiles(null);
      setImportPassphrase("");
    } catch (e) {
      setImportError((e as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          <span className="ml-3 text-gray-600">Загрузка подключений…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Облачные диски</h1>
        <p className="text-gray-600 mt-1">
          Подключите Яндекс.Диск, Google Drive или Dropbox для экспорта документов.
          Файлы загружаются из вашего локального зашифрованного хранилища — сервер
          Dogovor.expert не видит их содержимое.
        </p>
      </div>

      {statuses.map((st) => (
        <Card key={st.id} className="border-gray-200">
          <div className="flex flex-row items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                <Cloud className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{st.name}</h3>
                <p className="text-sm text-gray-600">{st.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {st.connected ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Подключено
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600">
                  <XCircle className="w-3.5 h-3.5" />
                  Не подключено
                </span>
              )}
            </div>
          </div>

          <div className="p-4 space-y-4">
            {!st.connected ? (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Client ID приложения
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Введите Client ID из консоли провайдера"
                      value={st.clientId}
                      onChange={(e) => handleClientIdChange(st.id, e.target.value)}
                      className="flex-1"
                    />
                    {st.clientId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleClientIdChange(st.id, "")}
                        title="Очистить"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Client ID можно получить в консоли разработчика провайдера. Redirect URI:
                    <code className="bg-gray-100 px-1 rounded">
                      {window.location.origin}/connections
                    </code>
                  </p>
                </div>

                {st.error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {st.error}
                  </div>
                )}

                <Button
                  onClick={() => handleConnect(st.id)}
                  disabled={!st.clientId || st.connecting}
                  className="w-full"
                >
                  {st.connecting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Подключение…
                    </>
                  ) : (
                    "Подключить"
                  )}
                </Button>
              </>
            ) : (
              <>
                {st.userInfo && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                      <HardDrive className="w-4 h-4 text-brand-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {st.userInfo.name || "Пользователь"}
                      </p>
                      {st.userInfo.email && (
                        <p className="text-xs text-gray-600">{st.userInfo.email}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleExportAll(st.id)}
                    disabled={exporting === st.id || !vaultReady}
                    className="flex-1"
                  >
                    {exporting === st.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Экспорт…
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Экспорт всех документов (vault backup)
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleListImportFiles(st.id)}
                    disabled={importing === st.id || !vaultReady}
                    className="flex-1"
                  >
                    {importing === st.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Загрузка списка…
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Импорт из облака
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleDisconnect(st.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    Отключить
                  </Button>
                </div>
              </>
            )}
          </div>

          {exportResult && st.id === statuses.find((s) => s.connected)?.id && (
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="font-medium text-emerald-700">
                  Экспорт завершён: {exportResult.success} файлов
                </span>
                {exportResult.failed.length > 0 && (
                  <>
                    <span className="text-amber-600">, ошибок: {exportResult.failed.length}</span>
                    <button
                      onClick={() => alert(exportResult.failed.join("\n"))}
                      className="text-xs underline hover:text-amber-700"
                    >
                      детали
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {importFiles && importing === st.id && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setImportFiles(null)}>
              <div
                className="bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Импорт из {st.name}</h3>
                  <button onClick={() => setImportFiles(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {importFiles.length === 0 ? (
                  <div className="text-center py-8 text-gray-600">
                    <p>В папке /Dogovor.expert/vault-backup нет файлов .json</p>
                    <p className="text-xs mt-2">Сначала сделайте экспорт (vault backup)</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {importFiles.map((f) => (
                      <button
                        key={f.path}
                        onClick={() => handleImportFile(st.id, f.path)}
                        disabled={!!importPassphrase && importPassphrase.length < 8}
                        className="w-full text-left p-3 rounded-xl border hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <div className="font-medium text-gray-900 truncate">{f.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          <span>{(f.size / 1024).toFixed(1)} KB</span>
                          <span>{new Date(f.modified).toLocaleString("ru-RU")}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {(importFiles?.length ?? 0) > 0 && (
                  <div className="mt-4 space-y-2">
                    <Input
                      label="Пароль от бэкапа (если был установлен)"
                      type="password"
                      value={importPassphrase}
                      onChange={(e) => setImportPassphrase(e.target.value)}
                      placeholder="Оставьте пустым, если пароля не было"
                    />
                    {importError && <p className="text-xs text-red-500">{importError}</p>}
                    {importSuccess && <p className="text-xs text-emerald-600">{importSuccess}</p>}
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      ))}

      <Card className="border-amber-200 bg-amber-50/50">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-800 space-y-1">
              <p className="font-medium">Важные заметки о приватности:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>Яндекс.Диск</strong> — серверы в РФ, полностью совместим с 152-ФЗ.
                  Рекомендуем для юридических документов.
                </li>
                <li>
                  <strong>Google Drive / Dropbox</strong> — серверы в США. Передача ПД
                  граждан РФ на эти серверы требует отдельного согласия и уведомления
                  РКН (ст. 12 152-ФЗ). Используйте осознанно.
                </li>
                <li>
                  Экспорт «Vault backup» загружает <strong>уже зашифрованные</strong>
                  данные (AES-256-GCM). Даже если облачный провайдер получит доступ к
                  файлам, он не прочитает содержимое без вашего пароля/устройства.
                </li>
                <li>
                  PDF-экспорт загружает <strong>расшифрованный</strong> документ.
                  Используйте только для печати/передачи контрагенту, понимая риски.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}