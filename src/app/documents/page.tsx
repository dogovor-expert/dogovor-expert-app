"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/Table";
import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Trash2,
  Eye,
  Plus,
  RefreshCw,
  FileText,
  Clock,
  Pencil,
  X,
  Cloud,
  Upload,
  Loader2,
  HardDrive,
} from "lucide-react";
import { getAllDrafts, clearDraft, clearDraftVersions, getDraftVersions, restoreDraftVersion, type DraftData, type DraftVersion } from "@/lib/autosave";
import { exportDocument, getConnectedProviders } from "@/lib/cloud/manager";
import { getVaultDoc, draftToVaultPayload } from "@/lib/vault/documents";
import { initVault } from "@/lib/vault/keyManager";
import { useVault } from "@/lib/vault/VaultProvider";
import type { CloudProviderId } from "@/lib/cloud/types";
import FolderPicker from "@/components/FolderPicker";
import { TEMPLATE_META } from "@/data/templatesMeta";
import Highlight from "@/components/ui/Highlight";
import { tokenGroups, textMatchesTokens, scoreText } from "@/lib/search";

interface ServerDoc {
  id: string;
  template_id: string;
  title: string;
  fields: Record<string, string>;
  checklist: Record<string, boolean>;
  versions: DraftVersion[] | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface DocItem {
  id: string;
  name: string;
  typeName: string;
  category: string;
  savedAt: string;
  fieldCount: number;
  filledCount: number;
  raw: DraftData;
}

const CATEGORY_BADGE: Record<string, { variant: "blue" | "green" | "amber" | "gray" | "red" | "purple" }> = {
  auto: { variant: "blue" },
  realty: { variant: "amber" },
  business: { variant: "green" },
  finance: { variant: "green" },
  family: { variant: "purple" },
  other: { variant: "gray" },
  migration: { variant: "gray" },
  postal: { variant: "gray" },
};

export default function DocumentsPage() {
  const router = useRouter();
  const { requireUnlock } = useVault();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const [page, setPage] = useState(1);
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [importCount, setImportCount] = useState(0);
  const [importing, setImporting] = useState(false);
  const [importToast, setImportToast] = useState<string | null>(null);
  const [cloudProviders, setCloudProviders] = useState<Array<{id: string; name: string}>>([]);
  const [exporting, setExporting] = useState<string | null>(null);
  const [exportToast, setExportToast] = useState<string | null>(null);
  const [exportMenuOpen, setExportMenuOpen] = useState<string | null>(null);
  const [folderPicker, setFolderPicker] = useState<{ providerId: CloudProviderId; docId: string; format: "pdf" | "vault-backup" } | null>(null);
  const perPage = 10;

  const toDocItem = useCallback((id: string, fields: Record<string, string>, savedAt: string): DocItem => {
    const tpl = TEMPLATE_META.find((t) => t.id === id);
    const filledCount = Object.values(fields).filter(
      (v) => v && v.trim() !== ""
    ).length;
    return {
      id,
      name: tpl?.name || id,
      typeName: tpl?.category || "Прочее",
      category: tpl?.category || "other",
      savedAt,
      fieldCount: tpl?.fieldCount || 0,
      filledCount,
      raw: { templateId: id, values: fields, checklist: {}, activeTab: "", savedAt },
    };
  }, []);

  const loadDocs = useCallback(async () => {
    setLoading(true);
    let serverIds = new Set<string>();
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const { data } = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          serverIds = new Set(data.map((s: ServerDoc) => s.template_id));
          const items: DocItem[] = data.map((s: ServerDoc) =>
            toDocItem(s.template_id, s.fields, s.updated_at)
          );
          setDocs(items);
        }
      }
    } catch {
      // offline → fallback к localStorage
    }
    const local = getAllDrafts();
    const notImported = local.filter(
      (d) => !serverIds.has(d.templateId)
    ).length;
    setImportCount(notImported);
    if (serverIds.size === 0 && local.length > 0) {
      const items: DocItem[] = local.map((d) => {
        const tpl = TEMPLATE_META.find((t) => t.id === d.templateId);
        const filledCount = Object.values(d.values).filter(
          (v) => v && v.trim() !== ""
        ).length;
        return {
          id: d.templateId,
          name: tpl?.name || d.templateId,
          typeName: tpl?.category || "Прочее",
          category: tpl?.category || "other",
          savedAt: d.savedAt,
          fieldCount: tpl?.fieldCount || 0,
          filledCount,
          raw: d,
        };
      });
      setDocs(items);
    }
    setLoading(false);
  }, [toDocItem]);

  const handleImport = async () => {
    setImporting(true);
    try {
      const local = getAllDrafts();
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drafts: local }),
      });
      if (res.ok) {
        const { imported } = await res.json();
        setImportToast(`${imported} документов импортировано в аккаунт`);
        setImportCount(0);
        setTimeout(() => setImportToast(null), 4000);
      } else {
        setImportToast("Не удалось импортировать. Попробуйте позже.");
        setTimeout(() => setImportToast(null), 4000);
      }
    } finally {
      setImporting(false);
      loadDocs();
    }
  };

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  useEffect(() => {
    async function loadCloud() {
      await initVault();
      const providers = await getConnectedProviders();
      setCloudProviders(providers.map((p) => ({ id: p.id, name: p.name })));
    }
    loadCloud();
  }, []);

  useEffect(() => {
    function handleClickOutside() {
      setExportMenuOpen(null);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = docs
    .filter((d) => {
      if (typeFilter !== "all" && d.typeName !== typeFilter) return false;
      const tokens = tokenGroups(search);
      if (tokens.length === 0) return true;
      const content = [
        d.name,
        d.typeName,
        d.category,
        ...Object.values(d.raw?.values ?? {}),
      ].join(" ");
      return textMatchesTokens(content, tokens);
    })
    .sort((a, b) =>
      sortBy === "date"
        ? new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
        : a.name.localeCompare(b.name)
    );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const categories = Array.from(new Set(docs.map((d) => d.typeName)));

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = async (templateId: string) => {
    const server = await fetch("/api/documents").then((r) =>
      r.ok ? r.json() : null
    );
    const rows = server?.data ?? [];
    const s = rows.find((x: ServerDoc) => x.template_id === templateId);
    if (s) {
      try {
        await fetch(`/api/documents/${s.id}`, { method: "DELETE" });
      } catch {
        // ignore
      }
    }
    clearDraft(templateId);
    clearDraftVersions(templateId);
    loadDocs();
  };

  const handleMigrateToVault = async (templateId: string) => {
    // Гарантируем расшифровку хранилища: тихо через deviceKey,
    // при необходимости — диалог пароля.
    const ok = await requireUnlock();
    if (!ok) {
      setExportToast("Операция отменена — хранилище осталось заблокированным");
      setTimeout(() => setExportToast(null), 4000);
      return;
    }
    const server = await fetch("/api/documents").then((r) =>
      r.ok ? r.json() : null
    );
    const rows = server?.data ?? [];
    const s = rows.find((x: ServerDoc) => x.template_id === templateId);
    if (!s) return;
    try {
      // Сохраняем в vault
      const { saveVaultDoc, draftToVaultPayload } = await import("@/lib/vault/documents");
      const { loadDraft } = await import("@/lib/autosave");
      const draft = loadDraft(templateId);
      if (draft) {
        await saveVaultDoc(templateId, draftToVaultPayload(draft));
      } else {
        await saveVaultDoc(templateId, {
          values: s.fields,
          checklist: s.checklist,
          activeTab: "",
          savedAt: s.updated_at,
        });
      }
      // Удаляем с сервера
      await fetch(`/api/documents/${s.id}`, { method: "DELETE" });
      clearDraft(templateId);
      clearDraftVersions(templateId);
      loadDocs();
      setExportToast("Документ перенесён в защищённое хранилище на этом устройстве");
      setTimeout(() => setExportToast(null), 4000);
    } catch (e) {
      alert(`Ошибка миграции: ${(e as Error).message}`);
    }
  };

  const handleOpen = (templateId: string) => {
    router.push(`/builder?template=${templateId}`);
  };

  const handlePreview = (templateId: string) => {
    router.push(`/preview?template=${templateId}`);
  };

  const handleExportToCloud = async (templateId: string, providerId: string) => {
    setExportMenuOpen(null);
    setFolderPicker({
      providerId: providerId as CloudProviderId,
      docId: templateId,
      format: "vault-backup",
    });
  };

  const handleExportToCloudWithPath = async (templateId: string, providerId: CloudProviderId, format: "pdf" | "vault-backup", folderPath: string) => {
    setExporting(templateId);
    setExportToast(null);
    try {
      // Читаем vault-документ: при блокировке — тихая разблокировка/диалог
      const ok = await requireUnlock();
      if (!ok) {
        setExportToast("Операция отменена — хранилище осталось заблокированным");
        setTimeout(() => setExportToast(null), 4000);
        return;
      }
      // Получаем документ из vault (если есть) или из localStorage
      const vaultDoc = await getVaultDoc(templateId);
      let pdfBlob: Blob | undefined;
      let vaultBlob: Blob | undefined;
      let fileName: string;
      const tpl = TEMPLATE_META.find((t) => t.id === templateId);
      if (vaultDoc) {
        vaultBlob = new Blob([JSON.stringify(vaultDoc)], { type: "application/json" });
        // Генерируем PDF для альтернативы
        const { renderTemplateDocument } = await import("@/lib/renderDocument");
        const { buildPdf } = await import("@/lib/exportPdf");
        const html = renderTemplateDocument(
          { id: templateId, name: tpl?.name || templateId, fields: [] } as any,
          vaultDoc.values,
          { qrSvg: null, signSeller: vaultDoc.esignSeller, signBuyer: vaultDoc.esignBuyer, previewTemplate: undefined }
        );
        const { blob } = await buildPdf(html, { design: "classic", pageNumbers: true });
        pdfBlob = blob;
        fileName = `${tpl?.name || templateId}_${new Date().toISOString().slice(0, 10)}`;
      } else {
        // fallback: localStorage draft
        const { loadDraft } = await import("@/lib/autosave");
        const draft = loadDraft(templateId);
        if (!draft) throw new Error("Документ не найден");
        const { renderTemplateDocument } = await import("@/lib/renderDocument");
        const { buildPdf } = await import("@/lib/exportPdf");
        const html = renderTemplateDocument(
          { id: templateId, name: tpl?.name || templateId, fields: [] } as any,
          draft.values,
          { qrSvg: null, signSeller: null, signBuyer: null, previewTemplate: undefined }
        );
        const { blob } = await buildPdf(html, { design: "classic", pageNumbers: true });
        pdfBlob = blob;
        vaultBlob = new Blob([JSON.stringify(draftToVaultPayload(draft))], { type: "application/json" });
        fileName = `${tpl?.name || templateId}_${new Date().toISOString().slice(0, 10)}`;
      }
      await exportDocument(providerId, { pdfBlob, vaultBlob }, {
        format,
        fileName,
        remotePath: folderPath,
      });
      setExportToast(`Экспортировано в ${cloudProviders.find((p) => p.id === providerId)?.name || providerId}`);
      setTimeout(() => setExportToast(null), 4000);
    } catch (e) {
      setExportToast(`Ошибка: ${(e as Error).message}`);
      setTimeout(() => setExportToast(null), 4000);
    } finally {
      setExporting(null);
    }
  };

  const [historyDoc, setHistoryDoc] = useState<DocItem | null>(null);
  const [historyVersions, setHistoryVersions] = useState<DraftVersion[]>([]);
  const [historyToast, setHistoryToast] = useState<string | null>(null);

  const openHistory = (doc: DocItem) => {
    setHistoryDoc(doc);
    setHistoryVersions(getDraftVersions(doc.id));
  };

  const applyVersion = (v: DraftVersion) => {
    if (!historyDoc) return;
    restoreDraftVersion(historyDoc.id, v);
    setHistoryToast(`Версия от ${formatDate(v.savedAt)} восстановлена`);
    setHistoryDoc(null);
    loadDocs();
    setTimeout(() => setHistoryToast(null), 3000);
  };

  const formatVersionTime = (iso: string) =>
    new Date(iso).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Мои документы</h1>
          <p className="text-gray-600 mt-1">
            {docs.length === 0
              ? "Пока нет документов — создайте первый"
              : `${docs.length} документов в ${docs.length === 1 ? "черновике" : "черновиках"}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadDocs}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            title="Обновить"
          >
            <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link href="/builder">
            <Button variant="primary" size="md">
              <Plus className="w-4 h-4" />
              Новый документ
            </Button>
          </Link>
        </div>
      </div>

      {/* Подсказка про облачные диски — пока не подключён ни один */}
      {cloudProviders.length === 0 && (
        <Link
          href="/connections"
          className="mb-6 flex items-center gap-3 p-4 rounded-xl border border-dashed border-gray-300 bg-white hover:border-brand-400 hover:bg-brand-50/40 transition-colors group"
        >
          <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-brand-100 flex items-center justify-center flex-shrink-0 transition-colors">
            <Cloud className="w-4.5 h-4.5 text-gray-500 group-hover:text-brand-600 transition-colors" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              Подключите облачный диск для резервных копий
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              Яндекс.Диск, Google Drive или Dropbox — документы выгружаются
              в зашифрованном виде, только по вашему нажатию.
            </p>
          </div>
          <span className="text-sm font-medium text-brand-600 flex-shrink-0">
            Настроить →
          </span>
        </Link>
      )}

      {importCount > 0 && (
        <div className="mb-6 p-4 rounded-xl border border-brand-200 bg-brand-50/60 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
              <Plus className="w-4 h-4 text-brand-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                В этом браузере найдено {importCount} {importCount === 1 ? "черновик" : importCount < 5 ? "черновика" : "черновиков"}
              </p>
              <p className="text-xs text-gray-600">
                Созданные до входа в аккаунт. Перенесите их, чтобы они были всегда с вами.
              </p>
            </div>
          </div>
          <Button            variant="primary"
            size="sm"
            onClick={handleImport}
            disabled={importing}
            className="flex-shrink-0"
          >
            {importing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            Импортировать в аккаунт
          </Button>
        </div>
      )}

      {docs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-brand-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Нет сохранённых документов
          </h3>
          <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">
            Начните заполнять форму в разделе «Создать документ» — документы автоматически сохраняются в черновики
          </p>
          <Link href="/builder">
            <Button variant="primary" size="md">
              <Plus className="w-4 h-4" />
              Создать первый документ
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-soft">
          <div className="p-5 border-b border-gray-100 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="text"
                  placeholder="Поиск документов..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition-all"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="all">Все типы</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() =>
                    setSortBy(sortBy === "date" ? "name" : "date")
                  }
                  className="flex items-center gap-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  {sortBy === "date" ? "по дате" : "по имени"}
                  <Clock className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table variant="striped">
              <TableHead>
                <TableRow>
                  <TableHeader>Документ</TableHeader>
                  <TableHeader>Категория</TableHeader>
                  <TableHeader>Заполнение</TableHeader>
                  <TableHeader>Сохранён</TableHeader>
                  <TableHeader className="w-24"></TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {paged.map((doc) => {
                  const badge = CATEGORY_BADGE[doc.category] || {
                    variant: "gray" as const,
                  };
                  const progress =
                    doc.fieldCount > 0
                      ? Math.round((doc.filledCount / doc.fieldCount) * 100)
                      : 0;
                  return (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-brand-500" />
                          </div>
                          <span className="font-medium text-gray-900 text-sm">
                            <Highlight text={doc.name} query={search} />
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={badge.variant} size="sm">
                          {doc.typeName}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                progress === 100
                                  ? "bg-emerald-500"
                                  : progress > 50
                                    ? "bg-brand-500"
                                    : "bg-amber-500"
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">
                            {doc.filledCount}/{doc.fieldCount}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Clock className="w-3 h-3" />
                          {formatDate(doc.savedAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 relative">
                          <button
                            onClick={() => handlePreview(doc.id)}
                            className="p-1.5 hover:bg-brand-50 rounded-lg text-brand-500 transition-colors"
                            title="Предпросмотр"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpen(doc.id)}
                            className="p-1.5 hover:bg-brand-50 rounded-lg text-brand-500 transition-colors"
                            title="Открыть"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openHistory(doc)}
                            className="p-1.5 hover:bg-brand-50 rounded-lg text-gray-600 hover:text-brand-500 transition-colors"
                            title="История версий"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExportMenuOpen(exportMenuOpen === doc.id ? null : doc.id);
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              exportMenuOpen === doc.id
                                ? "bg-brand-100 text-brand-600"
                                : "hover:bg-gray-100 text-gray-600"
                            }`}
                            title={cloudProviders.length > 0 ? "Экспорт в облако" : "Подключить облачный диск"}
                          >
                            <Cloud className="w-4 h-4" />
                          </button>
                          {exportMenuOpen === doc.id && (
                            <div
                              className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-10"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {cloudProviders.length === 0 ? (
                                <>
                                  <p className="px-3 py-2 text-xs text-gray-500 leading-snug">
                                    Облачный диск ещё не подключён
                                  </p>
                                  <Link
                                    href="/connections"
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-brand-600 hover:bg-brand-50"
                                  >
                                    <Cloud className="w-4 h-4" />
                                    Подключить Яндекс/Google/Dropbox
                                  </Link>
                                </>
                              ) : (
                                <>
                                  {cloudProviders.map((p) => (
                                    <div key={p.id} className="px-2 py-1">
                                      <p className="px-3 py-1 text-xs font-medium text-gray-500 uppercase">{p.name}</p>
                                      {["vault-backup", "pdf"].map((fmt) => (
                                        <button
                                          key={fmt}
                                          onClick={() => {
                                            handleExportToCloud(doc.id, p.id);
                                            setExportMenuOpen(null);
                                          }}
                                          disabled={exporting === doc.id}
                                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                          <Upload className="w-4 h-4" />
                                          {fmt === "vault-backup" ? "Vault backup (.json)" : "PDF (.pdf)"}
                                          {exporting === doc.id && (
                                            <span className="ml-auto">
                                              <Loader2 className="w-4 h-4 animate-spin" />
                                            </span>
                                          )}
                                        </button>
                                      ))}
                                    </div>
                                  ))}
                                </>
                              )}
                              <div className="border-t border-gray-100 mt-1 pt-1">
                                <Link
                                  href="/connections"
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-brand-600 hover:bg-brand-50"
                                >
                                  <Plus className="w-4 h-4" />
                                  Управление дисками…
                                </Link>
                              </div>
                            </div>
                          )}
                          <button
                            onClick={() => handleMigrateToVault(doc.id)}
                            className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 hover:text-blue-700 transition-colors"
                            title="Перенести в локальное защищённое хранилище (удалить с сервера)"
                          >
                            <HardDrive className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-gray-600 hover:text-red-500 transition-colors"
                            title="Удалить"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
              <span>
                {(page - 1) * perPage + 1}–
                {Math.min(page * perPage, filtered.length)} из {filtered.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Назад
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      className={`w-8 h-8 rounded-lg text-sm font-medium ${
                        p === page
                          ? "bg-brand-500 text-white"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Вперёд
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {historyDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setHistoryDoc(null)}
        >
          <div
            className="bg-white rounded-2xl p-5 w-full max-w-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-0.5">
                  История версий — {historyDoc.name}
                </h3>
                <p className="text-[11px] text-gray-600">
                  Версии создаются автоматически при работе с документом
                </p>
              </div>
              <button
                onClick={() => setHistoryDoc(null)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {historyVersions.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-600">
                  Версий пока нет. Откройте документ и сохраните изменения —
                  версии появятся автоматически.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {historyVersions.map((v, i) => {
                  const filled = Object.values(v.values).filter(
                    (x) => x && x.trim() !== ""
                  ).length;
                  const isCurrent = historyDoc.raw.savedAt === v.savedAt;
                  return (
                    <div
                      key={i}
                      className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${
                        isCurrent
                          ? "border-brand-200 bg-brand-50/50"
                          : "border-gray-100 bg-gray-50"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-800">
                          {i === 0 ? "Последняя версия" : `Версия от ${formatVersionTime(v.savedAt)}`}
                        </p>
                        <p className="text-[10px] text-gray-600">
                          {filled} полей заполнено
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {isCurrent && (
                          <Badge variant="blue" size="sm">Текущая</Badge>
                        )}
                        <button
                          onClick={() => applyVersion(v)}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-brand-500 text-white hover:bg-brand-600 transition-colors"
                        >
                          Восстановить
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {historyToast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium z-50 animate-fade-in">
          {historyToast}
        </div>
      )}

      {importToast && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium z-50 animate-fade-in">
          {importToast}
        </div>
      )}

      {folderPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setFolderPicker(null)}>
          <div
            className="bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <FolderPicker
              providerId={folderPicker.providerId}
              onSelect={async (path) => {
                await handleExportToCloudWithPath(folderPicker.docId, folderPicker.providerId, folderPicker.format, path);
                setFolderPicker(null);
              }}
              onCancel={() => setFolderPicker(null)}
              initialPath="/Dogovor.expert"
            />
          </div>
        </div>
      )}
    </div>
  );
}