"use client";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { ChangeEvent } from "react";
import QRCode from "qrcode";
import {
  FileText,
  Shield,
  Check,
  AlertTriangle,
  Clock,
  Copy,
  Calculator,
} from "lucide-react";
import { LEGAL_TEMPLATES } from "@/data/legalTemplates";
import type { LegalTemplate, TemplateField } from "@/data/types";
import {
  runLegalAudit,
  isFieldVisible,
  type AuditResult,
} from "@/lib/validation";
import { calculateCosts, numberToWords } from "@/lib/calculator";
import { saveDraft, loadDraft, clearDraft, clearDraftVersions, getAllDrafts, pushDraftVersion, type DraftData } from "@/lib/autosave";
import { syncDraft, syncDelete, setUserFlag } from "@/lib/sync";
import { createClient } from "@/lib/supabase/client";
import { renderTemplateDocument, buildPackValues } from "@/lib/renderDocument";
import { exportToPdf } from "@/lib/exportPdf";
import { exportToDocx } from "@/lib/exportDocx";
import { buildTemplateDefaults, getGreeting, normalizeTypography, todayStr } from "@/lib/format";
import ProgressSteps from "@/components/builder/ProgressSteps";
import TemplateSelector from "@/components/builder/TemplateSelector";
import OcrScanner from "@/components/builder/OcrScanner";
import FormSection from "@/components/builder/FormSection";
import PreviewStage from "@/components/builder/PreviewStage";
import Collapsible from "@/components/builder/Collapsible";
import DraftsPanel from "@/components/builder/DraftsPanel";
import RelatedDocsPanel from "@/components/builder/RelatedDocsPanel";
import ApprovalPanel, { type MyApproval } from "@/components/builder/ApprovalPanel";
import TemplateInfoPanel from "@/components/builder/TemplateInfoPanel";
import SimilarTemplatesPanel from "@/components/builder/SimilarTemplatesPanel";
import DadataPanel from "@/components/builder/DadataPanel";
import ContractorsPanel from "@/components/builder/ContractorsPanel";
import EsignPanel from "@/components/builder/EsignPanel";
import SigningPanel from "@/components/builder/SigningPanel";
import ChecklistPanel from "@/components/builder/ChecklistPanel";
import AuditPanel from "@/components/builder/AuditPanel";
import CostsPanel from "@/components/builder/CostsPanel";
import SignCanvasModal from "@/components/builder/SignCanvasModal";

