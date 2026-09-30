"use client";
import Link from "next/link";
import dynamicImport from "next/dynamic";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
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
  HardDrive,
  Copy,
  Calculator,
  FileSignature,
  Info,
} from "lucide-react";
import { getAllDrafts, clearDraft, clearDraftVersions, getDraftVersions, restoreDraftVersion, type DraftData, type DraftVersion } from "@/lib/autosave";
import { exportDocument, getConnectedProviders } from "@/lib/cloud/manager";
import { getVaultDoc, draftToVaultPayload } from "@/lib/vault/documents";
import { initVault } from "@/lib/vault/keyManager";
import { useVault } from "@/lib/vault/VaultProvider";
import type { CloudProviderId } from "@/lib/cloud/types";
import FolderPicker from "@/components/FolderPicker";
import CloudExportMenu from "@/components/cloud/CloudExportMenu";
import { usePaywall } from "@/hooks/usePaywall";
import { TEMPLATE_META } from "@/data/templatesMeta";
import Highlight from "@/components/ui/Highlight";
import { tokenGroups, textMatchesTokens } from "@/lib/search";
import { calcKindFromTemplateId, CALC_KIND_LABEL } from "@/lib/calcDoc";

// Диалог подписания УКЭП грузим лениво: он тянет КриптоПро-обвязку, которая
// нужна только в момент подписания.
const SignDialog = dynamicImport(
  () => import("@/components/sign/SignDialog").then((m) => ({ default: m.SignDialog })),
  { ssr: false }
);

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

interface DocumentsResponse {
  data?: ServerDoc[];
  hasMore?: boolean;
  nextCursor?: string | null;
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
  /** 3.10: протокол из калькулятора (синтетический template_id `calc-…`). */
  calc?: boolean;
  protocol?: string;
  /** UUID серверной записи documents — нужен для подписания УКЭП. */
  serverId?: string;
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
  calc: { variant: "amber" },
};

