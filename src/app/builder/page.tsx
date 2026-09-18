"use client";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  FileText,
  Shield,
  Check,
  AlertTriangle,
  Clock,
  Copy,
  Calculator,
  Eye,
  Wrench,
  Crown,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { LEGAL_TEMPLATES } from "@/data/legalTemplates";
import type { LegalTemplate, TemplateField } from "@/data/types";
import {
  runLegalAudit,
  requiredProgress,
  type AuditResult,
} from "@/lib/validation";
import { calculateCosts, numberToWords } from "@/lib/calculator";
import { saveDraft, loadDraft, clearDraft, clearDraftVersions, getAllDrafts, pushDraftVersion, DRAFT_SAVE_ERROR_EVENT, type DraftData } from "@/lib/autosave";
import { syncDraft, syncDelete, setUserFlag } from "@/lib/sync";
import { createClient } from "@/lib/supabase/client";
import { renderTemplateDocument, buildPackValues } from "@/lib/renderDocument";
import { migrateFieldValues } from "@/lib/fieldMigration";
import { Modal } from "@/components/ui/Modal";
import { getSigning, canShowSignSheet } from "@/data/signingMeta";
import { type DesignId } from "@/lib/docDesign";
import { buildTemplateDefaults, getGreeting, normalizeTypography, todayStr } from "@/lib/format";
import { downloadBytes } from "@/lib/converter/download";
import { uint8ToBase64 } from "@/lib/bytes";
import { track, goals } from "@/lib/analytics";
import { useVisualViewport } from "@/hooks/useVisualViewport";
import dynamic from "next/dynamic";
import ProgressSteps from "@/components/builder/ProgressSteps";
import TemplateSelector from "@/components/builder/TemplateSelector";
import FormSection from "@/components/builder/FormSection";
import PreviewStage from "@/components/builder/PreviewStage";
import Collapsible from "@/components/builder/Collapsible";
import RelatedDocsPanel from "@/components/builder/RelatedDocsPanel";
import type { MyApproval } from "@/components/builder/ApprovalPanel";
import TemplateInfoPanel from "@/components/builder/TemplateInfoPanel";
import SigningPanel from "@/components/builder/SigningPanel";
import PaywallModal from "@/components/builder/PaywallModal";
// №7 аудита: необязательные панели грузим лениво — меньше First Load JS.
// ssr: false для клиентских компонентов с тяжёлыми зависимостями (tesseract.js, pdf-lib и др.)
const DocScanner = dynamic(() => import("@/components/builder/DocScanner"), { ssr: false });
const DraftsPanel = dynamic(() => import("@/components/builder/DraftsPanel"), { ssr: false });
const ApprovalPanel = dynamic(() => import("@/components/builder/ApprovalPanel"), { ssr: false });
const SimilarTemplatesPanel = dynamic(() => import("@/components/builder/SimilarTemplatesPanel"), { ssr: false });
const DadataPanel = dynamic(() => import("@/components/builder/DadataPanel"), { ssr: false });
const ContractorsPanel = dynamic(() => import("@/components/builder/ContractorsPanel"), { ssr: false });
const ChecklistPanel = dynamic(() => import("@/components/builder/ChecklistPanel"), { ssr: false });
const AuditPanel = dynamic(() => import("@/components/builder/AuditPanel"), { ssr: false });
const CostsPanel = dynamic(() => import("@/components/builder/CostsPanel"), { ssr: false });
// PdfPreview — скрытый источник печати (#print-root); грузится только на клиенте
// (ssr: false), чтобы не раздувать SSR-HTML /builder и не тащить pdf-рендер.
const PdfPreview = dynamic(() => import("@/components/PdfPreview"), { ssr: false });
import PersonsPanel, { type PersonRow } from "@/components/builder/PersonsPanel";
import { roleToPerson, personToFields } from "@/lib/personMapping";
import { getTemplateRoles } from "@/lib/docRequirements";

// Для шаблонов с парой «Полный / Краткий» по умолчанию открываем краткую
// версию. Легко расширяется добавлением новых пар.
const BRIEF_VARIANT: Record<string, string> = {
  "dkp-auto": "dkp-auto-short",
};
const preferBrief = (id: string) => BRIEF_VARIANT[id] ?? id;