function HomeContent() {
  const [userName, setUserName] = useState<string>("Гость");
  const [greeting, setGreeting] = useState<string>("Добрый день");

  useEffect(() => {
    setGreeting(getGreeting());
    const p = new URLSearchParams(window.location.search).get("template");
    if (p && LEGAL_TEMPLATES.find((t) => t.id === p)) {
      setSelectedTemplateId(p);
      setWizardStep("form");
    }
  }, []);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("dkp-auto");
  const [wizardStep, setWizardStep] = useState<"select" | "form">("select");
  const [formValues, setFormValues] = useState<Record<string, string>>(() => {
    const t =
      LEGAL_TEMPLATES.find((x) => x.id === selectedTemplateId) ||
      LEGAL_TEMPLATES[0];
    return buildTemplateDefaults(t);
  });
  const [activeTab, setActiveTab] =
    useState<TemplateField["category"]>("seller");
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState<string | null>(null);
  const [auditResults, setAuditResults] = useState<AuditResult[] | null>(null);
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
  const [previewBlocked, setPreviewBlocked] =
    useState<AuditResult[] | null>(null);
  // Поля, где пользователь явно убрал демо-значение (defaultValue-образец).
  const [demoDismissed, setDemoDismissed] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const flatRef = useRef<HTMLDivElement>(null);
  const formValuesRef = useRef<Record<string, string>>(formValues);
  formValuesRef.current = formValues;
  const pendingMergeRef = useRef<Record<string, string> | null>(null);
  const [exportPages, setExportPages] = useState(0);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastVersionRef = useRef<number>(0);
  const saveCountRef = useRef(0);
  const [packTemplateIds, setPackTemplateIds] = useState<string[]>([]);
  const [signSheetEnabled, setSignSheetEnabled] = useState(true);
  const [signSeller, setSignSeller] = useState<string | null>(null);
  const [signBuyer, setSignBuyer] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserFlag(Boolean(data.user));
    });
  }, []);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then(({ data } = {}) => {
        if (data?.full_name) setUserName(data.full_name.split(" ")[0]);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    try {
      setSignSeller(localStorage.getItem("esign_seller"));
      setSignBuyer(localStorage.getItem("esign_buyer"));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (signSeller) localStorage.setItem("esign_seller", signSeller);
    } catch {}
  }, [signSeller]);
  useEffect(() => {
    try {
      if (signBuyer) localStorage.setItem("esign_buyer", signBuyer);
    } catch {}
  }, [signBuyer]);

  const clearSign = (who: "seller" | "buyer") => {
    try {
      if (who === "seller") {
        setSignSeller(null);
        localStorage.removeItem("esign_seller");
      } else {
        setSignBuyer(null);
        localStorage.removeItem("esign_buyer");
      }
    } catch {}
  };

  const [drawingFor, setDrawingFor] = useState<"seller" | "buyer" | null>(
    null
  );

  const handleSignUpload =
    (who: "seller" | "buyer") =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          if (who === "seller") setSignSeller(reader.result);
          else setSignBuyer(reader.result);
        }
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    };

  const saveDrawnSign = (who: "seller" | "buyer", dataUrl: string) => {
    if (who === "seller") setSignSeller(dataUrl);
    else setSignBuyer(dataUrl);
    setDrawingFor(null);
  };

  const [dadataKey, setDadataKey] = useState<string>("");
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  useEffect(() => {
    fetch("/api/subscription-status")
      .then((r) => r.json())
      .then((j) => setSubscriptionActive(!!j.subscription_active))
      .catch(() => {});
  }, []);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dadata_key");
      if (saved) setDadataKey(saved);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      if (dadataKey) localStorage.setItem("dadata_key", dadataKey);
      else localStorage.removeItem("dadata_key");
    } catch {}
  }, [dadataKey]);
  const [dadataLoading, setDadataLoading] = useState(false);
  const [dadataMsg, setDadataMsg] = useState<{ text: string; ok: boolean } | null>(
    null
  );

  // Нормализация ответа: прокси отдаёт плоскую структуру, сырой DADATA — nested.
  const normParty = (s: any) => {
    if (!s || !s.data) return s;
    return {
      inn: s.data.inn || "",
      kpp: s.data.kpp || "",
      ogrn: s.data.ogrn || "",
      name_short_with_opf: s.data.name?.short_with_opf || "",
      address_value: s.data.address?.value || "",
      status: s.data.state?.status || "",
      management_name: s.data.management?.name || "",
    };
  };

  const callDadata = async (op: string, query: string, count = 10) => {
    const res = await fetch("/api/dadata", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ op, query, count }),
    });
    if (res.status !== 503) {
      return { status: res.status, json: res.ok ? await res.json() : null };
    }
    if (!dadataKey.trim()) return { status: 503, json: null };
    const endpoint =
      op === "find-party"
        ? "findById/party"
        : op.replace("suggest-", "suggest/");
    const direct = await fetch(
      `https://suggestions.dadata.ru/suggestions/api/4_1/rs/${endpoint}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Token " + dadataKey.trim(),
        },
        body: JSON.stringify({ query, count }),
      }
    );
    const json = direct.ok ? await direct.json() : null;
    if (json?.suggestions) {
      json.suggestions = json.suggestions.map(normParty);
    }
    return { status: direct.status, json };
  };

  const applyPartyData = (s: { name_short_with_opf?: string; name?: { short_with_opf?: string; raw?: string }; kpp?: string; ogrn?: string; address_value?: string; address?: { value?: string } } | undefined, prefix: string): number => {
    if (!s) return 0;
    let filled = 0;
    template.fields.forEach((f) => {
      if (!f.id.startsWith(prefix)) return;
      let v: string | undefined;
      if (f.id.includes("company"))
        v = s.name_short_with_opf || s.name?.short_with_opf || s.name?.raw || "";
      else if (f.id.includes("kpp")) v = s.kpp || "";
      else if (f.id.includes("ogrn")) v = s.ogrn || "";
      else if (f.id.includes("address")) v = s.address_value || s.address?.value || "";
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
  const [partyResults, setPartyResults] = useState<{ value: string; data: any; prefix: string }[]>([]);
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
        (json.suggestions || []).map((sg: { value: string; data: any; inn?: string }) => ({
          value: sg.value,
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

  const applyPartyResult = (r: { data: any; prefix: string; value: string }) => {
    const filled = applyPartyData(r.data, r.prefix || "");
    const innField = `${r.prefix}_inn`;
    if (r.prefix && !filled && template.fields.some((f) => f.id === innField)) {
      handleFieldChange(innField, r.data?.inn || "");
    }
    setPartyResults([]);
    setPartyQuery("");
    setDadataMsg(
      filled > 0
        ? { text: `Данные «${r.value}» подставлены (ЕГРЮЛ)`, ok: true }
        : { text: "Организация выбрана, но подходящих полей в форме нет", ok: false }
    );
  };

  const [contractors, setContractors] = useState<any[] | null>(null);
  const [contractorsMsg, setContractorsMsg] = useState<string | null>(null);

  const loadContractors = async () => {
    try {
      const res = await fetch("/api/contractors");
      if (!res.ok) throw new Error(String(res.status));
      const json = await res.json();
      setContractors(Array.isArray(json.data) ? json.data : []);
    } catch {
      setContractors([]);
    }
  };
  useEffect(() => {
    void loadContractors();
  }, []);

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
        const j = await res.json().catch(() => null);
        setContractorsMsg(j?.error || "Не удалось сохранить");
        return;
      }
      await loadContractors();
      setContractorsMsg("Контрагент сохранён");
    } catch {
      setContractorsMsg("Ошибка сохранения");
    }
  };

  const applyContractor = (c: any) => {
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
    } catch {}
  };

  const sha256Hex = async (text: string): Promise<string> => {
    if (typeof crypto === "undefined" || !crypto.subtle)
      return "hash недоступен в этом браузере";
    const buf = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(text)
    );
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
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
      ) as TemplateField["category"][],
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
      if (raw) setFavorites(new Set(JSON.parse(raw)));
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
    const draft = loadDraft(template.id);
    if (draft) {
      setFormValues(draft.values);
      setChecklist(draft.checklist);
      const draftTab = draft.activeTab as TemplateField["category"];
      setActiveTab(
        (tabs.includes(draftTab) ? draftTab : tabs[0]) as TemplateField["category"]
      );
    } else if (pendingMergeRef.current) {
      // Переход по «Связанным документам»: переносим совпадающие поля.
      setFormValues(pendingMergeRef.current);
      pendingMergeRef.current = null;
      setChecklist({});
      setActiveTab(tabs[0]);
    } else {
      setFormValues(buildTemplateDefaults(template));
      setChecklist({});
      setActiveTab(tabs[0]);
    }
    setAuditResults(null);
    setShowAudit(false);
    setLiveAudit([]);
    setDemoDismissed({});
    setDraftInfos(getAllDrafts());
  }, [selectedTemplateId, tabs, template]);

  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveDraft(template.id, formValues, checklist, activeTab);
      syncDraft({
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
  }, [formValues, checklist, activeTab, template.id]);

  // Живой аудит: проверка с небольшим дебаунсом прямо при вводе.
  useEffect(() => {
    if (viewMode !== "form") {
      setLiveAudit([]);
      return;
    }
    const t = setTimeout(() => {
      setLiveAudit(runLegalAudit(template, formValuesRef.current));
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues, template.id, viewMode]);

  const selectRelatedTemplate = (templateId: string) => {
    if (templateId === selectedTemplateId) return;
    const prevValues = formValuesRef.current;
    const nextTemplate =
      LEGAL_TEMPLATES.find((t) => t.id === templateId) ||
      LEGAL_TEMPLATES[0];
    const merged = buildTemplateDefaults(nextTemplate);
    nextTemplate.fields.forEach((f) => {
      const val = prevValues[f.id];
      if (val !== undefined && val.trim() !== "") merged[f.id] = val;
    });
    pendingMergeRef.current = merged;
    setSelectedTemplateId(templateId);
  };

  const openDraft = (d: DraftData) => {
    if (d.templateId === selectedTemplateId) {
      setFormValues(d.values);
      setChecklist(d.checklist);
      setDemoDismissed({});
      setActiveTab(
        (d.activeTab || tabs[0]) as TemplateField["category"]
      );
      setDraftInfos(getAllDrafts());
    } else {
      setSelectedTemplateId(d.templateId);
    }
  };

  const removeDraft = (d: DraftData) => {
    clearDraft(d.templateId);
    clearDraftVersions(d.templateId);
    syncDelete(d.templateId);
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

  const onDismissDemo = (fieldId: string) => {
    handleFieldChange(fieldId, "");
    setDemoDismissed((prev) => ({ ...prev, [fieldId]: true }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanning(true);
    setScanSuccess(null);
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("rus+eng");
      const { data } = await worker.recognize(file);
      await worker.terminate();
      const text = data.text;
      const lowerText = text.toLowerCase();
      const newValues = { ...formValues };
      if (lowerText.includes("паспорт") || lowerText.includes("серия")) {
        const fioMatch = text.match(
          /([А-ЯЁ][а-яё]+\s+[А-ЯЁ][а-яё]+\s+[А-ЯЁ][а-яё]+)/
        );
        const seriesMatch = text.match(/(\d{2}\s?\d{2})/);
        const numberMatch = text.match(/(?:№|N)?\s*(\d{6})/);
        const addressMatch = text.match(
          /(?:зарегистрирован[а-яё]*\s+по\s+адресу:?\s*)(.+?)(?:,\s*паспорт|$)/i
        );
        const birthdayMatch = text.match(
          /(\d{2}\.\d{2}\.\d{4})\s*(?:г\.?|года)/
        );
        const hasSellerFields = template.fields.some((f) =>
          f.id.startsWith("seller_")
        );
        const prefix = hasSellerFields ? "seller" : "buyer";
        if (fioMatch)
          newValues[`${prefix}_fio`] = fioMatch[1].trim();
        if (seriesMatch)
          newValues[`${prefix}_passport_series`] =
            seriesMatch[1].replace(/\s/g, "");
        if (numberMatch)
          newValues[`${prefix}_passport_number`] = numberMatch[1];
        if (addressMatch)
          newValues[`${prefix}_address`] = addressMatch[1].trim();
        if (birthdayMatch)
          newValues[`${prefix}_birthday`] = birthdayMatch[1];
        setScanSuccess("Паспорт распознан! Проверьте данные.");
      } else if (
        lowerText.includes("vin") ||
        lowerText.includes("pts") ||
        lowerText.includes("sts")
      ) {
        const vinMatch = text.match(
          /\b([A-HJ-NPR-Z0-9]{17})\b/
        );
        const plateMatch = text.match(
          /([А-ЯЁA-Z]\d{3}[А-ЯЁA-Z]{2}\d{2,3})/
        );
        if (vinMatch) newValues.car_vin = vinMatch[1].toUpperCase();
        if (plateMatch) newValues.car_plate = plateMatch[1].toUpperCase();
        setScanSuccess("Документ ТС распознан! Проверьте данные.");
      } else {
        setScanSuccess(
          "Текст распознан. Проверьте данные вручную."
        );
      }
      setFormValues(newValues);
    } catch {
      setScanSuccess("Ошибка распознавания. Попробуйте другое фото.");
    }
    setIsScanning(false);
    setTimeout(() => setScanSuccess(null), 5000);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAudit = () => {
    setAuditResults(runLegalAudit(template, formValues));
    setShowAudit(true);
  };

  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(formValues, null, 2));
  };

  const goToPreview = () => {
    const res = runLegalAudit(template, formValues);
    setAuditResults(res);
    const errors = res.filter((r) => r.type === "error");
    if (errors.length > 0) {
      setPreviewBlocked(errors);
      setShowAudit(true);
      return;
    }
    setPreviewBlocked(null);
    setViewMode("preview");
    window.scrollTo(0, 0);
  };

  const backToForm = () => {
    setViewMode("form");
    window.scrollTo(0, 0);
  };

  const handleExportPdf = async () => {
    const sheets = Array.from(
      printRef.current?.querySelectorAll<HTMLElement>(".a4-sheet") || []
    );
    if (sheets.length === 0) return;
    setIsExporting(true);
    try {
      const fileName =
        packTemplates.length > 1
          ? `Паспорт_сделки_${todayStr()}`
          : `${template.name}_${todayStr()}`;
      let exportSheets = sheets;
      let coverEl: HTMLElement | null = null;
      if (packTemplates.length > 1) {
        coverEl = await buildCoverSheet();
        if (coverEl) {
          coverEl.style.position = "absolute";
          coverEl.style.left = "-10000px";
          coverEl.style.top = "0";
          document.body.appendChild(coverEl);
          exportSheets = [coverEl, ...sheets];
        }
      }
      let signEl: HTMLElement | null = null;
      if (signSheetEnabled) {
        signEl = await buildSignSheet();
        if (signEl) {
          signEl.style.position = "absolute";
          signEl.style.left = "-10000px";
          signEl.style.top = "0";
          document.body.appendChild(signEl);
          exportSheets = [...sheets, signEl];
        }
      }
      const pages = await exportToPdf(exportSheets, fileName);
      setExportPages(pages);
      setTimeout(() => setExportPages(0), 3000);
      signEl?.remove();
      coverEl?.remove();
    } catch (err) {
      console.error("PDF export error:", err);
    }
    setIsExporting(false);
  };

  const buildCoverSheet = async (): Promise<HTMLElement | null> => {
    try {
      const rows: string[] = [];
      for (const [i, t] of packTemplates.entries()) {
        const html = renderPreview(t);
        const hash = await sha256Hex(html);
        rows.push(`
          <tr>
            <td style="padding:8px 10px;border:1px solid #d4d4d8;font-size:12px;">${i + 1}</td>
            <td style="padding:8px 10px;border:1px solid #d4d4d8;font-size:12px;"><b>${t.name}</b></td>
            <td style="padding:8px 10px;border:1px solid #d4d4d8;font-size:10px;word-break:break-all;color:#52525b;">${hash}</td>
          </tr>`);
      }
      const seller =
        formValues.seller_fio || formValues.seller_company || "___________";
      const buyer =
        formValues.buyer_fio ||
        formValues.buyer_company ||
        formValues.customer_name ||
        "___________";

      const el = document.createElement("div");
      el.className =
        "a4-sheet flex flex-col font-serif text-[14px] leading-relaxed text-gray-900";
      el.style.padding = "48px 56px";
      el.innerHTML = `
        <h1 style="font-size:18px;font-weight:700;text-align:center;margin:0 0 8px;">
          ПАСПОРТ СДЕЛКИ
        </h1>
        <p style="text-align:center;margin:0 0 28px;font-size:12px;color:#52525b;">
          Состав и контрольные хеши пакета документов от ${todayStr()}
        </p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <thead>
            <tr>
              <th style="padding:8px 10px;border:1px solid #d4d4d8;text-align:left;font-size:11px;color:#71717a;">№</th>
              <th style="padding:8px 10px;border:1px solid #d4d4d8;text-align:left;font-size:11px;color:#71717a;">Документ</th>
              <th style="padding:8px 10px;border:1px solid #d4d4d8;text-align:left;font-size:11px;color:#71717a;">SHA-256</th>
            </tr>
          </thead>
          <tbody>${rows.join("")}</tbody>
        </table>
        <p style="margin:0 0 6px;font-size:13px;">
          <b>Продавец / Исполнитель:</b> ${seller}
        </p>
        <p style="margin:0 0 24px;font-size:13px;">
          <b>Покупатель / Заказчик:</b> ${buyer}
        </p>
        <p style="margin:0;font-size:12px;color:#52525b;text-align:justify;">
          Хеши рассчитаны по итоговому HTML-содержимому каждого документа на момент
          формирования пакета и позволяют зафиксировать неизменность редакций
          (сравнение с актуальным состоянием — на странице «Предпросмотр»).
        </p>`;
      return el;
    } catch (err) {
      console.error("Cover sheet error:", err);
      return null;
    }
  };

  const buildSignSheet = async (): Promise<HTMLElement | null> => {
    try {
      const sellerName =
        formValues.seller_fio || formValues.seller_company || "___________";
      const buyerName =
        formValues.buyer_fio ||
        formValues.buyer_company ||
        formValues.customer_name ||
        "___________";
      const docList = packTemplates.map((t) => t.name).join(", ");
      const docHtml = packTemplates
        .map((t) => renderPreview(t))
        .join("\n");
      const hash = await sha256Hex(docHtml);
      const stamp = new Date().toLocaleString("ru-RU");

      const el = document.createElement("div");
      el.className =
        "a4-sheet flex flex-col font-serif text-[14px] leading-relaxed text-gray-900";
      el.style.padding = "48px 56px";
      el.innerHTML = `
        <h1 style="font-size:16px;font-weight:700;text-align:center;margin:0 0 24px;">
          ЛИСТ ПОДПИСАНИЯ И ПРОТОКОЛ ПЭП
        </h1>
        <p style="margin:0 0 6px;">
          Документ: <b>${docList}</b> от ${todayStr()}
        </p>
        <p style="margin:0 0 18px;">
          Хеш SHA-256 содержимого документа: <code style="font-size:11px;word-break:break-all;">${hash}</code>
        </p>
        <p style="margin:0 0 18px;text-align:justify;">
          Настоящий лист составлен в соответствии со ст. 6 и ст. 9 Федерального закона
          от 06.04.2011 № 63-ФЗ «Об электронной подписи». Документы подписаны сторонами
          простой электронной подписью (ПЭП) — по соглашению сторон такая подпись
          признаётся равнозначной собственноручной (п. 2 ст. 160 ГК РФ, п. 2 ст. 6
          63-ФЗ).
        </p>
        <div style="flex:1;"></div>
        <div style="display:flex;justify-content:space-between;gap:32px;margin-bottom:36px;">
          <div style="flex:1;">
            <p style="margin:0 0 4px;font-weight:600;">Продавец / Исполнитель</p>
            <p style="margin:0 0 32px;">${sellerName}</p>
            <div style="border-bottom:1px solid #333;margin-bottom:6px;"></div>
            <p style="margin:0;font-size:12px;color:#666;">подпись и расшифровка</p>
          </div>
          <div style="flex:1;">
            <p style="margin:0 0 4px;font-weight:600;">Покупатель / Заказчик</p>
            <p style="margin:0 0 32px;">${buyerName}</p>
            <div style="border-bottom:1px solid #333;margin-bottom:6px;"></div>
            <p style="margin:0;font-size:12px;color:#666;">подпись и расшифровка</p>
          </div>
        </div>
        <p style="margin:0 0 4px;font-size:12px;color:#666;">
          Стороны подтверждают, что ознакомились с содержанием указанных документов,
          согласны с их условиями и подписывают их в день составления.
        </p>
        <p style="margin:0;font-size:12px;color:#666;">
          Протокол сформирован: ${stamp}. Документ может быть направлен по электронной почте
          или мессенджеру; факт подписания стороны фиксируют собственноручными подписями
          на бумажной копии либо письменным соглашением о ПЭП.
        </p>
      `;
      return el;
    } catch (err) {
      console.error("Sign sheet error:", err);
      return null;
    }
  };

  const handleExportDocx = async () => {
    if (!flatRef.current) return;
    setIsExporting(true);
    try {
      await exportToDocx(
        flatRef.current,
        `${template.name}_${todayStr()}`
      );
    } catch (err) {
      console.error("DOCX export error:", err);
    }
    setIsExporting(false);
  };

  const renderPreview = (forTemplate?: LegalTemplate): string => {
    const t = forTemplate || template;
    const srcValues = forTemplate && forTemplate.id !== template.id
      ? buildPackValues(forTemplate, formValuesRef.current)
      : formValuesRef.current;
    return renderTemplateDocument(t, srcValues, {
      qrSvg: t.id === "invoice" ? qrSvg : null,
      signSeller,
      signBuyer,
    });
  };

  const buildInvoiceQrData = () => {
    let items: { sum?: number }[] = [];
    try {
      items = JSON.parse(formValues.items || "[]");
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
    QRCode.toString(data, {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 1,
      width: 132,
    }).then((svg) => {
      if (cancelled) return;
      setQrSvg(svg);
    });
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

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) =>
    setCollapsedSections((prev) => ({ ...prev, [id]: !prev[id] }));

  const [myApprovals, setMyApprovals] = useState<MyApproval[]>([]);
  const [approvalMode, setApprovalMode] = useState<"fill" | "edit">("fill");
  const [approvalBusy, setApprovalBusy] = useState(false);
  const [approvalMsg, setApprovalMsg] = useState("");
  const [approvalQr, setApprovalQr] = useState<{ token: string; svg: string } | null>(null);

  const showApprovalQr = async (token: string) => {
    if (approvalQr?.token === token) {
      setApprovalQr(null);
      return;
    }
    try {
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
      .then((r) => (r.ok ? r.json() : null))
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
        const j = await r.json().catch(() => null);
        throw new Error(j?.error === "unauthorized" ? "Войдите в аккаунт, чтобы создавать ссылки" : "Не удалось создать ссылку");
      }
      setApprovalMsg("Ссылка создана");
      loadMyApprovals();
    } catch (e) {
      setApprovalMsg(e instanceof Error ? e.message : "Не удалось создать ссылку");
    } finally {
      setApprovalBusy(false);
    }
  };

  const applyApproval = (a: MyApproval) => {
    fetch(`/api/approval/${a.token}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("expired"))))
      .then((d) => {
        if (d?.values && Object.keys(d.values).length > 0) {
          setFormValues((prev) => ({ ...prev, ...d.values }));
        }
        if (d?.checklist && Object.keys(d.checklist).length > 0) {
          setChecklist((prev) => ({ ...prev, ...d.checklist }));
        }
        setApprovalMsg("Изменения контрагента применены к форме");
      })
      .catch(() => setApprovalMsg("Ссылка истекла или удалена"));
  };

  const copyApprovalLink = (a: MyApproval) => {
    navigator.clipboard
      ?.writeText(`${window.location.origin}/approve/${a.token}`)
      .then(() => setApprovalMsg("Ссылка скопирована"))
      .catch(() => undefined);
  };

  const costCalc = calculateCosts(
    Number(formValues.contract_price || 0),
    ownershipYears ? Number(ownershipYears) : undefined
  );

  const tabProgress = (tab: TemplateField["category"]) => {
    const tabFields = template.fields.filter(
      (f) => f.category === tab && isFieldVisible(f, formValues)
    );
    const required = tabFields.filter((f) => f.validation?.required);
    const filled = required.filter((f) => formValues[f.id]?.trim()).length;
    return { required: required.length, filled };
  };

  const hasContractPrice = template.fields.some((f) => f.id === "contract_price");

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, {userName}!
          </h1>
          <p className="text-gray-500 mt-1 text-sm">{template.name}</p>
        </div>
        <div className="flex items-center gap-3">
          {showSaved && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
              <Check className="w-3.5 h-3.5" />
              Сохранено
            </div>
          )}
          <span className="text-[10px] text-gray-400">
            <Clock className="w-3 h-3 inline mr-1" />
            {template.actSource}
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
              setSelectedTemplateId(id);
              setWizardStep("form");
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
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              После выбора откроется форма заполнения — она сохраняется автоматически.
              Заполнить можно в 3 шага: категория → шаблон → документ.
            </p>
          </div>
        </>
      )}

      {/* Main Content */}
      {wizardStep === "form" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: Form + Preview */}
          <div className={`${viewMode === "preview" ? "lg:col-span-3" : "lg:col-span-2"} space-y-4`}>
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
              {/* Scanner — only for OCR-capable templates */}
              {template.supportsOcr && (
                <OcrScanner
                  isScanning={isScanning}
                  scanSuccess={scanSuccess}
                  fileInputRef={fileInputRef}
                  onPhotoUpload={handlePhotoUpload}
                />
              )}
              {/* Form */}
              <FormSection
                template={template}
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                formValues={formValues}
                liveAudit={liveAudit}
                demoDismissed={demoDismissed}
                onFieldChange={handleFieldChange}
                onDismissDemo={onDismissDemo}
                onBlurNormalize={onBlurNormalize}
                onInnBlur={onInnBlur}
                onGoToPreview={goToPreview}
                onAudit={handleAudit}
                tabProgress={tabProgress}
              />
            </>)}
            {viewMode === "preview" && (
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
                onExportPdf={handleExportPdf}
                onExportDocx={handleExportDocx}
                onBackToForm={backToForm}
              />
            )}
          </div>

          {/* Right Column */}
          {viewMode === "form" && (<div className="space-y-4">
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
                  onSelectTemplate={selectRelatedTemplate}
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
                onCreate={createApproval}
                onRefresh={loadMyApprovals}
                onApply={applyApproval}
                onCopyLink={copyApprovalLink}
                onToggleQr={showApprovalQr}
              />
            </Collapsible>

            <Collapsible
              id="about"
              title="О шаблоне"
              icon={<Shield className="w-4 h-4 text-brand-600" />}
              collapsed={!!collapsedSections["about"]}
              onToggle={toggleSection}
            >
              <TemplateInfoPanel template={template} />
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
                  onSelectTemplate={selectRelatedTemplate}
                />
              </Collapsible>
            )}

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
                onSearch={searchParty}
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
                onDelete={deleteContractor}
                onSave={saveContractor}
              />
            </Collapsible>

            <Collapsible
              id="esign"
              title="Подписи сторон (e-sign)"
              collapsed={!!collapsedSections["esign"]}
              onToggle={toggleSection}
            >
              <EsignPanel
                signSeller={signSeller}
                signBuyer={signBuyer}
                onClear={clearSign}
                onUpload={handleSignUpload}
                onDraw={setDrawingFor}
              />
            </Collapsible>

            <Collapsible
              id="signing"
              title="Подписание и протокол (ПЭП)"
              collapsed={!!collapsedSections["signing"]}
              onToggle={toggleSection}
            >
              <SigningPanel
                signSheetEnabled={signSheetEnabled}
                onToggle={setSignSheetEnabled}
              />
            </Collapsible>

            <Collapsible
              id="checklist"
              title="Чек-лист перед сделкой"
              collapsed={!!collapsedSections["checklist"]}
              onToggle={toggleSection}
            >
              <ChecklistPanel
                checklist={checklist}
                onChange={(item, checked) =>
                  setChecklist((prev) => ({ ...prev, [item]: checked }))
                }
              />
            </Collapsible>

            {showAudit && auditResults && (
              <Collapsible
                id="audit"
                title="Правовой аудит"
                icon={<Shield className="w-4 h-4 text-brand-600" />}
                collapsed={!!collapsedSections["audit"]}
                onToggle={toggleSection}
              >
                <AuditPanel results={auditResults} />
              </Collapsible>
            )}

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
          </div>)}
        </div>
      )}

      {drawingFor && (
        <SignCanvasModal
          drawingFor={drawingFor}
          onClose={() => setDrawingFor(null)}
          onSave={saveDrawnSign}
        />
      )}
    </div>
  );
}

export default function HomePage() {
  return <HomeContent />;
}