export default function DocumentsPage() {
  const router = useRouter();
  const { requireUnlock } = useVault();
  const { subscriptionActive: cloudPro, openPaywall: openCloudPaywall, modal: cloudPaywallModal } = usePaywall();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);
  // 5.1 (аудит): серверная cursor-пагинация вместо загрузки всего списка разом.
  const SERVER_PAGE = 20;
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [importCount, setImportCount] = useState(0);
  // Документы, оставшиеся на сервере после закрытия загрузки (30.09.2026).
  // Их нужно показать и предложить перенести в локальное шифрованное хранилище.
  const [serverDocCount, setServerDocCount] = useState(0);
  const [migratingAll, setMigratingAll] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importToast, setImportToast] = useState<string | null>(null);
  const [cloudProviders, setCloudProviders] = useState<Array<{id: string; name: string}>>([]);
  const [exporting, setExporting] = useState<string | null>(null);
  const [, setExportToast] = useState<string | null>(null);
  const [folderPicker, setFolderPicker] = useState<{ providerId: CloudProviderId; docId: string; format: "pdf" | "vault-backup" } | null>(null);

  const toDocItem = useCallback(
    (id: string, fields: Record<string, string>, savedAt: string, title?: string): DocItem => {
      // 3.10: синтетический протокол из калькулятора (нет в каталоге шаблонов).
      const calcKind = calcKindFromTemplateId(id);
      if (calcKind) {
        return {
          id,
          name: title?.trim() || CALC_KIND_LABEL[calcKind],
          typeName: "Расчёт",
          category: "calc",
          savedAt,
          fieldCount: 1,
          filledCount: 1,
          calc: true,
          protocol: fields?.protocol ?? "",
          raw: { templateId: id, values: fields ?? {}, checklist: {}, activeTab: "", savedAt },
        };
      }
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
    },
    []
  );

  const buildParams = (q: string, cursor?: string | null) => {
    const params = new URLSearchParams();
    params.set("limit", String(SERVER_PAGE));
    if (cursor) params.set("cursor", cursor);
    const tokens = tokenGroups(q);
    if (tokens.length > 0) {
      params.set("q", q.trim().slice(0, 100));
      // Русские названия шаблонов живут в TEMPLATE_META — резолвим запрос
      // в список template_id и просим сервер искать по ним + по title.
      const ids = TEMPLATE_META.filter((t) =>
        textMatchesTokens([t.name, t.id, t.category].join(" "), tokens)
      )
        .map((t) => t.id)
        .slice(0, 300);
      if (ids.length) params.set("tpls", ids.join(","));
    }
    return params;
  };

  const serverDocsToItems = (rows: ServerDoc[]) =>
    rows.map((s: ServerDoc) => ({
      ...toDocItem(s.template_id, s.fields, s.updated_at, s.title),
      serverId: s.id,
    }));

  const loadDocs = useCallback(
    async (q: string) => {
      setLoading(true);
      const local = getAllDrafts();
      const tokens = tokenGroups(q);
      // Точный список серверных template_id для счётчика импорта — lightweight
      // режим ids=1 (без JSONB fields), даже когда показана только страница.
      let serverIds = new Set<string>();
      try {
        const resIds = await fetch("/api/documents?ids=1");
        if (resIds.ok) {
          const { data } = (await resIds.json()) as { data?: ServerDoc[] };
          serverIds = new Set((data ?? []).map((s: ServerDoc) => s.template_id));
          setServerDocCount((data ?? []).length);
        }
      } catch {
        // offline
      }
      let items: DocItem[] = [];
      try {
        const res = await fetch(`/api/documents?${buildParams(q)}`);
        if (res.ok) {
          const { data, hasMore: hm, nextCursor: nc } = (await res.json()) as DocumentsResponse;
          items = serverDocsToItems(data ?? []);
          setHasMore(!!hm);
          setNextCursor(nc ?? null);
        } else {
          setHasMore(false);
          setNextCursor(null);
        }
      } catch {
        // offline → fallback к localStorage
        setHasMore(false);
        setNextCursor(null);
      }
      // 2.10: локальная (не синхронизированная) версия новее серверной —
      // показываем в списке её, иначе после офлайн-правок виден устаревший контент.
      const localById = new Map(local.map((d) => [d.templateId, d] as const));
      items = items.map((it) => {
        const d = localById.get(it.id);
        if (d && new Date(d.savedAt).getTime() > new Date(it.savedAt).getTime()) {
          return toDocItem(it.id, d.values, d.savedAt, it.name);
        }
        return it;
      });
      // 2.10: локальные черновики, которых нет на сервере, тоже видны в списке
      // (раньше полное локальное представление включалось только при пустом сервере).
      const extra: DocItem[] = local
        .filter((d) => !serverIds.has(d.templateId) && !items.some((i) => i.id === d.templateId))
        .filter((d) => {
          if (tokens.length === 0) return true;
          const t = TEMPLATE_META.find((x) => x.id === d.templateId);
          return textMatchesTokens([t?.name ?? "", d.templateId, t?.category ?? ""].join(" "), tokens);
        })
        .map((d) => toDocItem(d.templateId, d.values, d.savedAt));
      const notImported = local.filter((d) => !serverIds.has(d.templateId)).length;
      setImportCount(notImported);
      setDocs(items.length > 0 || serverIds.size > 0 ? [...items, ...extra] : extra);
      setLoading(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [toDocItem]
  );

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/documents?${buildParams(debouncedSearch, nextCursor)}`);
      if (res.ok) {
        const { data, hasMore: hm, nextCursor: nc } = (await res.json()) as DocumentsResponse;
        const items = serverDocsToItems(data ?? []);
        setDocs((prev) => {
          const seen = new Set(prev.map((d) => d.id));
          return [...prev, ...items.filter((i) => !seen.has(i.id))];
        });
        setHasMore(!!hm);
        setNextCursor(nc ?? null);
      }
    } catch {
      // keep current page
    } finally {
      setLoadingMore(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextCursor, loadingMore, debouncedSearch, toDocItem]);

  /**
   * Перенос черновиков в защищённое хранилище устройства.
   *
   * ⚠️ ДО 30.09.2026 здесь был `POST /api/import`: все черновики целиком,
   * вместе с историей версий, отправлялись в таблицу `documents` на сервере
   * открытым текстом. В этих данных — ФИО, ИНН, паспорт и адреса третьих лиц
   * (контрагентов по договору), то есть персональные данные людей, которые
   * о нашем аккаунте ничего не знают. На сервере они хранились без
   * шифрования; доступ закрывала только RLS-политика по user_id.
   *
   * Теперь перенос локальный: содержимое шифруется AES-256-GCM ключом
   * устройства и уходит в IndexedDB. На сервер не отправляется ничего.
   */
  const handleImport = async () => {
    const ok = await requireUnlock();
    if (!ok) {
      setImportToast("Операция отменена — хранилище осталось заблокированным");
      setTimeout(() => setImportToast(null), 4000);
      return;
    }
    setImporting(true);
    try {
      const drafts = getAllDrafts();
      if (!drafts.length) {
        setImportToast("Переносить нечего");
        setTimeout(() => setImportToast(null), 4000);
        return;
      }
      const { saveVaultDoc, draftToVaultPayload } = await import("@/lib/vault/documents");
      let moved = 0;
      for (const draft of drafts) {
        await saveVaultDoc(draft.templateId, draftToVaultPayload(draft));
        clearDraft(draft.templateId);
        clearDraftVersions(draft.templateId);
        moved++;
      }
      setImportCount(0);
      setImportToast(`${moved} документов перенесено в защищённое хранилище этого устройства`);
      setTimeout(() => setImportToast(null), 5000);
    } catch (e) {
      setImportToast("Не удалось перенести. Попробуйте позже.");
      setTimeout(() => setImportToast(null), 4000);
    } finally {
      setImporting(false);
      void loadDocs(debouncedSearch);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    void loadDocs(debouncedSearch);
  }, [loadDocs, debouncedSearch]);

  useEffect(() => {
    async function loadCloud() {
      await initVault();
      const providers = await getConnectedProviders();
      setCloudProviders(providers.map((p) => ({ id: p.id, name: p.name })));
    }
    void loadCloud();
  }, []);

  // Поиск выполняется на сервере (q + tpls из TEMPLATE_META), категория — на
  // клиенте по загруженной витрине. Глубокий поиск по значениям полей JSONB на
  // всех страницах потребовал бы tsvector-миграции — сознательно вне объёма 5.1.
  const filtered = docs
    .filter((d) => typeFilter === "all" || d.typeName === typeFilter)
    .sort((a, b) =>
      sortBy === "date"
        ? new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
        : a.name.localeCompare(b.name)
    );

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
    const server = (await fetch("/api/documents").then((r) =>
      r.ok ? r.json() : null
    )) as { data?: ServerDoc[] } | null;
    const rows = server?.data ?? [];
    const s = rows.find((x) => x.template_id === templateId);
    if (s) {
      try {
        await fetch(`/api/documents/${s.id}`, { method: "DELETE" });
      } catch {
        // ignore
      }
    }
    clearDraft(templateId);
    clearDraftVersions(templateId);
    void loadDocs(debouncedSearch);
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
    const server = (await fetch("/api/documents").then((r) =>
      r.ok ? r.json() : null
    )) as { data?: ServerDoc[] } | null;
    const rows = server?.data ?? [];
    const s = rows.find((x) => x.template_id === templateId);
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
      void loadDocs(debouncedSearch);
      setExportToast("Документ перенесён в защищённое хранилище на этом устройстве");
      setTimeout(() => setExportToast(null), 4000);
    } catch (e) {
      alert(`Ошибка миграции: ${(e as Error).message}`);
    }
  };

  /**
   * Массовый перенос документов с сервера в локальное шифрованное хранилище.
   *
   * Порядок важен: сначала читаем документ, шифруем и сохраняем в хранилище,
   * и только после успешной записи удаляем серверную копию. Иначе при ошибке
   * на середине данные потерялись бы с обеих сторон.
   */
  const handleMigrateAllToVault = async () => {
    const ok = await requireUnlock();
    if (!ok) {
      setImportToast("Операция отменена — хранилище осталось заблокированным");
      setTimeout(() => setImportToast(null), 4000);
      return;
    }
    setMigratingAll(true);
    try {
      const res = await fetch("/api/documents");
      const rows = ((await res.json().catch(() => null)) as { data?: ServerDoc[] } | null)?.data ?? [];
      if (!rows.length) {
        setImportToast("На сервере документов нет");
        setTimeout(() => setImportToast(null), 4000);
        return;
      }
      const { saveVaultDoc } = await import("@/lib/vault/documents");
      let moved = 0;
      for (const s of rows) {
        await saveVaultDoc(s.template_id, {
          values: (s.fields ?? {}) as Record<string, string>,
          checklist: (s.checklist ?? {}) as Record<string, boolean>,
          activeTab: "",
          savedAt: s.updated_at,
        });
        // Удаляем с сервера только после того, как копия легла в хранилище.
        await fetch(`/api/documents/${s.id}`, { method: "DELETE" });
        moved++;
      }
      setServerDocCount(0);
      setImportToast(`${moved} документов перенесено в хранилище и удалено с сервера`);
      setTimeout(() => setImportToast(null), 5000);
    } catch {
      setImportToast("Не удалось перенести все документы. Попробуйте позже.");
      setTimeout(() => setImportToast(null), 4000);
    } finally {
      setMigratingAll(false);
      void loadDocs(debouncedSearch);
    }
  };

  const handleOpen = (templateId: string) => {
    router.push(`/builder?template=${templateId}`);
  };

  const handlePreview = (templateId: string) => {
    router.push(`/preview?template=${templateId}`);
  };

  const handleExportPick = (
    templateId: string,
    providerId: string,
    providerName: string,
    format: "vault-backup" | "pdf"
  ) => {
    setFolderPicker({
      providerId: providerId as CloudProviderId,
      docId: templateId,
      format,
    });
    // Подсказка в тосте, что следующим шагом будет выбор папки
    setExportToast(`Куда сохранить в ${providerName}? Выберите папку`);
    setTimeout(() => setExportToast(null), 3500);
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
          { id: templateId, name: tpl?.name || templateId, fields: [] },
          vaultDoc.values,
          { qrSvg: null, previewTemplate: undefined }
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
          { id: templateId, name: tpl?.name || templateId, fields: [] },
          draft.values,
          { qrSvg: null, previewTemplate: undefined }
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
  // 3.10: просмотр протокола калькулятора (нет шаблона → не открываем в builder).
  const [calcViewDoc, setCalcViewDoc] = useState<DocItem | null>(null);
  const [calcCopied, setCalcCopied] = useState(false);
  const [signDoc, setSignDoc] = useState<DocItem | null>(null);

  const copyCalcProtocol = async () => {
    if (!calcViewDoc?.protocol) return;
    try {
      await navigator.clipboard.writeText(calcViewDoc.protocol);
      setCalcCopied(true);
      setTimeout(() => setCalcCopied(false), 2500);
    } catch {
      /* clipboard недоступен */
    }
  };

  const openHistory = (doc: DocItem) => {
    setHistoryDoc(doc);
    setHistoryVersions(getDraftVersions(doc.id));
  };

  const applyVersion = (v: DraftVersion) => {
    if (!historyDoc) return;
    restoreDraftVersion(historyDoc.id, v);
    setHistoryToast(`Версия от ${formatDate(v.savedAt)} восстановлена`);
    setHistoryDoc(null);
    void loadDocs(debouncedSearch);
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
              ? "Здесь появятся ваши документы"
              : `${docs.length} документов в ${docs.length === 1 ? "черновике" : "черновиках"}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { void loadDocs(debouncedSearch); }}
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

      {serverDocCount > 0 && (
        <div className="mb-6 p-4 rounded-xl border border-amber-300 bg-amber-50 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Info className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {serverDocCount} {serverDocCount === 1 ? "документ хранится" : "документов хранятся"} на нашем сервере
              </p>
              <p className="text-xs text-gray-600">
                Они попали сюда до 30 сентября 2026 — тогда существовала кнопка
                «Импортировать в аккаунт». Содержимое лежит без шифрования.
              </p>
              <p className="mt-1.5 text-xs text-gray-700">
                Загрузка отключена: новые документы остаются в зашифрованном хранилище
                этого устройства. Перенесите старые — копия сначала зашифруется
                локально, и только потом удалится с сервера.
              </p>
            </div>
          </div>
          <Button variant="primary" size="sm" disabled={migratingAll}
            onClick={() => { void handleMigrateAllToVault(); }}
            className="flex-shrink-0">
            {migratingAll && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            Перенести и удалить
          </Button>
        </div>
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
                Созданные до входа в аккаунт. Перенесите их, чтобы они были доступны на других устройствах.
              </p>
              <p className="mt-1.5 text-xs text-gray-700 flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-brand-600" aria-hidden />
                <span>
                  Содержимое <b>не уходит на сервер</b>: документы шифруются
                  ключом этого устройства и остаются в защищённом хранилище
                  браузера. В аккаунт при этом ничего не попадает — документы
                  не синхронизируются между устройствами.
                </span>
              </p>
            </div>
          </div>
          <Button            variant="primary"
            size="sm"
            onClick={() => { void handleImport(); }}
            disabled={importing}
            className="flex-shrink-0"
          >
            {importing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            Перенести в хранилище
          </Button>
        </div>
      )}

      {docs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Нет сохранённых документов"
          description="Начните заполнять форму в разделе «Создать документ» — черновики сохраняются автоматически и будут доступны с любого устройства."
          steps={["Выберите шаблон", "Заполните поля", "Скачайте PDF или Word"]}
          action={{ label: "Создать документ", href: "/builder" }}
          secondary={{ label: "Смотреть шаблоны", href: "/templates" }}
        />
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
                  }}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition-all"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
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
                {filtered.map((doc) => {
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
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${doc.calc ? "bg-amber-50" : "bg-brand-50"}`}>
                            {doc.calc ? (
                              <Calculator className="w-4 h-4 text-amber-600" />
                            ) : (
                              <FileText className="w-4 h-4 text-brand-500" />
                            )}
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
                        {doc.calc ? (
                          <span className="text-xs text-gray-500">протокол</span>
                        ) : (
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
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Clock className="w-3 h-3" />
                          {formatDate(doc.savedAt)}
                        </div>
                      </TableCell>
                       <TableCell>
                         <div className="flex items-center gap-1 relative">
                           {doc.calc ? (
                             <button
                               onClick={() => {
                                 setCalcViewDoc(doc);
                                 setCalcCopied(false);
                               }}
                               className="p-1.5 hover:bg-brand-50 rounded-lg text-brand-500 transition-colors"
                               title="Просмотр протокола расчёта"
                             >
                               <Eye className="w-4 h-4" />
                             </button>
                           ) : (
                             <button
                               onClick={() => handlePreview(doc.id)}
                               className="p-1.5 hover:bg-brand-50 rounded-lg text-brand-500 transition-colors"
                               title="Предпросмотр"
                             >
                               <Eye className="w-4 h-4" />
                             </button>
                           )}
                           {!doc.calc && (
                             <button
                               onClick={() => handleOpen(doc.id)}
                               className="p-1.5 hover:bg-brand-50 rounded-lg text-brand-500 transition-colors"
                               title="Открыть"
                             >
                               <Pencil className="w-4 h-4" />
                             </button>
                           )}
                           {!doc.calc && (
                             <button
                               onClick={() => openHistory(doc)}
                               className="p-1.5 hover:bg-brand-50 rounded-lg text-gray-600 hover:text-brand-500 transition-colors"
                               title="История версий"
                             >
                               <Clock className="w-4 h-4" />
                             </button>
                           )}
                           {!doc.calc && (
                             <CloudExportMenu
                               providers={cloudProviders}
                               busy={exporting === doc.id}
                               triggerTitle={
                                 cloudProviders.length > 0
                                   ? "Экспорт в облако: бэкап или PDF"
                                   : "Подключите Яндекс / Google / Dropbox"
                               }
                               onPick={(pid, pname, fmt) => handleExportPick(doc.id, pid, pname, fmt)}
                               onManage={() => router.push("/connections")}
                               subscriptionActive={cloudPro}
                               onUpgrade={openCloudPaywall}
                             />
                           )}
                           {!doc.calc && (
                             <button
                                onClick={() => { void handleMigrateToVault(doc.id); }}
                               className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 hover:text-blue-700 transition-colors"
                               title="Перенести в локальное защищённое хранилище (удалить с сервера)"
                             >
                               <HardDrive className="w-4 h-4" />
                             </button>
                           )}
                            {!doc.calc && doc.serverId && (
                              <button
                                onClick={() => setSignDoc(doc)}
                                className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-600 hover:text-emerald-700 transition-colors"
                                title="Подписать электронной подписью (УКЭП)"
                              >
                                <FileSignature className="w-4 h-4" />
                              </button>
                            )}
                            <button
                               onClick={() => { void handleDelete(doc.id); }}
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

          {(hasMore || filtered.length > 0) && (
            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
              <span>
                Загружено: {filtered.length}
                {hasMore ? " · есть ещё" : ""}
              </span>
              {hasMore && (
                <button
                  className="px-4 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 font-medium"
                  disabled={loadingMore}
                  onClick={() => { void loadMore(); }}
                >
                  {loadingMore ? "Загрузка…" : "Загрузить ещё"}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {calcViewDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Протокол расчёта"
          onClick={() => setCalcViewDoc(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 p-5 border-b border-gray-100">
              <div>
                <p className="text-[11px] font-mono uppercase text-amber-600">Расчёт из калькулятора</p>
                <h3 className="text-base font-bold text-gray-900 mt-0.5">{calcViewDoc.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Сохранён {formatDate(calcViewDoc.savedAt)}</p>
              </div>
              <button
                onClick={() => setCalcViewDoc(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"
                aria-label="Закрыть"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              <pre className="text-xs font-mono whitespace-pre-wrap break-words text-gray-800 bg-gray-50 border border-gray-200 rounded-xl p-4 leading-relaxed">
                {calcViewDoc.protocol || "Пусто"}
              </pre>
            </div>
            <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-100">
              <Button variant="secondary" size="sm" onClick={() => { void copyCalcProtocol(); }}>
                <Copy className="w-3.5 h-3.5" />
                {calcCopied ? "Скопировано" : "Копировать"}
              </Button>
              <Button variant="primary" size="sm" onClick={() => setCalcViewDoc(null)}>
                Закрыть
              </Button>
            </div>
          </div>
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
              onSelect={(path) => {
                void handleExportToCloudWithPath(folderPicker.docId, folderPicker.providerId, folderPicker.format, path).then(() => setFolderPicker(null));
              }}
              onCancel={() => setFolderPicker(null)}
              initialPath="/Dogovor.expert"
            />
          </div>
        </div>
      )}

      {signDoc?.serverId && (
        <SignDialog
          isOpen
          documentId={signDoc.serverId}
          documentTitle={signDoc.name}
          onClose={() => setSignDoc(null)}
        />
      )}

      {cloudPaywallModal}
    </div>
  );
}