function HomeContent() {
  const [userName, setUserName] = useState<string>("Гость");
  const [greeting, setGreeting] = useState<string>("Добрый день");

  useEffect(() => {
    setGreeting(getGreeting());
    const tryOpenFromUrl = () => {
      const p = new URLSearchParams(window.location.search).get("template");
      // ДКП по умолчанию открывается в краткой (1 стр.) форме
      const pid = p ? preferBrief(p) : p;
      if (pid && LEGAL_TEMPLATES.find((t) => t.id === pid)) {
        setSelectedTemplateId(pid);
        try { localStorage.setItem("dogovor_last_template", pid); } catch { /* localStorage недоступен */ }
        setWizardStep("form");
        track(goals.builderStart, { template: pid, source: "url" });
        return true;
      }
      return false;
    };
    if (tryOpenFromUrl()) return;
    // Страховка: при редком сбое первого прохода (холодный старт) повторяем
    // открытие шаблона из URL после гидратации.
    const t = setTimeout(() => {
      tryOpenFromUrl();
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("dkp-auto-short");
  const [wizardStep, setWizardStep] = useState<"select" | "form">("select");
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] =
    useState<TemplateField["category"]>("seller");
  const [scanPhotos, setScanPhotos] = useState<Record<string, string[]>>({});
  const [auditResults, setAuditResults] = useState<AuditResult[] | null>(null);
  const [auditTimestamp, setAuditTimestamp] = useState<Date | null>(null);
  const [liveAudit, setLiveAudit] = useState<AuditResult[]>([]);
  const [draftInfos, setDraftInfos] = useState<DraftData[]>([]);
  const [showAudit, setShowAudit] = useState(false);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [showSaved, setShowSaved] = useState(false);
  const [ownershipYears, setOwnershipYears] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);
  const [templateCategory, setTemplateCategory] = useState<string>("all");
  const [templateSearch, setTemplateSearch] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"form" | "preview">("form");
  // iOS-клавиатура: visualViewport-паддинг для формы (Safari не ресайзится сам).
  const { keyboardInset } = useVisualViewport();
  // Масштаб формы (этап 1 аудита): пользователь регулирует размер полей/текста.
  const [formScale, setFormScale] = useState<number>(100);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("dogovor_form_scale");
      if (raw) {
        const v = Number(raw);
        if (Number.isFinite(v) && v >= 90 && v <= 140) setFormScale(v);
      }
    } catch { /* localStorage недоступен */ }
  }, []);
  const applyFormScale = (v: number) => {
    const clamped = Math.min(140, Math.max(90, Math.round(v)));
    setFormScale(clamped);
    try { localStorage.setItem("dogovor_form_scale", String(clamped)); } catch { /* localStorage недоступен */ }
  };
  const [sidebarTab, setSidebarTab] = useState<"preview" | "tools">("tools");
  const [previewBlocked, setPreviewBlocked] =
    useState<AuditResult[] | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const flatRef = useRef<HTMLDivElement>(null);
  const formValuesRef = useRef<Record<string, string>>(formValues);
  formValuesRef.current = formValues;
  const pendingMergeRef = useRef<Record<string, string> | null>(null);
  const [exportPages, setExportPages] = useState(0);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Есть ли несохранённые локально правки (для beforeunload, аудит Ф1).
  const dirtyRef = useRef(false);
  const lastVersionRef = useRef<number>(0);
  const saveCountRef = useRef(0);
  const [packTemplateIds, setPackTemplateIds] = useState<string[]>([]);
  const [previewMap, setPreviewMap] = useState<Record<string, string>>({});
  // HTML-шаблоны превью (previewTemplate) вынесены в ленивый модуль, чтобы не
  // раздувать основной бандл конструктора. Грузим их динамически и кешируем
  // по id, затем подставляем в renderTemplateDocument через options.
  useEffect(() => {
    let cancelled = false;
    const ids = Array.from(
      new Set([selectedTemplateId, ...packTemplateIds].filter(Boolean))
    );
    import("@/data/templatePreviews")
      .then(async (mod) => {
        const entries = await Promise.all(
          ids.map(async (id) => [id, await mod.getPreviewTemplate(id)] as const)
        );
        if (!cancelled) setPreviewMap(Object.fromEntries(entries));
      })
      .catch((e) => console.warn("[builder] failed to load template previews", e));
    return () => {
      cancelled = true;
    };
  }, [selectedTemplateId, packTemplateIds]);
  const [signSheetEnabled, setSignSheetEnabled] = useState(false);
  const [coverHtml, setCoverHtml] = useState<string | null>(null);
  const [signHtml, setSignHtml] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };
  const designId: DesignId = "classic";

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserFlag(Boolean(data.user));
    }).catch(() => {});
  }, []);

  // Загрузка шаблона из localStorage на клиенте (после гидратации)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dogovor_last_template");
      if (saved && LEGAL_TEMPLATES.some((t) => t.id === saved)) {
        setSelectedTemplateId(saved);
      }
    } catch (e) {
      console.warn("[builder] failed to read saved template from localStorage", e);
    }
  }, []);

  // NOTE (внешний ре-аудит 2026-09-12): здесь был дублирующий эффект
  // инициализации formValues по selectedTemplateId — он полностью покрывался
  // effect'ом «template change → load draft/defaults» ниже (тот же расчёт +
  // pendingMergeRef + сброс аудита), а его работа зависела лишь от порядка
  // объявления useEffect. Удалён как второй источник истины.

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => (r.ok ? (r.json() as Promise<{ data?: { full_name?: string } }>) : null))
      .then((res) => {
        const data = res?.data;
        if (data?.full_name) {
          setUserName(data.full_name.split(" ")[0]);
          setMeFio(data.full_name);
        }
      })
      .catch((e) => console.warn("[builder] profile load failed", e));
  }, []);


  const [dadataKey, setDadataKey] = useState<string>("");
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallTitle, setPaywallTitle] = useState<string | undefined>(undefined);
  const requirePro = (title?: string) => {
    setPaywallTitle(title);
    setPaywallOpen(true);
    track(goals.paywallShown, { reason: title ?? "docx_export" });
  };
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{
    kind: "ok" | "error";
    text: string;
  } | null>(null);
  useEffect(() => {
    fetch("/api/subscription-status")
      .then((r) => r.json() as Promise<{ subscription_active?: boolean }>)
      .then((j) => setSubscriptionActive(!!j.subscription_active))
      .catch((e) => console.warn("[builder] subscription-status load failed", e));
  }, []);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dadata_key");
      if (saved) setDadataKey(saved);
    } catch { /* localStorage недоступен */ }
  }, []);
  useEffect(() => {
    try {
      if (dadataKey) localStorage.setItem("dadata_key", dadataKey);
      else localStorage.removeItem("dadata_key");
    } catch { /* localStorage недоступен */ }
  }, [dadataKey]);
  const [dadataLoading, setDadataLoading] = useState(false);
  const [dadataMsg, setDadataMsg] = useState<{ text: string; ok: boolean } | null>(
    null
  );

  // Нормализация ответа: прокси отдаёт плоскую структуру, сырой DADATA — nested.
  // Возвращаем все поля, которые нужны UI-компонентам (DadataPanel, lookupInn).
  type DadataPartyData = {
    inn?: string;
    kpp?: string;
    ogrn?: string;
    name?: string | { short_with_opf?: string; raw?: string };
    address?: { value?: string };
    state?: { status?: string; code?: string };
    surname?: string;
    patronymic?: string;
    birthdate?: string;
    passport_issued_by?: string;
    passport_issue_date?: string;
    passport_code?: string;
    snils?: string;
  };
  type DadataSuggestion = { value?: string; data?: DadataPartyData; inn?: string };
  type DadataResponse = { suggestions?: DadataSuggestion[] };
  type PartyNorm = {
    inn: string;
    kpp: string;
    ogrn: string;
    name_short_with_opf: string;
    address_value: string;
    state_status: string;
    state_code: string;
  };
  // Минимальный структурный тип для данных ЕГРЮЛ, который принимают и
  // DadataPanel (PartyData), и наш нормализованный PartyNorm.
  type PartyDataLike = {
    inn?: string;
    kpp?: string;
    ogrn?: string;
    name_short_with_opf?: string;
    address_value?: string;
  };
  type Contractor = {
    id: string;
    name: string;
    inn: string;
    kpp: string;
    address: string;
    ogrn?: string;
  };

  const normParty = (s: DadataSuggestion | undefined): PartyNorm => {
    const d = s?.data;
    const nm = d?.name;
    return {
      inn: d?.inn || "",
      kpp: d?.kpp || "",
      ogrn: d?.ogrn || "",
      name_short_with_opf: typeof nm === "string" ? nm : nm?.short_with_opf || "",
      address_value: d?.address?.value || "",
      state_status: d?.state?.status || "",
      state_code: d?.state?.code || "",
    };
  };

  const callDadata = async (op: string, query: string, count = 10): Promise<{ status: number; json: DadataResponse | null }> => {
    // Запрос идёт ТОЛЬКО через /api/dadata: серверный прокси для PRO, fallback
    // для FREE с собственным серверным ключом. Клиент НИКОГДА не дёргает
    // suggestions.dadata.ru напрямую — это утечка API-ключа в Network tab
    // и нарушение ToS DaData. См. AGENTS.md «DADATA: только серверный прокси».
    const res = await fetch("/api/dadata", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ op, query, count }),
    });
    const json = res.ok ? ((await res.json()) as DadataResponse) : null;
    return { status: res.status, json };
  };

  const applyPartyData = (s: PartyDataLike | undefined, prefix: string): number => {
    if (!s) return 0;
    let filled = 0;
    template.fields.forEach((f) => {
      if (!f.id.startsWith(prefix)) return;
      let v: string | undefined;
      if (f.id.includes("company")) v = s.name_short_with_opf || "";
      else if (f.id.includes("kpp")) v = s.kpp || "";
      else if (f.id.includes("ogrn")) v = s.ogrn || "";
      else if (f.id.includes("address")) v = s.address_value || "";
      if (v) {
        handleFieldChange(f.id, v);
        filled++;
      }
    });
    return filled;
  };

  const lookupInn = async (fieldId: string) => {
    const inn = (formValuesRef.current[fieldId] || "").replace(/\D/g, "");
    if (inn.length < 10) return;
    setDadataLoading(true);
    setDadataMsg(null);
    try {
      const { status, json } = await callDadata("find-party", inn);
      if (status === 401 || status === 403) {
        setDadataMsg({ text: "Ключ DADATA недействителен — проверьте его", ok: false });
        return;
      }
      if (status === 503 && !json) {
        setDadataMsg({
          text: "Введите бесплатный ключ DADATA ниже или подключите подписку для авто-заполнения",
          ok: false,
        });
        return;
      }
      if (!json || !json.suggestions?.length) {
        setDadataMsg({ text: "Организация по этому ИНН не найдена", ok: false });
        return;
      }
      const s = normParty(json.suggestions[0]);
      if (!s) {
        setDadataMsg({ text: "Организация по этому ИНН не найдена", ok: false });
        return;
      }
      // Предупреждение о статусе ЕГРЮЛ: запрещаем заполнение для ликвидированных/банкротов.
      const BLOCK_STATUS = ["LIQUIDATED", "BANKRUPT", "LIQUIDATING"];
      if (s.state_status && BLOCK_STATUS.includes(s.state_status)) {
        const labels: Record<string, string> = {
          LIQUIDATING: "в процессе ликвидации",
          LIQUIDATED: "ликвидирована",
          BANKRUPT: "банкрот",
        };
        setDadataMsg({
          text: `Контрагент ${labels[s.state_status] || s.state_status} по ЕГРЮЛ — заполнение формы заблокировано`,
          ok: false,
        });
        return;
      }
      const prefix = fieldId.slice(0, fieldId.length - "_inn".length);
      const filled = applyPartyData(s, prefix);
      setDadataMsg(
        filled > 0
          ? { text: `Заполнено полей: ${filled} (данные ЕГРЮЛ)`, ok: true }
          : { text: "Организация найдена, но совпадающих полей в форме нет", ok: false }
      );
    } catch {
      setDadataMsg({ text: "Ошибка запроса к DADATA", ok: false });
    } finally {
      setDadataLoading(false);
    }
  };

  const [partyQuery, setPartyQuery] = useState("");
  const [partyResults, setPartyResults] = useState<{ value: string; data: PartyNorm; prefix: string }[]>([]);
  const [partyAnalyzing, setPartyAnalyzing] = useState(false);

  const searchParty = async () => {
    const q = partyQuery.trim();
    if (q.length < 3) {
      setDadataMsg({ text: "Введите не менее 3 символов названия", ok: false });
      return;
    }
    setPartyAnalyzing(true);
    setDadataMsg(null);
    try {
      const { status, json } = await callDadata("suggest-party", q, 6);
      if (status === 401 || status === 403) {
        setDadataMsg({ text: "Ключ DADATA недействителен — проверьте его", ok: false });
        setPartyResults([]);
        return;
      }
      if (status === 503 && !json) {
        setDadataMsg({
          text: "Введите бесплатный ключ DADATA ниже или подключите подписку для авто-заполнения",
          ok: false,
        });
        setPartyResults([]);
        return;
      }
      if (!json) {
        setDadataMsg({ text: `Сервис DADATA недоступен (${status})`, ok: false });
        setPartyResults([]);
        return;
      }
      const prefix =
        template.fields.some((f) => f.id.startsWith("seller_")) && template.fields.some((f) => f.id.startsWith("buyer_"))
          ? "seller"
          : template.fields.some((f) => f.id.startsWith("buyer_"))
            ? "buyer"
            : template.fields.some((f) => f.id.startsWith("seller_"))
              ? "seller"
              : "";
      setPartyResults(
        (json.suggestions || []).map((sg) => ({
          value: sg.value ?? "",
          data: normParty(sg),
          prefix,
        }))
      );
      if ((json.suggestions || []).length === 0) {
        setDadataMsg({ text: "Ничего не найдено по запросу", ok: false });
      }
    } catch {
      setDadataMsg({ text: "Ошибка запроса к DADATA", ok: false });
      setPartyResults([]);
    } finally {
      setPartyAnalyzing(false);
    }
  };

  const applyPartyResult = (r: { data: PartyDataLike; prefix: string; value: string }) => {
    const filled = applyPartyData(r.data, r.prefix || "");
    const innField = `${r.prefix}_inn`;
    if (r.prefix && !filled && template.fields.some((f) => f.id === innField)) {
      handleFieldChange(innField, r.data.inn || "");
    }
    setPartyResults([]);
    setPartyQuery("");
    setDadataMsg(
      filled > 0
        ? { text: `Данные «${r.value}» подставлены (ЕГРЮЛ)`, ok: true }
        : { text: "Организация выбрана, но подходящих полей в форме нет", ok: false }
    );
  };

  const [contractors, setContractors] = useState<Contractor[] | null>(null);
  const [contractorsMsg, setContractorsMsg] = useState<string | null>(null);

  const loadContractors = useCallback(async () => {
    try {
      const res = await fetch("/api/contractors");
      if (!res.ok) throw new Error(String(res.status));
      const json = (await res.json()) as { data?: Contractor[] };
      setContractors(Array.isArray(json.data) ? json.data : []);
    } catch {
      setContractors([]);
    }
  }, []);
  useEffect(() => {
    void loadContractors();
  }, [loadContractors]);

  const contractorFields = (prefix: string): Record<string, string> => {
    const out: Record<string, string> = {};
    template.fields.forEach((f) => {
      if (!f.id.startsWith(prefix)) return;
      if (f.id.includes("company"))
        out.name = formValuesRef.current[f.id] || out.name || "";
      else if (f.id.includes("inn")) out.inn = formValuesRef.current[f.id] || "";
      else if (f.id.includes("kpp")) out.kpp = formValuesRef.current[f.id] || "";
      else if (f.id.includes("ogrn")) out.ogrn = formValuesRef.current[f.id] || "";
      else if (f.id.includes("address"))
        out.address = formValuesRef.current[f.id] || out.address || "";
    });
    return out;
  };

  const saveContractor = async (prefix: string) => {
    const data = contractorFields(prefix);
    if (!data.name && !data.inn) {
      setContractorsMsg("Заполните наименование или ИНН контрагента в форме");
      return;
    }
    try {
      const res = await fetch("/api/contractors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        setContractorsMsg(j?.error || "Не удалось сохранить");
        return;
      }
      await loadContractors();
      setContractorsMsg("Контрагент сохранён");
    } catch {
      setContractorsMsg("Ошибка сохранения");
    }
  };

  const applyContractor = (c: Contractor) => {
    let filled = 0;
    ["seller", "buyer"].forEach((prefix) => {
      if (!template.fields.some((f) => f.id.startsWith(prefix))) return;
      if (!template.fields.some((f) => f.id === `${prefix}_inn`) && !template.fields.some((f) => f.id === `${prefix}_company`)) return;
      template.fields.forEach((f) => {
        if (!f.id.startsWith(prefix)) return;
        let v = "";
        if (f.id.includes("company")) v = c.name || "";
        else if (f.id.includes("inn")) v = c.inn || "";
        else if (f.id.includes("kpp")) v = c.kpp || "";
        else if (f.id.includes("ogrn")) v = c.ogrn || "";
        else if (f.id.includes("address")) v = c.address || "";
        if (v) {
          handleFieldChange(f.id, v);
          filled++;
        }
      });
    });
    setContractorsMsg(filled > 0 ? "Данные контрагента подставлены в форму" : "Нет подходящих полей");
  };

  const deleteContractor = async (id: string) => {
    try {
      await fetch(`/api/contractors?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      await loadContractors();
    } catch { /* ошибка удаления игнорируется */ }
  };

  const [meFio, setMeFio] = useState<string | null>(null);
  const [persons, setPersons] = useState<PersonRow[] | null>(null);
  const [personsMsg, setPersonsMsg] = useState<string | null>(null);

  const loadPersons = async () => {
    try {
      const res = await fetch("/api/persons");
      if (!res.ok) throw new Error(String(res.status));
      const json = (await res.json()) as { data?: PersonRow[] };
      setPersons(Array.isArray(json.data) ? json.data : []);
    } catch {
      setPersons([]);
    }
  };
  useEffect(() => {
    void loadPersons();
  }, []);

  const savePerson = async (prefix: string) => {
    const data = roleToPerson(formValuesRef.current, prefix, template.fields);
    if (!data.fio) {
      setPersonsMsg("Заполните ФИО стороны в форме");
      return;
    }
    try {
      const res = await fetch("/api/persons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        setPersonsMsg(j?.error || "Не удалось сохранить");
        return;
      }
      await loadPersons();
      setPersonsMsg("Лицо сохранено");
    } catch {
      setPersonsMsg("Ошибка сохранения");
    }
  };

  const applyPersonToRole = (person: PersonRow, prefix: string) => {
    const pairs = personToFields(
      {
        fio: person.fio,
        birthday: "",
        phone: "",
        passport_series: person.passport_series || "",
        passport_number: person.passport_number || "",
        passport_issued_by: person.passport_issued_by || "",
        passport_code: person.passport_code || "",
        address: person.address || "",
      },
      prefix,
      template.fields
    );
    let filled = 0;
    Object.entries(pairs).forEach(([fieldId, v]) => {
      if (!v) return;
      handleFieldChange(fieldId, v);
      filled++;
    });
    setPersonsMsg(
      filled > 0 ? "Данные лица подставлены в форму" : "Нет подходящих полей"
    );
  };

  const applyMeToRole = (prefix: string) => {
    applyPersonToRole(
      {
        id: "me",
        fio: meFio || "",
        address: "",
      },
      prefix
    );
  };

  const deletePerson = async (id: string) => {
    try {
      await fetch(`/api/persons?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      await loadPersons();
    } catch { /* ошибка удаления игнорируется */ }
  };

  /** SHA-256 содержимого; null, если Web Crypto недоступен (№3 аудита:
   *  никаких текстов-заглушек про хеш в документ не попадает). */
  const sha256Hex = async (text: string): Promise<string | null> => {
    if (typeof crypto === "undefined" || !crypto.subtle) return null;
    try {
      const buf = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(text)
      );
      return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    } catch {
      return null;
    }
  };

  const togglePack = (id: string) => {
    setPackTemplateIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      const next = [...prev, id];
      return next.length > 6 ? prev : next;
    });
  };

  const template =
    LEGAL_TEMPLATES.find((t) => t.id === selectedTemplateId) ||
    LEGAL_TEMPLATES[0];

  const personRoles = useMemo(
    () =>
      getTemplateRoles(template).map((r) => ({
        prefix: r.prefix,
        label: r.label,
      })),
    [template]
  );

  const packTemplates = useMemo(() => {
    const list: LegalTemplate[] = [];
    if (template) {
      list.push(template);
      for (const id of packTemplateIds) {
        if (id === template.id) continue;
        const t = LEGAL_TEMPLATES.find((x) => x.id === id);
        if (t) list.push(t);
      }
    }
    return list;
  }, [packTemplateIds, template]);

  const tabs = useMemo(
    () =>
      Array.from(
        new Set(template.fields.map((f) => f.category))
      ),
    [template]
  );

  const FAVORITES_KEY = "dogovor_favorites";

  const toggleFavorite = (templateId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(templateId)) {
        next.delete(templateId);
      } else {
        next.add(templateId);
      }
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify([...next]));
      } catch {
        // ignore
      }
      return next;
    });
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (raw) setFavorites(new Set(JSON.parse(raw) as string[]));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!tabs.includes(activeTab)) {
      setActiveTab(tabs[0] || "seller");
    }
  }, [activeTab, tabs]);

  useEffect(() => {
    if (pendingMergeRef.current) {
      // Явный переход (связанные документы, переключатель Полный/Краткий):
      // переносим совпадающие поля в приоритете над черновиком.
      setFormValues(pendingMergeRef.current);
      pendingMergeRef.current = null;
      setChecklist({});
      setActiveTab(tabs[0]);
    } else {
      const draft = loadDraft(template.id);
      if (draft) {
        // Черновик может не содержать полей, добавленных в шаблон позже, —
        // новые поля получают дефолтные значения (статусы сторон и т.п.).
        setFormValues({ ...buildTemplateDefaults(template), ...draft.values });
        setChecklist(draft.checklist);
        setScanPhotos(draft.photos || {});
        const draftTab = draft.activeTab as TemplateField["category"];
        setActiveTab(
          (tabs.includes(draftTab) ? draftTab : tabs[0])
        );
      } else {
        setFormValues(buildTemplateDefaults(template));
        setChecklist({});
        setScanPhotos({});
        setActiveTab(tabs[0]);
      }
    }
    setAuditResults(null);
    setAuditTimestamp(null);
    setShowAudit(false);
    setLiveAudit([]);
    setDraftInfos(getAllDrafts());
  }, [selectedTemplateId, tabs, template]);

  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    dirtyRef.current = true;
    saveTimerRef.current = setTimeout(() => {
      const savedOk = saveDraft(template.id, formValues, checklist, activeTab, undefined, scanPhotos);
      dirtyRef.current = !savedOk;
      void syncDraft({
        templateId: template.id,
        values: formValues,
        checklist,
        activeTab,
        savedAt: new Date().toISOString(),
      });
      saveCountRef.current += 1;
      // Ставим версию каждые ~30 секунд активного редактирования или при 3-м сохранении.
      const now = Date.now();
      if (
        now - lastVersionRef.current > 30000 ||
        (lastVersionRef.current === 0 && saveCountRef.current >= 3)
      ) {
        pushDraftVersion(template.id, formValues, checklist, activeTab);
        lastVersionRef.current = now;
      }
      setShowSaved(true);
      setDraftInfos(getAllDrafts());
      setTimeout(() => setShowSaved(false), 2000);
    }, 1000);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [formValues, checklist, activeTab, scanPhotos, template.id]);

  // Аудит Ф1: не даём потерять несохранённые правки при закрытии вкладки
  // (окно = дебаунс автосейва ~1с или отказ квоты localStorage) и честно
  // предупреждаем, если черновик не записался.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    const onSaveError = () => {
      showToast("Хранилище браузера заполнено — черновик не сохранён локально. Удалите старые черновики или выгрузите документы в облако");
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener(DRAFT_SAVE_ERROR_EVENT, onSaveError);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener(DRAFT_SAVE_ERROR_EVENT, onSaveError);
    };
  }, []);

  // Живой аудит: проверка с небольшим дебаунсом прямо при вводе.
  useEffect(() => {
    if (viewMode !== "form") {
      setLiveAudit([]);
      return;
    }
    const t = setTimeout(() => {
      setLiveAudit(
        runLegalAudit(template, formValuesRef.current).filter(
          (r) => r.type === "error" && r.field !== "_all"
        )
      );
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues, template.id, viewMode]);

  // Overlay-предпросмотр: блокируем прокрутку страницы под ним.
  useEffect(() => {
    document.body.style.overflow = viewMode === "preview" ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [viewMode]);

  const selectRelatedTemplate = (templateId: string) => {
    if (templateId === selectedTemplateId) return;
    const prevValues = formValuesRef.current;
    const prevTemplate = template;
    const nextTemplate =
      LEGAL_TEMPLATES.find((t) => t.id === templateId) ||
      LEGAL_TEMPLATES[0];
    const merged = buildTemplateDefaults(nextTemplate);
    const pack = buildPackValues(nextTemplate, prevValues);
    nextTemplate.fields.forEach((f) => {
      const val = pack[f.id];
      if (val !== undefined && val.trim() !== "") merged[f.id] = val;
    });
    // Дополнительно: миграция полей по «роль+тип» (seller_inn ↔ buyer_inn,
    // owner_phone ↔ tenant_phone и т.п.). Не затирает значения из pack.
    const migration = migrateFieldValues(prevValues, prevTemplate, nextTemplate);
    for (const [k, v] of Object.entries(migration.values)) {
      if (!merged[k] || merged[k].trim() === "") merged[k] = v;
    }
    pendingMergeRef.current = merged;
    setSelectedTemplateId(templateId);
    track(goals.builderTemplateSwitch, { from: prevTemplate.id, to: templateId });
    setMigrationInfo({
      migratedCount: migration.migratedIds.length,
      totalFields: migration.totalNextFields,
    });
    try { localStorage.setItem("dogovor_last_template", templateId); } catch { /* localStorage недоступен */ }
  };

  const openDraft = (d: DraftData) => {
    if (d.templateId === selectedTemplateId) {
      setFormValues(d.values);
      setChecklist(d.checklist);
      setActiveTab(
        (d.activeTab || tabs[0]) as TemplateField["category"]
      );
      setDraftInfos(getAllDrafts());
    } else {
      setSelectedTemplateId(d.templateId);
      try { localStorage.setItem("dogovor_last_template", d.templateId); } catch { /* localStorage недоступен */ }
    }
  };

  const removeDraft = (d: DraftData) => {
    clearDraft(d.templateId);
    clearDraftVersions(d.templateId);
    void syncDelete(d.templateId);
    setDraftInfos(getAllDrafts());
  };

  const handleFieldChange = useCallback(
    (fieldId: string, value: string) => {
      setFormValues((prev) => {
        const next = { ...prev, [fieldId]: value };
        const wordsMap: Record<string, string> = {
          contract_price: "contract_price_words",
          amount: "amount_words",
          loan_amount: "loan_amount_words",
        };
        const wordsField = wordsMap[fieldId];
        if (wordsField && value) {
          next[wordsField] = numberToWords(Number(value));
        }
        return next;
      });
    },
    []
  );

  const onBlurNormalize = (fieldId: string) => {
    handleFieldChange(
      fieldId,
      normalizeTypography(formValuesRef.current[fieldId] || "")
    );
  };

  const onInnBlur = (fieldId: string) => {
    void lookupInn(fieldId);
  };

  const handleSuggestFill = (pairs: Record<string, string>) => {
    Object.entries(pairs).forEach(([fieldId, v]) => {
      if (!v) return;
      if (!template.fields.some((f) => f.id === fieldId)) return;
      if (formValuesRef.current[fieldId]?.trim()) return;
      handleFieldChange(fieldId, v);
    });
  };

  const handleAuditResultClick = (fieldId: string) => {
    const el = document.querySelector(`[data-field="${fieldId}"]`);
    if (!el) {
      showToast("Поле больше не используется в этой версии шаблона");
      return;
    }
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    const focusable = el.querySelector<HTMLElement>(
      "input, select, textarea"
    );
    if (focusable) focusable.focus({ preventScroll: true });
  };

  const handlePhotosChange = (slotId: string, photos: string[]) => {
    setScanPhotos((prev) => ({ ...prev, [slotId]: photos }));
  };

  const handleAudit = () => {
    const res = runLegalAudit(template, formValues);
    setAuditResults(res);
    track(goals.auditRun, {
      template: template.id,
      errors: res.filter((r) => r.type === "error").length,
    });
    setAuditTimestamp(new Date());
    setShowAudit(true);
    setSidebarTab("preview");
    setTimeout(() => {
      document
        .getElementById("builder-sidebar")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyJson = () => {
    void navigator.clipboard.writeText(JSON.stringify(formValues, null, 2));
  };

  const goToPreview = () => {
    const res = runLegalAudit(template, formValues);
    setAuditResults(res);
    setAuditTimestamp(new Date());
    const errors = res.filter((r) => r.type === "error");
    if (errors.length > 0) {
      setPreviewBlocked(errors);
      setShowAudit(true);
      return;
    }
    setPreviewBlocked(null);
    setViewMode("preview");
    track(goals.previewOpened, { template: template.id });
    window.scrollTo(0, 0);
  };

  const backToForm = () => {
    setViewMode("form");
    window.scrollTo(0, 0);
  };

  const handleExportPdf = async (scope: "pack" | "current" = "pack") => {
    if (scope === "pack" && packTemplates.length > 1 && !subscriptionActive) {
      requirePro("Пакетный экспорт — функция PRO");
      return;
    }
    setIsExporting(true);
    try {
      const docs = await collectExportDocs(scope);
      const isPack = scope === "pack" && packTemplates.length > 1;
      const fileName = isPack ? `Паспорт_сделки_${todayStr()}` : `${template.name}_${todayStr()}`;
      const { buildPdf } = await import("@/lib/exportPdf");
      const { blob } = await buildPdf(docs, {
        title: isPack ? "Паспорт сделки" : template.name,
        design: designId,
      });
      const buf = await blob.arrayBuffer();
      downloadBytes(new Uint8Array(buf), fileName + ".pdf");
      track(goals.exportPdf, { template: template.id, pack: isPack });
    } catch (e) {
      console.error("PDF export error:", e);
      showToast("Не удалось сформировать PDF. Попробуйте ещё раз.");
    } finally {
      setIsExporting(false);
    }
  };

  /** Сбор HTML-документов для экспорта: пакет целиком или один документ. */
  const collectExportDocs = async (scope: "pack" | "current"): Promise<string[]> => {
    const list = scope === "current" ? [template] : packTemplates;
    const docs: string[] = [];
    if (scope === "pack" && packTemplates.length > 1) {
      const coverHtml = await buildCoverHtml();
      if (coverHtml) docs.push(coverHtml);
    }
    for (const t of list) {
      docs.push(renderPreview(t));
    }
    if (
      scope === "pack" &&
      signSheetEnabled &&
      canShowSignSheet(template.id)
    ) {
      const signHtml = await buildSignHtml();
      if (signHtml) docs.push(signHtml);
    }
    return docs;
  };

  const buildCoverHtml = async (): Promise<string | null> => {
    try {
      const rows: string[] = [];
      for (const [i, t] of packTemplates.entries()) {
        const html = renderPreview(t);
        const hash = await sha256Hex(html);
        if (!hash) continue; // №3: без Web Crypto обложка с хешами не строится
        rows.push(`
          <tr>
            <td style="padding:8px 10px;border:1px solid #d4d4d8;font-size:12px;">${i + 1}</td>
            <td style="padding:8px 10px;border:1px solid #d4d4d8;font-size:12px;"><b>${t.name}</b></td>
            <td style="padding:8px 10px;border:1px solid #d4d4d8;font-size:10px;word-break:break-all;color:#52525b;">${hash}</td>
          </tr>`);
      }
      if (!rows.length) return null; // хеши недоступны — обложка без смысла
      // Стороны пакета — из метаданных подписантов первого документа (не хардкод).
      const meta = getSigning(packTemplates[0].id);
      const partyName = (i: number, fallback: string) => {
        const s = meta.signers[i];
        return (s && formValues[s.fieldId]) || fallback;
      };
      const side1 = partyName(0, "___________");
      const side2 = partyName(1, "___________");
      const role1 = meta.signers[0]?.role || "Сторона 1";
      const role2 = meta.signers[1]?.role || "Сторона 2";
      // Гигиена (внешний ре-аудит 2026-09-12): значения из формы — данные
      // пользователя. Сейчас обложка потребляется только нашим pdf-парсером
      // (не DOM), но экранируем, чтобы будущий email/HTML-потребитель не стал
      // внезапным XSS.
      const esc = (v: string) =>
        v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

      return `<div class="flex flex-col font-serif text-[14px] leading-relaxed text-gray-900" style="padding:48px 56px;">
        <div class="text-center font-bold text-[18px] mb-2">ПАСПОРТ СДЕЛКИ</div>
        <div class="text-center text-xs mb-6">Состав и контрольные хеши пакета документов от ${todayStr()}</div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <thead>
            <tr>
              <th style="padding:8px 10px;border:1px solid #d4d4d8;text-align:left;font-size:11px;">№</th>
              <th style="padding:8px 10px;border:1px solid #d4d4d8;text-align:left;font-size:11px;">Документ</th>
              <th style="padding:8px 10px;border:1px solid #d4d4d8;text-align:left;font-size:11px;">SHA-256</th>
            </tr>
          </thead>
          <tbody>${rows.join("")}</tbody>
        </table>
        <div class="mb-1"><b>${role1}:</b> ${esc(side1)}</div>
        <div class="mb-6"><b>${role2}:</b> ${esc(side2)}</div>
        <div class="text-xs text-justify">Хеши рассчитаны по итоговому HTML-содержимому каждого документа на момент формирования пакета и позволяют зафиксировать неизменность редакций (сравнение с актуальным состоянием — на странице «Предпросмотр»).</div>
      </div>`;
    } catch (err) {
      console.error("Cover sheet error:", err);
      return null;
    }
  };

  const buildSignHtml = async (): Promise<string | null> => {
    try {
      const docs = packTemplates.length ? packTemplates : [template];
      const docList = docs.map((t) => t.name).join(", ");
      // Подписанты — из метаданных шаблона (роль + поле формы), не хардкод.
      const signerRows: string[] = [];
      for (const t of docs) {
        const meta = getSigning(t.id);
        const list = meta.signers.length
          ? meta.signers
          : [{ role: "Подписант", fieldId: "" }];
        for (const s of list) {
          const name = (s.fieldId && formValues[s.fieldId]) || "___________";
          const escN = (v: string) =>
            v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
          signerRows.push(`
            <tr>
              <td style="padding:8px 10px;border:1px solid #d4d4d8;font-size:12px;">${t.name}</td>
              <td style="padding:8px 10px;border:1px solid #d4d4d8;font-size:12px;">${s.role}</td>
              <td style="padding:8px 10px;border:1px solid #d4d4d8;font-size:12px;">${escN(name)}</td>
              <td style="padding:8px 10px;border:1px solid #d4d4d8;font-size:12px;width:120px;"></td>
            </tr>`);
        }
      }
      // Отпечатки содержимого — техническая контрольная сумма, НЕ подпись.
      const hashRows: string[] = [];
      for (const [i, t] of docs.entries()) {
        const html = renderPreview(t);
        const hash = await sha256Hex(html);
        if (!hash) continue; // №3: без crypto.subtle строки с хешем не выводятся вовсе
        hashRows.push(`
          <tr>
            <td style="padding:6px 10px;border:1px solid #d4d4d8;font-size:11px;">${i + 1}</td>
            <td style="padding:6px 10px;border:1px solid #d4d4d8;font-size:11px;">${t.name}</td>
            <td style="padding:6px 10px;border:1px solid #d4d4d8;font-size:10px;word-break:break-all;color:#52525b;">${hash}</td>
          </tr>`);
      }
      const stamp = new Date().toLocaleString("ru-RU");

      return `<div class="flex flex-col font-serif text-[14px] leading-relaxed text-gray-900" style="padding:48px 56px;">
        <div class="text-center font-bold text-[16px] mb-2">СОГЛАШЕНИЕ ОБ ИСПОЛЬЗОВАНИИ ПРОСТОЙ ЭЛЕКТРОННОЙ ПОДПИСИ</div>
        <div class="text-center text-xs mb-6">(образец; к документам: ${docList} от ${todayStr()})</div>
        <div class="mb-3 text-justify">1. Стороны в соответствии со ст. 6 (ч. 2) и ст. 9 Федерального закона от 06.04.2011 № 63-ФЗ «Об электронной подписи» договорились, что электронные документы (в том числе копии и сканы указанных документов, а также сообщения сторон по электронной почте и мессенджерам), подписанные простой электронной подписью (ПЭП), признаются равнозначными документам на бумажном носителе, подписанным собственноручной подписью.</div>
        <div class="mb-3 text-justify">2. Правила определения лица, подписывающего документ по его ПЭП: подписантом признаётся лицо, указанное в таблице ниже, с адреса электронной почты (или аккаунта мессенджера) которого отправлен подписанный документ либо которое подтвердило подписание иным способом, зафиксированным сторонами.</div>
        <div class="mb-3 text-justify">3. Каждая сторона обязана соблюдать конфиденциальность ключа своей ПЭП (паролей, кодов доступа к почте/мессенджеру) и не передавать их третьим лицам.</div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <thead>
            <tr>
              <th style="padding:8px 10px;border:1px solid #d4d4d8;text-align:left;font-size:11px;">Документ</th>
              <th style="padding:8px 10px;border:1px solid #d4d4d8;text-align:left;font-size:11px;">Роль</th>
              <th style="padding:8px 10px;border:1px solid #d4d4d8;text-align:left;font-size:11px;">Подписант (ФИО / наименование)</th>
              <th style="padding:8px 10px;border:1px solid #d4d4d8;text-align:left;font-size:11px;">Подпись</th>
            </tr>
          </thead>
          <tbody>${signerRows.join("")}</tbody>
        </table>
        ${hashRows.length ? `<div class="text-xs font-bold mb-1">Отпечаток содержимого документов (SHA-256):</div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <tbody>${hashRows.join("")}</tbody>
        </table>
        <div class="text-xs text-justify mb-4">Указанные отпечатки являются технической контрольной суммой содержимого для идентификации версии документа; сами по себе они не являются электронной подписью и не заменяют её.</div>` : ""}
        <div class="text-xs text-justify">Настоящее соглашение вступает в силу с момента подписания обеими сторонами и действует до его расторжения. Сформировано: ${stamp}.</div>
      </div>`;
    } catch (err) {
      console.error("Sign sheet error:", err);
      return null;
    }
  };

  // Вычисление обложки и листа подписей для превью пакета
  useEffect(() => {
    if (packTemplates.length <= 1) {
      setCoverHtml(null);
      setSignHtml(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const [cover, sign] = await Promise.all([
          buildCoverHtml(),
          signSheetEnabled ? buildSignHtml() : Promise.resolve(null as string | null),
        ]);
        if (!cancelled) {
          setCoverHtml(cover);
          setSignHtml(sign);
        }
      } catch (err) {
        console.error("Cover/Sign sheet error:", err);
        if (!cancelled) {
          setCoverHtml(null);
          setSignHtml(null);
        }
      }
    })();
    return () => { cancelled = true; };
    // buildCoverHtml/buildSignHtml пересоздаются каждый рендер — в зависимостях
    // был бы бесконечный цикл; пересчёт нужен только при смене этих данных.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packTemplates, signSheetEnabled, formValues, designId]);

  const handleExportDocx = async () => {
    if (!subscriptionActive) {
      setPaywallTitle("Экспорт в Word (DOCX) — доступно в подписке PRO");
      setPaywallOpen(true);
      return;
    }
    if (!flatRef.current) return;
    setIsExporting(true);
    try {
      const { exportToDocx, exportToDocxHtml } = await import("@/lib/exportDocx");
      if (packTemplates.length > 1) {
        // №6 аудита: DOCX пакета содержит те же документы, что и PDF.
        const html = packTemplates
          .map(
            (t, i) =>
              `<p style="text-align:center;font-weight:bold;">Документ ${i + 1} из ${packTemplates.length}: ${t.name}</p>` +
              renderPreview(t)
          )
          .join('<p style="text-align:center;">— — — — —</p>');
        await exportToDocxHtml(html, `Паспорт_сделки_${todayStr()}`, {
          design: designId,
        });
      } else {
        await exportToDocx(flatRef.current, `${template.name}_${todayStr()}`, {
          design: designId,
        });
      }
      showToast(
        "DOCX сохранён. Часть оформления (таблицы, рамки, шрифты) может отличаться от PDF — для печати надёжнее использовать PDF."
      );
      track(goals.exportDocx, { template: template.id, pack: packTemplates.length > 1 });
    } catch (err) {
      console.error("DOCX export error:", err);
      showToast(
        "Не удалось сформировать DOCX. Проверьте подключение к интернету и попробуйте ещё раз."
      );
    }
    setIsExporting(false);
  };

  const handleExportEmail = () => {
    setEmailStatus(null);
    setEmailModalOpen(true);
  };

  const handleSendEmail = async () => {
    const address = emailAddress.trim();
    if (!address) {
      setEmailStatus({ kind: "error", text: "Укажите адрес электронной почты" });
      return;
    }
    setEmailSending(true);
    setEmailStatus(null);
    try {
      const docs = await collectExportDocs("pack");
      const fileName =
        packTemplates.length > 1
          ? `Паспорт_сделки_${todayStr()}`
          : `${template.name}_${todayStr()}`;
      const { buildPdf } = await import("@/lib/exportPdf");
      const { blob } = await buildPdf(docs, {
        title: packTemplates.length > 1 ? "Паспорт сделки" : template.name,
        design: designId,
      });
      const buf = await blob.arrayBuffer();
      const pdfBase64 = uint8ToBase64(new Uint8Array(buf));

      const res = await fetch("/api/export/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: address, filename: fileName, pdfBase64 }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setEmailStatus({
          kind: "error",
          text:
            res.status === 501
              ? "Отправка на почту временно недоступна. Скачайте документ и отправьте самостоятельно."
              : data?.error || "Не удалось отправить письмо",
        });
        return;
      }
      setEmailStatus({ kind: "ok", text: "Документ отправлен на указанную почту" });
      track(goals.exportEmail, { template: template.id });
    } catch (err) {
      console.error("Email export error:", err);
      setEmailStatus({ kind: "error", text: "Не удалось отправить письмо" });
    } finally {
      setEmailSending(false);
    }
  };

  const renderPreview = (forTemplate?: LegalTemplate): string => {
    const t = forTemplate || template;
    const srcValues = forTemplate && forTemplate.id !== template.id
      ? buildPackValues(forTemplate, formValuesRef.current)
      : formValuesRef.current;
    return renderTemplateDocument(t, srcValues, {
      qrSvg: t.id === "invoice" ? qrSvg : null,
      previewTemplate: previewMap[t.id] ?? "",
    });
  };

  const buildInvoiceQrData = () => {
    let items: { sum?: number }[] = [];
    try {
      items = JSON.parse(formValues.items || "[]") as { sum?: number }[];
    } catch {
      items = [];
    }
    const total = items.reduce((s, it) => s + Number(it.sum || 0), 0);
    const ff = (v: string | undefined) =>
      (v || "").replace(/[|;&"\\{}]/g, " ").trim();
    return [
      "ST00012",
      `Name=${ff(formValues.seller_company)}`,
      `PersonalAcc=${ff(formValues.seller_account)}`,
      `BankName=${ff(formValues.seller_bank)}`,
      `BIC=${ff(formValues.seller_bik)}`,
      `CorrespAcc=${ff(formValues.seller_corr_account)}`,
      `PayeeINN=${ff(formValues.seller_inn)}`,
      `KPP=${ff(formValues.seller_kpp)}`,
      `Purpose=Оплата по счёту №${ff(formValues.invoice_number)}`,
      `Sum=${total.toFixed(2)}`,
    ].join("|");
  };

  const [qrSvg, setQrSvg] = useState("");

  // Актуальный документ для печати (#print-root). Пересчитывается с debounce,
  // чтобы не пересобирать PDF на каждый ввод (иначе форма лагает).
  const [printDoc, setPrintDoc] = useState<string>(() => renderPreview());
  useEffect(() => {
    const id = setTimeout(() => setPrintDoc(renderPreview()), 600);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues, template, qrSvg]);
  const qrCacheKey = `${formValues.show_qr}|${formValues.items}|${formValues.seller_company}|${formValues.seller_account}|${formValues.seller_bank}|${formValues.seller_bik}|${formValues.seller_corr_account}|${formValues.seller_inn}|${formValues.seller_kpp}|${formValues.invoice_number}`;
  useEffect(() => {
    if (
      viewMode !== "preview" ||
      template.id !== "invoice" ||
      formValues.show_qr !== "true"
    ) {
      return;
    }
    const data = buildInvoiceQrData();
    let cancelled = false;
    void (async () => {
      const { default: QRCode } = await import("qrcode");
      const svg = await QRCode.toString(data, {
        type: "svg",
        errorCorrectionLevel: "M",
        margin: 1,
        width: 132,
      });
      if (!cancelled) setQrSvg(svg);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, template.id, qrCacheKey]);

  const getRelatedDocs = () =>
    template.suggestedDocs
      .map((id) => LEGAL_TEMPLATES.find((t) => t.id === id))
      .filter(Boolean) as LegalTemplate[];

  const similarTemplates = useMemo(() => {
    const related = new Set(template.suggestedDocs);
    return LEGAL_TEMPLATES.filter(
      (t) => t.category === template.category && t.id !== template.id && !related.has(t.id)
    ).slice(0, 4);
  }, [template.id, template.category, template.suggestedDocs]);

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => ({
    about: true,
    dadata: true,
    contractors: true,
    esign: true,
    signing: true,
  }));

  const toggleSection = (id: string) =>
    setCollapsedSections((prev) => ({ ...prev, [id]: !prev[id] }));

  const [myApprovals, setMyApprovals] = useState<MyApproval[]>([]);
  const [approvalMode, setApprovalMode] = useState<"fill" | "edit">("fill");
  const [approvalBusy, setApprovalBusy] = useState(false);
  const [approvalMsg, setApprovalMsg] = useState("");
  const [migrationInfo, setMigrationInfo] = useState<{ migratedCount: number; totalFields: number } | null>(null);
  const [approvalQr, setApprovalQr] = useState<{ token: string; svg: string } | null>(null);

  const showApprovalQr = async (token: string) => {
    if (approvalQr?.token === token) {
      setApprovalQr(null);
      return;
    }
    try {
      const { default: QRCode } = await import("qrcode");
      const svg = await QRCode.toString(`${window.location.origin}/approve/${token}`, {
        type: "svg",
        errorCorrectionLevel: "M",
        margin: 1,
        width: 140,
      });
      setApprovalQr({ token, svg });
    } catch {
      setApprovalMsg("Не удалось сформировать QR-код");
    }
  };

  const loadMyApprovals = () => {
    fetch("/api/approval")
      .then((r) => (r.ok ? (r.json() as Promise<{ data?: MyApproval[] }>) : null))
      .then((d) => setMyApprovals(Array.isArray(d?.data) ? d.data : []))
      .catch(() => setMyApprovals([]));
  };

  useEffect(() => {
    loadMyApprovals();
  }, []);

  const createApproval = async () => {
    setApprovalBusy(true);
    setApprovalMsg("");
    try {
      const r = await fetch("/api/approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: template.id,
          mode: approvalMode,
          values: formValues,
          checklist,
        }),
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error === "unauthorized" ? "Войдите в аккаунт, чтобы создавать ссылки" : "Не удалось создать ссылку");
      }
      setApprovalMsg("Ссылка создана");
      track(goals.approvalCreated, { template: template.id });
      loadMyApprovals();
    } catch (e) {
      setApprovalMsg(e instanceof Error ? e.message : "Не удалось создать ссылку");
    } finally {
      setApprovalBusy(false);
    }
  };

  const applyApproval = (a: MyApproval) => {
    fetch(`/api/approval/${a.token}`)
      .then((r) =>
        r.ok
          ? (r.json() as Promise<{ values?: Record<string, string>; checklist?: Record<string, boolean> }>)
          : Promise.reject(new Error("expired"))
      )
      .then((d) => {
        if (d?.values && Object.keys(d.values).length > 0) {
          setFormValues((prev) => ({ ...prev, ...d.values }));
        }
        if (d?.checklist && Object.keys(d.checklist).length > 0) {
          setChecklist((prev) => ({ ...prev, ...d.checklist }));
        }
        setApprovalMsg("Изменения контрагента применены к форме");
      })
      .catch(() => setApprovalMsg("Ссылка истекла или удалена"))
      .finally(() => {
        // Сбрасываем флаг «контрагент внёс изменения» у владельца
        fetch(`/api/approval/${a.token}`, { method: "PATCH" }).catch(() => {});
        loadMyApprovals();
      });
  };

  const copyApprovalLink = (a: MyApproval) => {
    navigator.clipboard
      ?.writeText(`${window.location.origin}/approve/${a.token}`)
      .then(() => setApprovalMsg("Ссылка скопирована"))
      .catch(() => undefined);
  };

  const costCalc = useMemo(
    () =>
      calculateCosts(
        Number(formValues.contract_price || 0),
        ownershipYears ? Number(ownershipYears) : undefined
      ),
    [formValues.contract_price, ownershipYears]
  );

  const hasContractPrice = template.fields.some((f) => f.id === "contract_price");

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, {userName}!
          </h1>
          <p className="text-gray-600 mt-1 text-sm">{template.name}</p>
        </div>
        {migrationInfo && (
          <div className="px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center gap-2">
            <span className="font-medium">
              Перенесено {migrationInfo.migratedCount} из {migrationInfo.totalFields} полей
            </span>
            <button
              type="button"
              onClick={() => setMigrationInfo(null)}
              className="text-blue-500 hover:text-blue-700"
              aria-label="Закрыть"
            >
              ×
            </button>
          </div>
        )}
        <div className="flex items-center gap-3">
          {showSaved && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
              <Check className="w-3.5 h-3.5" />
              Сохранено
            </div>
          )}
          <span className="text-[10px] text-gray-600">
            <Clock className="w-3 h-3 inline mr-1" />
            {template.actSource}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-gray-600">
            <Shield className="w-3 h-3" />
            Данные обрабатываются локально в браузере
          </span>
        </div>
      </div>

      {/* Progress Stepper */}
      <ProgressSteps
        wizardStep={wizardStep}
        viewMode={viewMode}
        onSelectTemplateStep={() => setWizardStep("select")}
        onBackToForm={backToForm}
        onGoToPreview={goToPreview}
      />

      {/* №9 аудита: прогресс заполнения обязательных полей */}
      {wizardStep === "form" && viewMode === "form" && (() => {
        const { filled, total } = requiredProgress(template, formValues);
        const pct = total ? Math.round((filled / total) * 100) : 100;
        return (
          <div className="mb-6 max-w-4xl">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Заполнено обязательных полей</span>
              <span className="flex items-center gap-3">
                <span className={pct === 100 ? "text-emerald-600 font-medium" : ""}>
                  {filled} из {total} ({pct}%)
                </span>
                <span
                  className="flex items-center gap-1"
                  title="Размер формы (поля и текст)"
                >
                  <button
                    type="button"
                    onClick={() => applyFormScale(formScale - 10)}
                    className="w-6 h-6 rounded border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm leading-none font-semibold"
                    aria-label="Уменьшить размер формы"
                  >
                    −
                  </button>
                  <span className="w-9 text-center tabular-nums">{formScale}%</span>
                  <button
                    type="button"
                    onClick={() => applyFormScale(formScale + 10)}
                    className="w-6 h-6 rounded border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm leading-none font-semibold"
                    aria-label="Увеличить размер формы"
                  >
                    +
                  </button>
                </span>
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${pct === 100 ? "bg-emerald-500" : "bg-brand-500"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })()}

      {/* Template Selector — Step-by-step */}
      {wizardStep === "select" && (
        <>
          <TemplateSelector
            templateCategory={templateCategory}
            onCategoryChange={setTemplateCategory}
            templateSearch={templateSearch}
            onSearchChange={setTemplateSearch}
            selectedTemplateId={selectedTemplateId}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onSelectTemplate={(id) => {
              const briefId = preferBrief(id);
              setSelectedTemplateId(briefId);
              try { localStorage.setItem("dogovor_last_template", briefId); } catch { /* localStorage недоступен */ }
              setWizardStep("form");
              track(goals.builderStart, { template: briefId, source: "catalog" });
            }}
          />
          {/* Main Content placeholder */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white mx-auto mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Выберите шаблон выше, чтобы начать
            </h2>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              После выбора откроется форма заполнения — она сохраняется автоматически.
              Заполнить можно в 3 шага: категория → шаблон → документ.
            </p>
          </div>
        </>
      )}

      {/* Main Content */}
      {wizardStep === "form" && (
        <div
          className={`grid grid-cols-1 xl:grid-cols-5 gap-5 ${
            viewMode === "preview" ? "print:hidden" : ""
          }`}
        >
          {/* Left: Form */}
          <div
            className="xl:col-span-3 space-y-4 pb-20 xl:pb-0"
            style={{
              zoom: formScale !== 100 ? formScale / 100 : undefined,
              // iOS-клавиатура: держим активное поле над видимой областью
              // (interactive-widget не работает в Safari). На десктопе = 0.
              paddingBottom: keyboardInset ? `${keyboardInset + 24}px` : undefined,
            }}
          >
            {viewMode === "form" && (<>
              {previewBlocked && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-red-800">
                      Не удалось открыть предпросмотр
                    </p>
                    <p className="text-xs text-red-600 mt-0.5 mb-2">
                      Исправьте ошибки в полях, чтобы продолжить:
                    </p>
                    <ul className="space-y-1">
                      {previewBlocked.slice(0, 5).map((r, i) => (
                        <li
                          key={`${r.field}-${i}`}
                          className="text-xs text-red-700 flex items-start gap-1.5"
                        >
                          <span className="mt-0.5 w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
                          {r.message}
                        </li>
                      ))}
                      {previewBlocked.length > 5 && (
                        <li className="text-xs text-red-400">
                          и ещё {previewBlocked.length - 5} замечание(й)
                        </li>
                      )}
                    </ul>
                  </div>
                  <button
                    onClick={() => setPreviewBlocked(null)}
                    className="text-xs font-medium text-red-500 hover:text-red-700 flex-shrink-0"
                  >
                    Понятно
                  </button>
                </div>
              )}
              {/* Form */}
              {template.id === "dkp-auto" || template.id === "dkp-auto-short" ? (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Форма договора
                      </p>
                      <p className="text-xs text-gray-600">
                        Выберите версию документа
                      </p>
                    </div>
                    <div className="flex rounded-lg border border-gray-200 p-1 bg-gray-50">
                      <button
                        onClick={() => selectRelatedTemplate("dkp-auto")}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          template.id === "dkp-auto"
                            ? "bg-brand-500 text-white shadow-sm"
                            : "text-gray-600 hover:bg-white"
                        }`}
                      >
                        Полный
                      </button>
                      <button
                        onClick={() => selectRelatedTemplate("dkp-auto-short")}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          template.id === "dkp-auto-short"
                            ? "bg-brand-500 text-white shadow-sm"
                            : "text-gray-600 hover:bg-white"
                        }`}
                      >
                        Краткий (1 стр.)
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
              <FormSection
                template={template}
                formValues={formValues}
                liveAudit={liveAudit}
                onFieldChange={handleFieldChange}
                onBlurNormalize={onBlurNormalize}
                onInnBlur={onInnBlur}
                onSuggestFill={handleSuggestFill}
                onGoToPreview={goToPreview}
                onAudit={handleAudit}
              />
              {/* About template — footer of the form */}
              <Collapsible
                id="about"
                title="О шаблоне"
                icon={<Shield className="w-4 h-4 text-brand-600" />}
                collapsed={!!collapsedSections["about"]}
                onToggle={toggleSection}
              >
                <TemplateInfoPanel template={template} />
              </Collapsible>
            </>)}

            {/* Mobile sticky CTA: дублируем кнопки «Проверить» и «Предпросмотр» снизу
                на мобиле, чтобы не скроллить форму до конца. На десктопе скрыт. */}
            {viewMode === "form" && (
              <div
                className="xl:hidden fixed inset-x-0 bottom-0 z-30 bg-white/95 backdrop-blur border-t border-gray-200 pb-safe"
                style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
              >
                <div className="px-3 py-2 grid grid-cols-2 gap-2">
                  <button
                    onClick={handleAudit}
                    className="inline-flex items-center justify-center font-medium transition-all h-12 text-sm rounded-xl gap-2 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                  >
                    <Shield className="w-4 h-4" />
                    Проверить
                  </button>
                  <button
                    onClick={goToPreview}
                    className="inline-flex items-center justify-center font-medium transition-all h-12 text-sm rounded-xl gap-2 bg-brand-500 text-white hover:bg-brand-600"
                  >
                    <Eye className="w-4 h-4" />
                    Предпросмотр
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            {viewMode === "preview" && (
              <div className="fixed inset-0 z-40 bg-white overflow-y-auto">
                <PreviewStage
                  template={template}
                  packTemplates={packTemplates}
                  isExporting={isExporting}
                  exportPages={exportPages}
                  printRef={printRef}
                  flatRef={flatRef}
                  renderPreview={renderPreview}
                  onPrint={handlePrint}
                  onCopyJson={handleCopyJson}
                  onExportPdf={() => { void handleExportPdf("pack"); }}
                  onExportPdfCurrent={() => { void handleExportPdf("current"); }}
                  onExportDocx={() => { void handleExportDocx(); }}
                  onOpenEmailModal={handleExportEmail}
                  emailSending={emailSending}
                  onBackToForm={backToForm}
                  onPagesChange={setExportPages}
                  coverHtml={coverHtml}
                  signHtml={signHtml}
                  quickEditFields={template.fields}
                  quickEditValues={formValues}
                  onQuickEditChange={handleFieldChange}
                />
              </div>
            )}
          </div>

          {/* Right Column: Live preview / Tools */}
          {viewMode === "form" && (<div id="builder-sidebar" className="xl:col-span-2 space-y-4">
            <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl">
              {(
                [
                  ["preview", "Аудит и чек-лист", <Eye key="preview" className="w-4 h-4" />],
                  ["tools", "Документы и инструменты", <Wrench key="tools" className="w-4 h-4" />],
                ] as const
              ).map(([id, label, icon]) => (
                <button
                  key={id}
                  onClick={() => setSidebarTab(id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    sidebarTab === id
                      ? "bg-white text-brand-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-700"
                  }`}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>

            {sidebarTab === "preview" ? (<>
              {showAudit && auditResults && (
                <Collapsible
                  id="audit"
                  title="Правовой аудит"
                  icon={<Shield className="w-4 h-4 text-brand-600" />}
                  collapsed={!!collapsedSections["audit"]}
                  onToggle={toggleSection}
                >
                  <AuditPanel
                    results={auditResults}
                    onResultClick={handleAuditResultClick}
                    lastCheckedAt={auditTimestamp ?? undefined}
                  />
                </Collapsible>
              )}

              <Collapsible
                id="checklist"
                title="Чек-лист перед сделкой"
                collapsed={!!collapsedSections["checklist"]}
                onToggle={toggleSection}
              >
                <ChecklistPanel
                  template={template}
                  checklist={checklist}
                  onChange={(item, checked) =>
                    setChecklist((prev) => ({ ...prev, [item]: checked }))
                  }
                  packTemplateIds={packTemplateIds}
                  suggestedDocs={template.suggestedDocs}
                  onAddDoc={togglePack}
                  formValues={formValues}
                />
              </Collapsible>

              {hasContractPrice && (
                <Collapsible
                  id="costs"
                  title="Расходы на сделку"
                  icon={<Calculator className="w-4 h-4 text-brand-600" />}
                  collapsed={!!collapsedSections["costs"]}
                  onToggle={toggleSection}
                >
                  <CostsPanel
                    costCalc={costCalc}
                    ownershipYears={ownershipYears}
                    onOwnershipYearsChange={setOwnershipYears}
                  />
                </Collapsible>
              )}
            </>) : (<>
              {/* Document assembly tools */}
              {subscriptionActive ? (
                <DocScanner
                  template={template}
                  photos={scanPhotos}
                  onPhotosChange={handlePhotosChange}
                  onFieldChange={handleFieldChange}
                />
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50 p-6 text-center">
                  <div className="mx-auto w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center mb-3">
                    <Crown className="w-7 h-7 text-brand-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Сканер документов — функция PRO</h4>
                  <p className="text-sm text-gray-600 mt-1 mb-4">
                    Фотографируйте паспорт, ПТС или СТС — OCR автоматически заполнит поля договора.
                  </p>
                  <button
                    onClick={() => setPaywallOpen(true)}
                    className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition"
                  >
                    Оформить PRO и включить сканер
                  </button>
                </div>
              )}
              {getRelatedDocs().length > 0 && (
                <Collapsible
                  id="related"
                  title="Связанные документы"
                  collapsed={!!collapsedSections["related"]}
                  onToggle={toggleSection}
                >
                  <RelatedDocsPanel
                    relatedDocs={getRelatedDocs()}
                    packTemplateIds={packTemplateIds}
                    onTogglePack={togglePack}
                    onSelectTemplate={(id) => selectRelatedTemplate(preferBrief(id))}
                  />
                </Collapsible>
              )}
              {draftInfos.length > 0 && (
                <Collapsible
                  id="drafts"
                  title="Мои черновики"
                  icon={<Clock className="w-4 h-4 text-brand-600" />}
                  collapsed={!!collapsedSections["drafts"]}
                  onToggle={toggleSection}
                >
                  <DraftsPanel
                    draftInfos={draftInfos}
                    selectedTemplateId={selectedTemplateId}
                    onCreateVersion={() => {
                      pushDraftVersion(template.id, formValues, checklist, activeTab);
                      lastVersionRef.current = Date.now();
                      setDraftInfos(getAllDrafts());
                      setShowSaved(true);
                      setTimeout(() => setShowSaved(false), 2000);
                    }}
                    onOpenDraft={openDraft}
                    onRemoveDraft={removeDraft}
                  />
                </Collapsible>
              )}
              <Collapsible
                id="approval"
                title="Согласование с контрагентом"
                icon={<Shield className="w-4 h-4 text-brand-600" />}
                collapsed={!!collapsedSections["approval"]}
                onToggle={toggleSection}
              >
                <ApprovalPanel
                  templateId={template.id}
                  approvalMode={approvalMode}
                  onModeChange={setApprovalMode}
                  approvalBusy={approvalBusy}
                  approvalMsg={approvalMsg}
                  myApprovals={myApprovals}
                  approvalQr={approvalQr}
                  onCreate={() => { void createApproval(); }}
                  onRefresh={loadMyApprovals}
                  onApply={applyApproval}
                  onCopyLink={copyApprovalLink}
                  onToggleQr={(token) => { void showApprovalQr(token); }}
                  subscriptionActive={subscriptionActive}
                  onUpgrade={() => requirePro("Согласование с контрагентом — функция PRO")}
                />
              </Collapsible>
              {similarTemplates.length > 0 && (
                <Collapsible
                  id="similar"
                  title="Похожие шаблоны"
                  icon={<Copy className="w-4 h-4 text-brand-600" />}
                  collapsed={!!collapsedSections["similar"]}
                  onToggle={toggleSection}
                >
                  <SimilarTemplatesPanel
                    similarTemplates={similarTemplates}
                    onSelectTemplate={(id) => selectRelatedTemplate(preferBrief(id))}
                  />
                </Collapsible>
              )}

              {/* Data & signatures */}
              <div className="pt-1 pb-0.5">
                <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide px-1">
                  Данные и подписи
                </p>
              </div>
              <Collapsible
                id="dadata"
                title="Автозаполнение по ИНН (DADATA)"
                collapsed={!!collapsedSections["dadata"]}
                onToggle={toggleSection}
              >
                <DadataPanel
                  subscriptionActive={subscriptionActive}
                  dadataKey={dadataKey}
                  onKeyChange={setDadataKey}
                  partyQuery={partyQuery}
                  onQueryChange={setPartyQuery}
                  partyResults={partyResults}
                  partyAnalyzing={partyAnalyzing}
                  dadataLoading={dadataLoading}
                  dadataMsg={dadataMsg}
                  onSearch={() => { void searchParty(); }}
                  onApplyResult={applyPartyResult}
                  onClearResults={() => setPartyResults([])}
                />
              </Collapsible>

              <Collapsible
                id="contractors"
                title="Контрагенты"
                collapsed={!!collapsedSections["contractors"]}
                onToggle={toggleSection}
              >
                <ContractorsPanel
                  template={template}
                  contractors={contractors}
                  contractorsMsg={contractorsMsg}
                  onApply={applyContractor}
                  onDelete={(id) => { void deleteContractor(id); }}
                  onSave={(prefix) => { void saveContractor(prefix); }}
                />
              </Collapsible>

              {personRoles.length > 0 && (
                <Collapsible
                  id="persons"
                  title="Сохранённые лица"
                  collapsed={!!collapsedSections["persons"]}
                  onToggle={toggleSection}
                >
                  <PersonsPanel
                    roles={personRoles}
                    persons={persons}
                    personsMsg={personsMsg}
                    meFio={meFio}
                    onApplyToRole={applyPersonToRole}
                    onApplyMe={applyMeToRole}
                    onDelete={(id) => { void deletePerson(id); }}
                    onSave={(prefix) => { void savePerson(prefix); }}
                  />
                </Collapsible>
              )}

              <Collapsible
                id="signing"
                title="Подписание и протокол (ПЭП)"
                collapsed={!!collapsedSections["signing"]}
                onToggle={toggleSection}
              >
                <SigningPanel
                  visible={canShowSignSheet(template.id)}
                  signSheetEnabled={signSheetEnabled}
                  onToggle={setSignSheetEnabled}
                />
              </Collapsible>
            </>)}
          </div>)}
        </div>
      )}

      {paywallOpen && (
        <PaywallModal
          isOpen={true}
          onClose={() => setPaywallOpen(false)}
          title={paywallTitle}
          onDownloadFreePdf={() => { void handleExportPdf("current"); }}
        />
      )}

      <Modal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        title="Отправить документ на email"
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="email-address"
              className="block text-xs font-medium text-gray-600 mb-1.5"
            >
              Адрес электронной почты
            </label>
            <input
              id="email-address"
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          {emailStatus && (
            <p
              className={`text-xs ${
                emailStatus.kind === "ok" ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {emailStatus.text}
            </p>
          )}
          <p className="text-[11px] text-gray-600">
            На почту придёт PDF с документом ({packTemplates.length}{" "}
            {packTemplates.length > 1 ? "документов" : "документ"}). Ссылки
            для скачивания активны всегда.
          </p>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setEmailModalOpen(false)}
              className="inline-flex items-center justify-center font-medium px-4 py-2 text-sm rounded-xl bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            >
              Отмена
            </button>
            <button
              onClick={() => { void handleSendEmail(); }}
              disabled={emailSending}
              className="inline-flex items-center justify-center font-medium px-4 py-2 text-sm rounded-xl gap-2 bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
            >
              {emailSending && <Loader2 className="w-4 h-4 animate-spin" />}
              Отправить
            </button>
          </div>
        </div>
      </Modal>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium z-50 max-w-sm">
          {toast}
        </div>
      )}

      {/* Всегда доступный источник печати: актуальный документ рендерится в
          #print-root (как на /preview). Скрыт на экране, но показывается при
          печати — window.print() работает из любого режима, без аудита/предпросмотра. */}
      <PdfPreview
        rootId="print-root"
        className="print-src"
        docs={[printDoc]}
        design="classic"
      />
    </div>
  );
}

export default function HomePage() {
  return <HomeContent />;
}
