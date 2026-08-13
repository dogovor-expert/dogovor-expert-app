"use client";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { ChangeEvent } from "react";
import QRCode from "qrcode";
import DocPreview from "@/components/DocPreview";
import { LEGAL_TEMPLATES } from "@/data/legalTemplates";
import type { LegalTemplate, TemplateField } from "@/data/types";
import {
  runLegalAudit,
  isFieldVisible,
  normalizeOptions,
  type AuditResult,
} from "@/lib/validation";
import { calculateCosts, numberToWords } from "@/lib/calculator";
import { declineFullFio, type FioCases } from "@/lib/decline";
import { saveDraft, loadDraft, clearDraft, clearDraftVersions, getAllDrafts, pushDraftVersion, type DraftData } from "@/lib/autosave";
import { syncDraft, syncDelete, setUserFlag } from "@/lib/sync";
import { createClient } from "@/lib/supabase/client";
import { renderTemplateDocument, buildPackValues } from "@/lib/renderDocument";
import { exportToPdf } from "@/lib/exportPdf";
import { exportToDocx } from "@/lib/exportDocx";
import {
  FileText,
  Shield,
  Download,
  Printer,
  Check,
  Camera,
  Loader2,
  Copy,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Calculator,
  Clock,
  Eye,
  ChevronDown,
  FileImage,
  Plus,
  Trash2,
  Search,
  Star,
  ArrowRight,
  ArrowLeft,
  X,
  PenLine,
  Link2,
  QrCode,
} from "lucide-react";

const TAB_LABELS: Record<string, string> = {
  seller: "Продавец",
  buyer: "Покупатель",
  vehicle: "Транспортное средство",
  contract: "Условия договора",
  other: "Прочее",
  sts: "СТС",
  pts: "ПТС",
  grz: "ГРЗ",
  owner: "Владелец",
  representative: "Представитель",
  insurance: "Страхование",
  payment: "Оплата",
  items: "Товары",
  realty: "Недвижимость",
  business: "Бизнес/Услуги",
  family: "Семейные",
  landlord: "Арендодатель",
  tenant: "Арендатор",
  driver: "Водитель",
  object: "Объект",
  recipient: "Получатель",
  sender: "Отправитель",
  lender: "Заимодавец",
  borrower: "Заёмщик",
  executor: "Исполнитель",
  customer: "Заказчик",
  contractor: "Подрядчик",
  spouse: "Супруг(а)",
  applicant: "Заявитель",
  invoice: "Счёт",
  employer: "Работодатель",
  employee: "Работник",
  donor: "Даритель",
  donee: "Одаряемый",
  agent: "Агент",
  principal: "Принципал",
  guarantor: "Поручитель",
  court: "Суд",
  testator: "Наследодатель",
  heir: "Наследники",
  property: "Имущество",
  notary: "Нотариус",
  payer: "Плательщик",
  child: "Ребёнок",
  spouse1: "Супруг 1",
  spouse2: "Супруг 2",
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return "Доброй ночи";
  if (h < 12) return "Доброе утро";
  if (h < 18) return "Добрый день";
  return "Добрый вечер";
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function buildTemplateDefaults(template: LegalTemplate): Record<string, string> {
  const now = todayStr();
  const defaults: Record<string, string> = {};
  template.fields.forEach((f) => {
    // Устаревшие даты-дефолты заменяем на актуальную дату.
    if (
      f.type === "date" &&
      /^\d{4}-\d{2}-\d{2}$/.test(f.defaultValue) &&
      f.defaultValue < now
    ) {
      defaults[f.id] = now;
    } else {
      defaults[f.id] = f.defaultValue;
    }
  });
  return defaults;
}

/** Маски ввода: серия/номер паспорта, код подразделения, INN, VIN и т.д. */
function applyFieldFormat(field: TemplateField, raw: string): string {
  const id = field.id;
  if (field.type === "date") return raw;

  if (field.type === "number") return raw.replace(/[^\d.,]/g, "").slice(0, 12);

  if (field.type === "checkbox") return raw;

  if (id.includes("vin") || id === "car_vin") {
    return raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 17);
  }
  if (id.includes("car_plate")) {
    return raw.toUpperCase().slice(0, 9);
  }
  if (id.includes("passport_series")) {
    return raw.replace(/\D/g, "").slice(0, 4);
  }
  if (id.includes("passport_number")) {
    return raw.replace(/\D/g, "").slice(0, 6);
  }
  if (id.includes("department_code")) {
    const digits = raw.replace(/\D/g, "").slice(0, 6);
    return digits.length > 3 ? `${digits.slice(0, 3)}-${digits.slice(3)}` : digits;
  }
  if (id.includes("snils")) {
    const digits = raw.replace(/\D/g, "").slice(0, 11);
    const p = digits.slice(0, 9);
    const c = digits.slice(9);
    const fmt = [p.slice(0, 3), p.slice(3, 6), p.slice(6, 9)].filter(Boolean).join("-");
    return c ? `${fmt} ${c}` : fmt;
  }
  if (id === "contract_price" || id.includes("price") || id.includes("amount") || id.includes("rent_amount") || id.includes("deposit_amount")) {
    return raw.replace(/[^\d.,]/g, "").slice(0, 12);
  }
  if (id.includes("inn")) {
    return raw.replace(/\D/g, "").slice(0, 12);
  }
  if (id.includes("kpp")) {
    return raw.replace(/\D/g, "").slice(0, 9);
  }
  if (id.includes("bik")) {
    return raw.replace(/\D/g, "").slice(0, 9);
  }
  if (id.includes("account") || id.includes("corr_account")) {
    return raw.replace(/\D/g, "").slice(0, 20);
  }
  if (id.includes("phone")) {
    return raw.replace(/\D/g, "").slice(0, 11);
  }
  return raw;
}

/** Нормализация типографики: «ёлочки», длинные тире, схлопывание пробелов. */
function normalizeTypography(raw: string): string {
  const s = raw.replace(/\s{2,}/g, " ").trim();
  let open = true;
  const pieces: string[] = [];
  for (const ch of s) {
    if (ch === '"') {
      pieces.push(open ? "«" : "»");
      open = !open;
    } else {
      pieces.push(ch);
    }
  }
  let out = pieces.join("");
  out = out.replace(/\s+--+\s+/g, " — ");
  out = out.replace(/\s+-\s+/g, " — ");
  out = out.replace(/\s+^"/g, " \"");
  return out;
}

function HomeContent() {
  const [templateParam, setTemplateParam] = useState<string | null>(null);

  const [userName, setUserName] = useState<string>("Гость");
  const [greeting, setGreeting] = useState<string>("Добрый день");

  useEffect(() => {
    setGreeting(getGreeting());
    const p = new URLSearchParams(window.location.search).get("template");
    if (p && LEGAL_TEMPLATES.find((t) => t.id === p)) {
      setTemplateParam(p);
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
  const [isPrinting, setIsPrinting] = useState(false);
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
  const signCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawPosRef = useRef<{ x: number; y: number } | null>(null);

  const onSignCanvasDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    drawPosRef.current = {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
    canvas.setPointerCapture(e.pointerId);
  };

  const onSignCanvasMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawPosRef.current) return;
    const canvas = e.currentTarget;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(drawPosRef.current.x, drawPosRef.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    drawPosRef.current = { x, y };
  };

  const onSignCanvasUp = () => {
    drawPosRef.current = null;
  };

  const clearSignCanvas = () => {
    const canvas = signCanvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveDrawnSign = () => {
    const canvas = signCanvasRef.current;
    if (!canvas || !drawingFor) return;
    const dataUrl = canvas.toDataURL("image/png");
    if (drawingFor === "seller") setSignSeller(dataUrl);
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

  const TEMPLATE_CATEGORIES = [
    { id: "all", label: "Все", color: "brand" },
    { id: "auto", label: "Авто", color: "blue" },
    { id: "realty", label: "Недвижимость", color: "amber" },
    { id: "business", label: "Бизнес", color: "emerald" },
    { id: "finance", label: "Финансы", color: "green" },
    { id: "family", label: "Семейные", color: "pink" },
    { id: "legal", label: "Судебные", color: "purple" },
    { id: "migration", label: "Миграция", color: "gray" },
    { id: "postal", label: "Почта России", color: "gray" },
    { id: "other", label: "Прочее", color: "gray" },
  ] as const;

  const HIGH_RISK_CATEGORIES = new Set(["legal", "migration"]);

  const CATEGORY_COLORS: Record<string, { gradient: string; badge: string }> = {
    auto: { gradient: "from-blue-500 to-indigo-600", badge: "bg-blue-50 text-blue-700" },
    realty: { gradient: "from-amber-500 to-orange-600", badge: "bg-amber-50 text-amber-700" },
    business: { gradient: "from-emerald-500 to-green-600", badge: "bg-emerald-50 text-emerald-700" },
    finance: { gradient: "from-green-500 to-emerald-600", badge: "bg-green-50 text-green-700" },
    family: { gradient: "from-pink-500 to-rose-600", badge: "bg-pink-50 text-pink-700" },
    legal: { gradient: "from-purple-500 to-violet-600", badge: "bg-purple-50 text-purple-700" },
    other: { gradient: "from-gray-500 to-slate-600", badge: "bg-gray-100 text-gray-600" },
    migration: { gradient: "from-gray-500 to-slate-600", badge: "bg-gray-100 text-gray-600" },
    postal: { gradient: "from-gray-500 to-slate-600", badge: "bg-gray-100 text-gray-600" },
  };

  const CATEGORY_ICONS: Record<string, string> = {
    auto: "🚗",
    realty: "🏠",
    business: "💼",
    finance: "💰",
    family: "❤️",
    legal: "⚖️",
    other: "📄",
    migration: "📄",
    postal: "📄",
  };

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

  const filteredTemplates = LEGAL_TEMPLATES.filter((t) => {
    const matchCategory = templateCategory === "all" || t.category === templateCategory;
    const matchSearch = templateSearch === "" ||
      t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(templateSearch.toLowerCase());
    return matchCategory && matchSearch;
  }).sort((a, b) => {
    const fa = favorites.has(a.id) ? 0 : 1;
    const fb = favorites.has(b.id) ? 0 : 1;
    return fa - fb;
  });

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
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
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

  interface MyApproval {
    id: string;
    token: string;
    template_id: string;
    mode: string;
    created_at: string;
    expires_at: string;
    changed: boolean;
    updated_at: string;
    opened_count: number;
  }

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

  const renderCollapsible = ({ id, title, icon, children }: {
    id: string;
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
  }) => {
    const collapsed = !!collapsedSections[id];
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between text-left group"
          aria-expanded={!collapsed}
        >
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            {icon}
            {title}
          </h3>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${collapsed ? "" : "rotate-180"}`} />
        </button>
        {!collapsed && <div className="mt-3">{children}</div>}
      </div>
    );
  };

  const getAuditIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      default:
        return null;
    }
  };

  const getAuditBg = (type: string) => {
    switch (type) {
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-amber-50 border-amber-200";
      case "success":
        return "bg-emerald-50 border-emerald-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const costCalc = calculateCosts(
    Number(formValues.contract_price || 0),
    ownershipYears ? Number(ownershipYears) : undefined
  );

  const visibleFieldIds = template.fields
    .filter((f) => isFieldVisible(f, formValues))
    .map((f) => f.id);

  const tabProgress = (tab: TemplateField["category"]) => {
    const tabFields = template.fields.filter(
      (f) => f.category === tab && isFieldVisible(f, formValues)
    );
    const required = tabFields.filter((f) => f.validation?.required);
    const filled = required.filter((f) => formValues[f.id]?.trim()).length;
    return { required: required.length, filled };
  };

  const renderField = (field: TemplateField) => {
    if (!isFieldVisible(field, formValues)) return null;

    const value = formValues[field.id] || "";
    const fieldAudit = liveAudit.filter((r) => r.field === field.id);
    const hasError = fieldAudit.some((r) => r.type === "error");
    const hasWarn = !hasError && fieldAudit.some((r) => r.type === "warning");
    const errorMsg = fieldAudit.find((r) => r.type === "error")?.message;
    const warnMsg =
      !errorMsg && fieldAudit.find((r) => r.type === "warning")?.message;
    const successMsg =
      !hasError &&
      !hasWarn &&
      fieldAudit.find((r) => r.type === "success")?.message;

    const fieldMessage =
      (errorMsg && (
        <p className="flex items-center gap-1 mt-1 text-[11px] text-red-600">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {errorMsg}
        </p>
      )) ||
      (warnMsg && (
        <p className="flex items-center gap-1 mt-1 text-[11px] text-amber-600">
          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
          {warnMsg}
        </p>
      )) ||
      (successMsg && (
        <p className="flex items-center gap-1 mt-1 text-[11px] text-emerald-600">
          <CheckCircle className="w-3 h-3 flex-shrink-0" />
          {successMsg}
        </p>
      )) ||
      null;

    const isDemoValue =
      !demoDismissed[field.id] &&
      field.defaultValue !== "" &&
      value === field.defaultValue &&
      field.type !== "checkbox" &&
      field.type !== "radio" &&
      field.type !== "repeating";

    const demoBadge = isDemoValue ? (
      <div className="flex items-start gap-1.5 mt-1 text-[11px] text-amber-700">
        <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
        <span className="flex-1">
          Это значение по умолчанию (образец) — укажите реальные данные.
        </span>
        <button
          type="button"
          onClick={() => {
            handleFieldChange(field.id, "");
            setDemoDismissed((prev) => ({ ...prev, [field.id]: true }));
          }}
          className="underline underline-offset-2 hover:text-amber-900 whitespace-nowrap"
        >
          Убрать
        </button>
      </div>
    ) : null;

    const baseInputClass = `w-full px-3 py-2 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all ${
      hasError
        ? "border-red-400"
        : hasWarn
          ? "border-amber-300"
          : "border-gray-200"
    }`;

    if (field.type === "radio" && field.options) {
      const opts = normalizeOptions(field.options);
      return (
        <div key={field.id} className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            {field.label}
            {field.validation?.required && (
              <span className="text-red-500 ml-0.5">*</span>
            )}
          </label>
          <div className="flex flex-wrap gap-3">
            {opts.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name={field.id}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={(e) =>
                    handleFieldChange(field.id, e.target.value)
                  }
                  className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-xs text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
          {fieldMessage}
        </div>
      );
    }

    if (field.type === "checkbox") {
      return (
        <div key={field.id} className="col-span-2">
          <label className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={value === "true"}
              onChange={(e) =>
                handleFieldChange(
                  field.id,
                  e.target.checked ? "true" : "false"
                )
              }
              className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-xs text-gray-700">{field.label}</span>
          </label>
        </div>
      );
    }

    if (field.type === "select" && field.options) {
      const opts = normalizeOptions(field.options);
      return (
        <div key={field.id}>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {field.label}
            {field.validation?.required && (
              <span className="text-red-500 ml-0.5">*</span>
            )}
          </label>
          <select
            id={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={baseInputClass}
          >
            <option value="">Выберите...</option>
            {opts.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {field.validation?.helpText && (
            <p className="text-[10px] text-gray-400 mt-0.5">
              {field.validation.helpText}
            </p>
          )}
          {fieldMessage}
          {demoBadge}
        </div>
      );
    }

    if (field.type === "textarea") {
      return (
        <div key={field.id} className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {field.label}
            {field.validation?.required && (
              <span className="text-red-500 ml-0.5">*</span>
            )}
          </label>
          <textarea
            id={field.id}
            rows={field.rows || 3}
            value={value}
            placeholder={field.placeholder}
            onChange={(e) =>
              handleFieldChange(
                field.id,
                applyFieldFormat(field, e.target.value)
              )
            }
            onBlur={() => {
              handleFieldChange(
                field.id,
                normalizeTypography(formValuesRef.current[field.id] || "")
              );
            }}
            className={`${baseInputClass} resize-none`}
          />
          {field.validation?.helpText && (
            <p className="text-[10px] text-gray-400 mt-0.5">
              {field.validation.helpText}
            </p>
          )}
          {fieldMessage}
          {demoBadge}
        </div>
      );
    }

    if (field.type === "repeating" && field.repeatingFields) {
      let items: Record<string, string>[] = [];
      try {
        items = JSON.parse(value || "[]");
      } catch {
        items = [];
      }

      const addItem = () => {
        const newItem: Record<string, string> = {};
        field.repeatingFields!.forEach((rf) => {
          newItem[rf.id] = rf.defaultValue || "";
        });
        const newItems = [...items, newItem];
        handleFieldChange(field.id, JSON.stringify(newItems));
      };

      const removeItem = (idx: number) => {
        const newItems = items.filter((_, i) => i !== idx);
        handleFieldChange(field.id, JSON.stringify(newItems));
      };

      const updateItem = (idx: number, rfId: string, rfValue: string) => {
        const newItems = items.map((item, i) =>
          i === idx ? { ...item, [rfId]: rfValue } : item
        );
        if (rfId === "qty" || rfId === "price") {
          const qty = Number(newItems[idx].qty || 0);
          const price = Number(newItems[idx].price || 0);
          newItems[idx].sum = String(qty * price);
        }
        handleFieldChange(field.id, JSON.stringify(newItems));
      };

      const total = items.reduce((sum, item) => sum + Number(item.sum || 0), 0);

      return (
        <div key={field.id} className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            {field.label}
          </label>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50">
                  {field.repeatingFields.map((rf) => (
                    <th
                      key={rf.id}
                      className="px-2 py-1.5 text-left font-medium text-gray-600 border-b"
                      style={{ width: rf.width }}
                    >
                      {rf.label}
                    </th>
                  ))}
                  <th className="px-2 py-1.5 w-8 border-b"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {field.repeatingFields!.map((rf) => (
                      <td key={rf.id} className="px-1 py-1 border-b">
                        <input
                          type={rf.type === "number" ? "number" : "text"}
                          value={item[rf.id] || ""}
                          onChange={(e) =>
                            updateItem(idx, rf.id, e.target.value)
                          }
                          className="w-full px-2 py-1 text-xs bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </td>
                    ))}
                    <td className="px-1 py-1 border-b text-center">
                      <button
                        onClick={() => removeItem(idx)}
                        className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-2">
            <button
              onClick={addItem}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Добавить позицию
            </button>
            <span className="text-xs font-semibold text-gray-700">
              Итого: {total.toLocaleString("ru-RU")} ₽
            </span>
          </div>
          {fieldMessage}
        </div>
      );
    }

    return (
      <div key={field.id}>
        <label htmlFor={field.id} className="block text-xs font-medium text-gray-700 mb-1">
          {field.label}
          {field.validation?.required && (
            <span className="text-red-500 ml-0.5">*</span>
          )}
        </label>
        <input
          id={field.id}
          type={
            field.type === "date"
              ? "date"
              : field.type === "number"
                ? "number"
                : "text"
          }
          value={value}
          placeholder={field.placeholder}
          onChange={(e) =>
            handleFieldChange(field.id, applyFieldFormat(field, e.target.value))
          }
          onBlur={() => {
            if (field.type === "text") {
              handleFieldChange(
                field.id,
                normalizeTypography(formValuesRef.current[field.id] || "")
              );
              if (field.id.includes("inn")) void lookupInn(field.id);
            }
          }}
          aria-invalid={hasError || undefined}
          className={baseInputClass}
        />
        {field.validation?.helpText && (
          <p className="text-[10px] text-gray-400 mt-0.5">
            {field.validation.helpText}
          </p>
        )}
        {fieldMessage}
        {demoBadge}
        {field.type === "text" && field.id.includes("fio") && value.trim().split(/\s+/).length >= 2 && (
          <FioDeclineHint fio={value} />
        )}
        {field.type === "text" && field.id.includes("inn") && (
          <a
            href="https://egrul.nalog.ru"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-1 text-[10px] text-gray-400 hover:text-brand-600 transition-colors"
          >
            <Search className="w-3 h-3" />
            Свериться с ЕГРЮЛ на egrul.nalog.ru
          </a>
        )}
      </div>
    );
  };

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
      <div className="flex items-center gap-3 mb-6 bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-3 max-w-4xl">
        <div
          className="flex items-center gap-2"
          onClick={() => setWizardStep("select")}
          style={{ cursor: "pointer" }}
          title="Сменить шаблон"
        >
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            wizardStep === "select"
              ? "bg-brand-500 text-white"
              : "bg-emerald-500 text-white"
          }`}>
            {wizardStep === "select" ? "1" : "✓"}
          </div>
          <span className={`text-xs font-medium ${wizardStep === "select" ? "text-brand-700" : "text-gray-700"}`}>Шаблон</span>
        </div>
        <div className="w-8 h-px bg-gray-200" />
        <div className="flex items-center gap-2"
          onClick={() => viewMode === "preview" && backToForm()}
          style={{ cursor: viewMode === "preview" ? "pointer" : "default" }}
        >
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${viewMode === "preview" ? "bg-emerald-500 text-white" : "bg-brand-500 text-white"}`}>
            {viewMode === "preview" ? "✓" : "2"}
          </div>
          <span className={`text-xs font-medium ${viewMode === "preview" ? "text-gray-700" : "text-brand-700"}`}>Заполнение</span>
        </div>
        <div className="w-8 h-px bg-gray-200" />
        <div
          className="flex items-center gap-2"
          onClick={() => viewMode === "form" && goToPreview()}
          style={{ cursor: viewMode === "form" ? "pointer" : "default" }}
        >
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${viewMode === "preview" ? "bg-brand-500 text-white" : "bg-gray-200 text-gray-500"}`}>3</div>
          <span className={`text-xs font-medium ${viewMode === "preview" ? "text-brand-700" : "text-gray-400"}`}>Предпросмотр</span>
        </div>
      </div>

      {/* Template Selector — Step-by-step */}
      {wizardStep === "select" && (<div className="mb-6">
        {/* Step 1: Category Tabs */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
          <h2 className="text-sm font-semibold text-gray-900">Выберите категорию документа</h2>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-thin [scrollbar-width:thin]">
          {TEMPLATE_CATEGORIES.map((cat) => {
            const count = cat.id === "all"
              ? LEGAL_TEMPLATES.length
              : LEGAL_TEMPLATES.filter((t) => t.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setTemplateCategory(cat.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium border-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                  templateCategory === cat.id
                    ? "bg-brand-50 text-brand-700 border-brand-500"
                    : "bg-white text-gray-600 border-gray-200 hover:border-brand-300"
                }`}
              >
                {cat.label}
                <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-medium ${
                  templateCategory === cat.id ? "bg-brand-200 text-brand-800" : "bg-gray-100 text-gray-600"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Step 2: Template Grid */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
          <h2 className="text-sm font-semibold text-gray-900">Выберите шаблон документа</h2>
          <span className="text-xs text-gray-400">— {filteredTemplates.length} готовых шаблонов</span>
          {favorites.size > 0 && (
            <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {favorites.size} в избранном, показаны первыми
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Найти шаблон... например, ДКП, аренда, доверенность"
            value={templateSearch}
            onChange={(e) => setTemplateSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>

        {/* Template Cards — compact chips */}
        <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin [scrollbar-width:thin]">
          {filteredTemplates.map((t) => {
            const colors = CATEGORY_COLORS[t.category] || CATEGORY_COLORS.other;
            const isSelected = selectedTemplateId === t.id;
            return (
              <button
                key={t.id}
                title={`${t.name}${HIGH_RISK_CATEGORIES.has(t.category) ? " — проверьте у юриста" : ""}${t.description ? `\n${t.description}` : ""}`}
                onClick={() => { setSelectedTemplateId(t.id); setWizardStep("form"); }}
                className={`relative flex flex-col items-center justify-center gap-2 w-[160px] px-3 py-4 rounded-xl border-2 transition-all flex-shrink-0 ${
                  isSelected
                    ? "border-brand-500 bg-brand-50"
                    : "border-gray-200 bg-white hover:border-brand-300 hover:shadow-sm"
                }`}
              >
                <span className={`w-9 h-9 rounded-lg bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-white text-base flex-shrink-0`}>
                  {CATEGORY_ICONS[t.category] || "📄"}
                </span>
                <span className={`text-xs font-medium text-center leading-snug line-clamp-2 min-h-[2em] ${isSelected ? "text-brand-700" : "text-gray-600"}`}>
                  {t.name}
                </span>
                {HIGH_RISK_CATEGORIES.has(t.category) && (
                  <span className="text-[9px] font-semibold text-purple-700 bg-purple-50 border border-purple-100 rounded px-1 py-0.5 flex-shrink-0">
                    проверьте у юриста
                  </span>
                )}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(t.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(t.id);
                    }
                  }}
                  className={`absolute top-1.5 right-1.5 p-0.5 rounded transition-colors cursor-pointer ${
                    favorites.has(t.id) ? "text-amber-400" : "text-gray-300 hover:text-amber-400"
                  }`}
                  title={favorites.has(t.id) ? "Убрать из избранного" : "В избранное"}
                >
                  <Star className={`w-3.5 h-3.5 ${favorites.has(t.id) ? "fill-amber-400" : ""}`} />
                </span>
              </button>
            );
          })}
          <a
            href="/templates"
            className="flex flex-col items-center justify-center gap-2 w-[160px] px-3 py-4 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 hover:border-brand-300 hover:text-brand-600 whitespace-nowrap flex-shrink-0"
          >
            <span className="text-xl leading-none">+</span>
            <span className="text-xs font-medium">Выбрать из каталога</span>
          </a>
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Ничего не найдено</h3>
            <p className="text-sm text-gray-500">Попробуйте изменить запрос или выбрать другую категорию</p>
          </div>
        )}
      </div>)}

      {/* Main Content */}
      {wizardStep === "select" ? (
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
      ) : (
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
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Сканер документов
                  </h3>
                  <p className="text-xs text-gray-500">
                    Загрузите фото — данные заполнятся автоматически
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center justify-center font-medium transition-all px-3 py-1.5 text-xs rounded-lg gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 cursor-pointer">
                  <Camera className="w-3.5 h-3.5" />
                  Паспорт
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                <label className="inline-flex items-center justify-center font-medium transition-all px-3 py-1.5 text-xs rounded-lg gap-1.5 bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 cursor-pointer">
                  <FileText className="w-3.5 h-3.5" />
                  ПТС/СТС
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            {isScanning && (
              <div className="mt-3 flex items-center gap-2 text-xs text-brand-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Распознавание текста...
              </div>
            )}
            {scanSuccess && (
              <div className="mt-3 bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <p className="text-xs text-emerald-700">{scanSuccess}</p>
              </div>
            )}
          </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-5 pt-4 flex items-center gap-2 overflow-x-auto">
              {tabs.map((tab) => {
                const { required, filled } = tabProgress(tab);
                const done = required > 0 && filled === required;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                      activeTab === tab
                        ? "bg-brand-50 text-brand-700 border-brand-500"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {TAB_LABELS[tab] || tab}
                    {required > 0 && (
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                          done
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                        title={
                          done
                            ? "Все обязательные поля заполнены"
                            : `Заполнено ${filled} из ${required} обязательных`
                        }
                      >
                        {done ? "✓" : `${filled}/${required}`}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {template.fields
                  .filter((f) => f.category === activeTab)
                  .map(renderField)}
              </div>
            </div>
            <div className="px-5 pb-5 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {
                  template.fields.filter(
                    (f) =>
                      f.validation?.required &&
                      formValues[f.id]?.trim() &&
                      isFieldVisible(f, formValues)
                  ).length
                }{" "}
                /{" "}
                {
                  template.fields.filter(
                    (f) =>
                      f.validation?.required &&
                      isFieldVisible(f, formValues)
                  ).length
                }{" "}
                обязательных
              </span>
            <div className="flex items-center gap-2">
              {tabs.indexOf(activeTab) > 0 && (
                <button
                  onClick={() =>
                    setActiveTab(tabs[tabs.indexOf(activeTab) - 1])
                  }
                  className="inline-flex items-center justify-center font-medium transition-all px-4 py-2 text-sm rounded-xl gap-2 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Назад
                </button>
              )}
              {tabs.indexOf(activeTab) < tabs.length - 1 && (
                <button
                  onClick={() =>
                    setActiveTab(tabs[tabs.indexOf(activeTab) + 1])
                  }
                  className="inline-flex items-center justify-center font-medium transition-all px-4 py-2 text-sm rounded-xl gap-2 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                >
                  Далее
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            <button
              onClick={goToPreview}
              className="inline-flex items-center justify-center font-medium transition-all px-4 py-2 text-sm rounded-xl gap-2 bg-brand-500 text-white hover:bg-brand-600"
            >
              <Eye className="w-4 h-4" />
              Предпросмотр документа
              {liveAudit.filter((r) => r.type === "error" && r.field !== "_all").length > 0 && (
                <span className="px-1.5 py-0.5 rounded-md bg-red-600 text-white text-[10px] leading-none font-bold">
                  {liveAudit.filter((r) => r.type === "error" && r.field !== "_all").length}
                </span>
              )}
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="relative group">
              <button
                onClick={handleAudit}
                className="inline-flex items-center justify-center font-medium transition-all px-4 py-2 text-sm rounded-xl gap-2 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
              >
                <Shield className="w-4 h-4" />
                Проверить документ
              </button>
              <div className="absolute right-0 bottom-full mb-2 w-64 bg-gray-900 text-gray-100 text-xs leading-relaxed rounded-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                Проверяет заполнение обязательных полей, корректность форматов
                (VIN, паспорт, код подразделения) и                 правовые подсказки: пороги
                для расписки, декларации 3-НДФЛ и даты в будущем.
              </div>
            </div>
            </div>
            </div>
          </div>
          </>)}
          {viewMode === "preview" && (<>
          {/* Preview */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">
                Документ заполнен и проверен
              </p>
              <p className="text-xs text-emerald-600 mt-0.5">
                Все обязательные поля заполнены. Проверьте итоговый документ и скачайте.
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-semibold text-gray-900">
                  Предварительный просмотр
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
                  title="Печать"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCopyJson}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
                  title="Копировать JSON"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <div className="relative group">
                  <button
                    onClick={handleExportPdf}
                    disabled={isExporting}
                    className="inline-flex items-center justify-center font-medium transition-all px-4 py-2 text-sm rounded-xl gap-2 bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50"
                  >
                    {isExporting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : exportPages > 0 ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    Скачать
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <button
                      onClick={handleExportPdf}
                      disabled={isExporting}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-t-xl transition-colors"
                    >
                      <FileImage className="w-3.5 h-3.5 text-red-500" />
                      Скачать PDF
                      {exportPages > 0 && (
                        <span className="ml-auto text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                          {exportPages} стр.
                        </span>
                      )}
                    </button>
                    <button
                      onClick={handleExportDocx}
                      disabled={isExporting}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-b-xl transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      Скачать DOCX
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {template.printInstruction && (
              <div className="px-5 py-2 bg-amber-50 border-b border-amber-100">
                <p className="text-[11px] text-amber-700">
                  {template.printInstruction}
                </p>
              </div>
            )}
            <div className="overflow-x-auto">
              <div ref={printRef}>
                {packTemplates.map((t, i) => (
                  <div key={t.id}>
                    {packTemplates.length > 1 && (
                      <div className="doc-toolbar px-3 pt-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
                          <span className="text-[11px] font-semibold text-gray-500">
                            {i + 1}/{packTemplates.length}
                          </span>
                          <span className="text-[11px] font-medium text-gray-600 truncate">
                            {t.name}
                          </span>
                        </div>
                      </div>
                    )}
                    <DocPreview html={renderPreview(t)} />
                  </div>
                ))}
              </div>
            </div>
            <div
              ref={flatRef}
              className="hidden"
              dangerouslySetInnerHTML={{ __html: renderPreview() }}
            />
            <div className="px-5 py-4 flex items-center justify-between border-t border-gray-100">
              <button
                onClick={backToForm}
                className="inline-flex items-center justify-center font-medium transition-all px-4 py-2 text-sm rounded-xl gap-2 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Вернуться к форме
              </button>
              <button
                onClick={handleExportPdf}
                disabled={isExporting}
                className="inline-flex items-center justify-center font-medium transition-all px-4 py-2 text-sm rounded-xl gap-2 bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {packTemplates.length > 1
                  ? `Скачать пакет (${packTemplates.length})`
                  : "Скачать документ"}
              </button>
            </div>
          </div>
          </>)}
        </div>

        {/* Right Column */}
        {viewMode === "form" && (<div className="space-y-4">
          {draftInfos.length > 0 &&
            renderCollapsible({
              id: "drafts",
              title: "Мои черновики",
              icon: <Clock className="w-4 h-4 text-brand-600" />,
              children: (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      pushDraftVersion(template.id, formValues, checklist, activeTab);
                      lastVersionRef.current = Date.now();
                      setDraftInfos(getAllDrafts());
                      setShowSaved(true);
                      setTimeout(() => setShowSaved(false), 2000);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-100 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Создать версию документа
                  </button>
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    Версии сохраняются автоматически каждые 30 секунд работы и вручную. Откатиться к любой версии можно на странице «Мои документы».
                  </p>
                  {draftInfos.map((d) => {
                    const t = LEGAL_TEMPLATES.find(
                      (x) => x.id === d.templateId
                    );
                    const isActive = d.templateId === selectedTemplateId;
                    return (
                      <div
                        key={d.templateId}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
                          isActive ? "bg-brand-50" : "bg-gray-50 hover:bg-brand-50"
                        }`}
                      >
                        <button
                          onClick={() => openDraft(d)}
                          className="flex-1 min-w-0 text-left"
                        >
                          <p className="text-xs font-medium text-gray-700 truncate">
                            {t?.name || d.templateId}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {new Date(d.savedAt).toLocaleString("ru-RU")}
                          </p>
                        </button>
                        <button
                          onClick={() => removeDraft(d)}
                          title="Удалить черновик"
                          className="p-1 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ),
            })}
          {getRelatedDocs().length > 0 &&
            renderCollapsible({
              id: "related",
              title: "Связанные документы",
              children: (
                <div className="space-y-2">
                  {packTemplateIds.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pb-1.5 border-b border-gray-100">
                      <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                        В пакете:
                      </span>
                      {packTemplateIds.map((id) => {
                        const packDoc = LEGAL_TEMPLATES.find(
                          (x) => x.id === id
                        );
                        return (
                          <span
                            key={id}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-brand-50 border border-brand-100 text-[10px] font-medium text-brand-700"
                          >
                            {packDoc?.name || id}
                            <button
                              onClick={() => togglePack(id)}
                              className="text-brand-400 hover:text-brand-700 transition-colors"
                              aria-label="Убрать из пакета"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <p className="text-[10px] text-gray-500 pb-1">
                    Отметьте документы — они соберутся в один PDF-файл.
                  </p>
                  {getRelatedDocs().map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-2"
                    >
                      <button
                        onClick={() => selectRelatedTemplate(doc.id)}
                        className="flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-brand-50 text-left transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white flex-shrink-0">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-700">
                            {doc.name.length > 32
                              ? doc.name.slice(0, 32) + "..."
                              : doc.name}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {doc.actSource}
                          </p>
                        </div>
                      </button>
                      <label
                        className="flex items-center gap-1 text-[10px] text-gray-400 cursor-pointer shrink-0"
                        title="Добавить в пакет документов"
                      >
                        <input
                          type="checkbox"
                          className="w-3.5 h-3.5 accent-brand-600"
                          checked={packTemplateIds.includes(doc.id)}
                          onChange={() => togglePack(doc.id)}
                        />
                        пакет
                      </label>
                    </div>
                  ))}
                </div>
              ),
            })}

          {renderCollapsible({
            id: "approval",
            title: "Согласование с контрагентом",
            icon: <Shield className="w-4 h-4 text-brand-600" />,
            children: (
              <div className="space-y-3">
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  Отправьте контрагенту ссылку — он заполнит поля прямо на сайте (7 дней). Изменения будут отмечены в форме.
                </p>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-[11px] text-gray-600 cursor-pointer">
                    <input
                      type="radio"
                      name="approvalMode"
                      className="w-3.5 h-3.5 accent-brand-600"
                      checked={approvalMode === "fill"}
                      onChange={() => setApprovalMode("fill")}
                    />
                    Только поля
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-gray-600 cursor-pointer">
                    <input
                      type="radio"
                      name="approvalMode"
                      className="w-3.5 h-3.5 accent-brand-600"
                      checked={approvalMode === "edit"}
                      onChange={() => setApprovalMode("edit")}
                    />
                    Поля + условия
                  </label>
                </div>
                <button
                  onClick={createApproval}
                  disabled={approvalBusy}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-100 disabled:opacity-60 transition-colors"
                >
                  {approvalBusy ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Link2 className="w-3.5 h-3.5" />
                  )}
                  Создать ссылку для согласования
                </button>
                {approvalMsg && (
                  <p className="text-[10px] font-medium text-brand-700 bg-brand-50 rounded-lg px-2.5 py-1.5">
                    {approvalMsg}
                  </p>
                )}
                {myApprovals.filter((a) => a.template_id === template.id).length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                        Ссылки по этому шаблону
                      </span>
                      <button
                        onClick={loadMyApprovals}
                        className="text-[10px] text-brand-600 hover:text-brand-700"
                      >
                        Обновить
                      </button>
                    </div>
                    {myApprovals
                      .filter((a) => a.template_id === template.id)
                      .slice(0, 3)
                      .map((a) => {
                        const active = new Date(a.expires_at).getTime() > Date.now();
                        const days = Math.max(0, Math.ceil((new Date(a.expires_at).getTime() - Date.now()) / 86400000));
                        return (
                          <div key={a.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                  active
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-gray-200 text-gray-500"
                                }`}
                              >
                                {active ? `Активна ${days} дн.` : "Истекла"}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                открыто {a.opened_count || 0} раз
                              </span>
                            </div>
                            {a.changed ? (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 rounded-lg px-2 py-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  Контрагент внёс изменения
                                </span>
                                <button
                                  onClick={() => applyApproval(a)}
                                  className="ml-auto text-[10px] font-medium text-brand-600 hover:text-brand-700 bg-white rounded-lg px-2 py-1 border border-brand-100"
                                >
                                  Применить
                                </button>
                              </div>
                            ) : (
                              <p className="text-[10px] text-gray-400">
                                Изменений ещё нет
                              </p>
                            )}
                            <div className="flex items-center gap-1.5">
                              <input
                                readOnly
                                value={`${typeof window !== "undefined" ? window.location.origin : ""}/approve/${a.token}`}
                                onFocus={(e) => e.target.select()}
                                className="flex-1 min-w-0 px-2 py-1.5 text-[10px] text-gray-500 bg-white border border-gray-200 rounded-lg focus:outline-none"
                              />
                              <button
                                onClick={() => {
                                  navigator.clipboard
                                    ?.writeText(`${window.location.origin}/approve/${a.token}`)
                                    .then(() => setApprovalMsg("Ссылка скопирована"))
                                    .catch(() => undefined);
                                }}
                                className="p-1.5 text-gray-400 hover:text-brand-600 transition-colors shrink-0"
                                title="Скопировать ссылку"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => showApprovalQr(a.token)}
                                className={`p-1.5 rounded-md transition-colors shrink-0 ${
                                  approvalQr?.token === a.token
                                    ? "text-brand-600 bg-brand-50"
                                    : "text-gray-400 hover:text-brand-600"
                                }`}
                                title="Показать QR-код"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {approvalQr?.token === a.token && approvalQr.svg && (
                              <div className="flex flex-col items-center gap-1 pt-1">
                                <img
                                  src={`data:image/svg+xml;utf8,${encodeURIComponent(approvalQr.svg)}`}
                                  alt="QR-код ссылки для согласования"
                                  className="w-28 h-28 bg-white rounded-lg border border-gray-100 p-1.5"
                                />
                                <span className="text-[9px] text-gray-400">
                                  Отсканируйте для открытия на устройстве
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            ),
          })}

          {renderCollapsible({
            id: "about",
            title: "О шаблоне",
            icon: <Shield className="w-4 h-4 text-brand-600" />,
            children: (
              <div className="space-y-2.5 text-xs text-gray-600">
                <p className="leading-relaxed">{template.description}</p>
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                  <span className="text-[10px] text-gray-400 shrink-0">Правовое основание</span>
                  <span className="text-[11px] font-medium text-gray-700 text-right">
                    {template.actSource}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">Актуализировано</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                    <Check className="w-3 h-3" />
                    {template.lastUpdated}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">Полей для заполнения</span>
                  <span className="text-[11px] font-medium text-gray-700">
                    {template.fields.length}
                  </span>
                </div>
                {["legal", "migration"].includes(template.category) && (
                  <div className="flex items-start gap-1.5 px-2.5 py-2 rounded-lg bg-purple-50 border border-purple-100 text-[10px] font-medium text-purple-700 leading-relaxed">
                    <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                    Шаблон требует проверки юристом: обратите внимание на сроки и полномочия
                  </div>
                )}
              </div>
            ),
          })}

          {similarTemplates.length > 0 &&
            renderCollapsible({
              id: "similar",
              title: "Похожие шаблоны",
              icon: <Copy className="w-4 h-4 text-brand-600" />,
              children: (
                <div className="space-y-2">
                  {similarTemplates.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => selectRelatedTemplate(doc.id)}
                      title={doc.name}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-brand-50 text-left transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white flex-shrink-0">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate">
                          {doc.name.length > 34 ? doc.name.slice(0, 34) + "..." : doc.name}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate">{doc.actSource}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                    </button>
                  ))}
                </div>
              ),
            })}

          {renderCollapsible({
            id: "dadata",
            title: "Автозаполнение по ИНН (DADATA)",
            children: (
              <div className="space-y-3">
                {subscriptionActive ? (
                  <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
                    <Star className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <p className="text-[10px] leading-relaxed text-emerald-700">
                      Активная подписка: автозаполнение реквизитов по ИНН
                      работает автоматически, ваш ключ не требуется.
                    </p>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={dadataKey}
                    onChange={(e) => setDadataKey(e.target.value)}
                    placeholder="API-ключ DADATA (необязательно)"
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                )}
                <div className="space-y-2">
                  <label className="block text-[10px] font-medium text-gray-500">
                    Поиск организации по названию или ИНН
                  </label>
                  <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={partyQuery}
                        onChange={(e) => {
                          setPartyQuery(e.target.value);
                          if (partyResults.length > 0) setPartyResults([]);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            void searchParty();
                          }
                        }}
                        placeholder="Например: ООО Ромашка или ИНН"
                        className="flex-1 min-w-0 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                      />
                      <button
                        onClick={() => void searchParty()}
                        disabled={partyAnalyzing}
                        className="px-3 py-2 rounded-lg text-xs font-medium bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 transition-colors flex-shrink-0"
                      >
                        {partyAnalyzing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Search className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    {partyResults.length > 0 && (
                      <div className="space-y-1">
                        {partyResults.map((r, i) => (
                          <button
                            key={i}
                            onClick={() => applyPartyResult(r)}
                            className="w-full text-left px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-colors"
                          >
                            <p className="text-[11px] font-medium text-gray-800 truncate">
                              {r.value}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {r.data?.inn || "ИНН —"}
                              {r.data?.kpp ? ` • КПП ${r.data.kpp}` : ""}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                {dadataLoading && (
                  <p className="text-[10px] text-gray-400">
                    Загрузка данных ЕГРЮЛ...
                  </p>
                )}
                {dadataMsg && (
                  <p
                    className={`text-[10px] ${
                      dadataMsg.ok ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {dadataMsg.text}
                  </p>
                )}
                <p className="text-[10px] leading-relaxed text-gray-400">
                  {subscriptionActive
                    ? "Запросы обрабатываются серверным прокси (ключ на сервере)."
                    : "Бесплатный план: подстановка по ИНН работает через ваш ключ (бесплатный тариф dadata.ru → «Профиль» → API-ключ). При покупке подписки поле исчезает и всё работает автоматически."}
                </p>
              </div>
            ),
          })}

          {renderCollapsible({
            id: "contractors",
            title: "Контрагенты",
            children: (
              <div className="space-y-2.5">
                {contractors === null ? (
                  <p className="text-[10px] text-gray-400">Загрузка...</p>
                ) : contractors.length === 0 ? (
                  <p className="text-[10px] text-gray-400">
                    Пока нет сохранённых контрагентов: заполните реквизиты
                    стороны в форме и нажмите «Сохранить».
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {contractors.map((c: any) => (
                      <div
                        key={c.id}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200"
                      >
                        <button
                          onClick={() => applyContractor(c)}
                          title="Подставить в форму"
                          className="flex-1 min-w-0 text-left"
                        >
                          <p className="text-[11px] font-medium text-gray-800 truncate">
                            {c.name || "Без названия"}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate">
                            {c.inn ? `ИНН ${c.inn}` : ""}
                            {c.kpp ? ` • КПП ${c.kpp}` : ""}
                            {c.address ? ` • ${c.address}` : ""}
                          </p>
                        </button>
                        <button
                          onClick={() => deleteContractor(c.id)}
                          title="Удалить"
                          className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-1.5">
                  {template.fields.some((f) => f.id.startsWith("seller_")) && (
                    <button
                      onClick={() => void saveContractor("seller")}
                      className="flex-1 px-2 py-1.5 rounded-lg text-[10px] font-medium bg-white border border-gray-200 hover:border-brand-300 hover:bg-brand-50 text-gray-600 transition-colors"
                    >
                      Сохранить продавца
                    </button>
                  )}
                  {template.fields.some((f) => f.id.startsWith("buyer_")) && (
                    <button
                      onClick={() => void saveContractor("buyer")}
                      className="flex-1 px-2 py-1.5 rounded-lg text-[10px] font-medium bg-white border border-gray-200 hover:border-brand-300 hover:bg-brand-50 text-gray-600 transition-colors"
                    >
                      Сохранить покупателя
                    </button>
                  )}
                </div>
                {contractorsMsg && (
                  <p className="text-[10px] text-emerald-600">{contractorsMsg}</p>
                )}
              </div>
            ),
          })}

          {renderCollapsible({
            id: "esign",
            title: "Подписи сторон (e-sign)",
            children: (
              <div className="space-y-4">
                {(
                  [
                    ["seller", "Подпись продавца", signSeller],
                    ["buyer", "Подпись покупателя", signBuyer],
                  ] as const
                ).map(([key, label, img]) => (
                  <div key={key}>
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      {label}
                    </p>
                    {img && (
                      <div className="flex items-center gap-2 mb-1.5">
                        {/* локальная подпись user, dataURL — next/image неприменим */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img}
                          alt={label}
                          className="h-10 border border-gray-200 rounded bg-white p-1"
                        />
                        <button
                          onClick={() => clearSign(key)}
                          className="text-[10px] text-red-500 hover:text-red-600"
                        >
                          Убрать
                        </button>
                      </div>
                    )}
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors">
                      <FileImage className="w-3.5 h-3.5" />
                      {img ? "Заменить подпись" : "Загрузить подпись (PNG)"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        className="hidden"
                        onChange={handleSignUpload(key)}
                      />
                    </label>
                    <button
                      onClick={() => setDrawingFor(key)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <PenLine className="w-3.5 h-3.5" />
                      Нарисовать
                    </button>
                  </div>
                ))}
                <p className="text-[10px] leading-relaxed text-gray-400">
                  Подпись с прозрачным фоном вставится в раздел «Реквизиты и
                  подписи сторон» документа при экспорте в PDF. Подпись
                  сохраняется в этом браузере.
                </p>
              </div>
            ),
          })}

          {renderCollapsible({
            id: "signing",
            title: "Подписание и протокол (ПЭП)",
            children: (
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    checked={signSheetEnabled}
                    onChange={(e) => setSignSheetEnabled(e.target.checked)}
                  />
                  <span className="text-xs text-gray-600">
                    Приложить лист подписания (протокол ПЭП) к PDF-файлу
                  </span>
                </label>
                <p className="text-[10px] leading-relaxed text-gray-400">
                  Простая электронная подпись (ст. 6, 9 закона № 63-ФЗ от
                  06.04.2011) равнозначна собственноручной при соглашении
                  сторон (п. 2 ст. 160 ГК РФ). В протокол войдут дата,
                  стороны и контрольный хеш SHA-256 документа.
                </p>
              </div>
            ),
          })}

          {renderCollapsible({
            id: "checklist",
            title: "Чек-лист перед сделкой",
            children: (
              <div className="space-y-2">
                {[
                  "ПТС и СТС в порядке",
                  "Нет ограничений на регистрацию",
                  "Расписка о получении денег",
                  "Страховка ОСАГО оформлена",
                  "Акт приёма-передачи подписан",
                ].map((item) => (
                  <label
                    key={item}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={!!checklist[item]}
                      onChange={() =>
                        setChecklist((prev) => ({
                          ...prev,
                          [item]: !prev[item],
                        }))
                      }
                      className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-xs text-gray-700">{item}</span>
                  </label>
                ))}
              </div>
            ),
          })}

          {showAudit && auditResults &&
            renderCollapsible({
              id: "audit",
              title: "Правовой аудит",
              icon: <Shield className="w-4 h-4 text-brand-600" />,
              children: (
                <div className="space-y-2">
                  <RiskHeatmap results={auditResults} />
                  {auditResults.map((r, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-2 p-2.5 rounded-lg border text-xs ${getAuditBg(r.type)}`}
                    >
                      {getAuditIcon(r.type)}
                      <span
                        className={
                          r.type === "success"
                            ? "text-emerald-700"
                            : r.type === "error"
                              ? "text-red-700"
                              : "text-amber-700"
                        }
                      >
                        {r.message}
                      </span>
                    </div>
                  ))}
                </div>
              ),
            })}

          {template.fields.some((f) => f.id === "contract_price") &&
            renderCollapsible({
              id: "costs",
              title: "Расходы на сделку",
              icon: <Calculator className="w-4 h-4 text-brand-600" />,
              children: (
                <>
                  <div className="mb-3">
                    <label className="block text-[10px] font-medium text-gray-500 mb-1">
                      Срок владения (лет)
                    </label>
                    <select
                      value={ownershipYears}
                      onChange={(e) => setOwnershipYears(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    >
                      <option value="">Не указано</option>
                      <option value="1">1 год</option>
                      <option value="2">2 года</option>
                      <option value="3">3 года</option>
                      <option value="4">4+ лет</option>
                      <option value="5">5+ лет</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    {costCalc.items.map((item, i) => (
                      <div
                        key={i}
                        title={item.pending ? item.note : undefined}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                          item.type === "total"
                            ? "bg-brand-50 font-medium"
                            : "bg-gray-50"
                        }`}
                      >
                        <span
                      className={`text-xs ${
                        item.type === "total"
                          ? "text-brand-900"
                          : "text-gray-700"
                      }`}
                    >
                      {item.label}
                      {item.pending && (
                        <span className="block text-[10px] text-amber-600 font-normal">
                          {item.note}
                        </span>
                      )}
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        item.type === "total"
                          ? "text-brand-700"
                          : item.pending
                            ? "text-amber-500"
                            : item.amount === 0
                              ? "text-emerald-600"
                              : "text-gray-900"
                      }`}
                    >
                      {item.pending ? "—" : `${item.amount.toLocaleString("ru-RU")} ₽`}
                    </span>
                  </div>
                ))}
              </div>
                  {costCalc.items.some((item) => item.pending) && (
                    <div className="mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-700">
                      Укажите срок владения, чтобы рассчитать НДФЛ
                    </div>
                  )}
                </>
              ),
            })}
        </div>
        )}
      </div>
      )}

      {drawingFor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setDrawingFor(null)}
        >
          <div
            className="bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold text-gray-900 mb-0.5">
              Нарисуйте подпись
            </h3>
            <p className="text-[11px] text-gray-400 mb-3">
              {drawingFor === "seller" ? "Продавец" : "Покупатель"} — пальцем,
              мышью или стилусом
            </p>
            <canvas
              ref={signCanvasRef}
              width={500}
              height={160}
              onPointerDown={onSignCanvasDown}
              onPointerMove={onSignCanvasMove}
              onPointerUp={onSignCanvasUp}
              onPointerLeave={onSignCanvasUp}
              className="w-full h-40 border border-gray-200 rounded-lg bg-white touch-none cursor-crosshair"
            />
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={clearSignCanvas}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Очистить
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDrawingFor(null)}
                  className="px-4 py-2 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={saveDrawnSign}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 transition-colors"
                >
                  Сохранить подпись
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FioDeclineHint({ fio }: { fio: string }) {
  const cases = useMemo(() => declineFullFio(fio), [fio]);
  const items: [string, keyof FioCases][] = [
    ["Родительный", "gen"],
    ["Дательный", "dat"],
    ["Винительный", "acc"],
    ["Творительный", "ins"],
    ["Предложный", "pre"],
  ];
  return (
    <div className="mt-1.5 p-2 rounded-lg bg-purple-50 border border-purple-100">
      <p className="text-[10px] font-medium text-purple-700 mb-1">
        Склонение ФИО для текста документа:
      </p>
      <div className="space-y-0.5">
        {items.map(([label, key]) => (
          <button
            key={key}
            onClick={() => navigator.clipboard.writeText(cases[key])}
            title="Нажмите, чтобы скопировать"
            className="w-full flex items-baseline justify-between gap-2 text-[11px] text-gray-600 hover:text-purple-700 hover:bg-white rounded px-1 py-0.5 transition-colors"
          >
            <span className="text-gray-400 flex-shrink-0">{label}</span>
            <span className="truncate">{cases[key]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  return <HomeContent />;
}

function RiskHeatmap({ results }: { results: AuditResult[] }) {
  const errorCount = results.filter((r) => r.type === "error").length;
  const warningCount = results.filter((r) => r.type === "warning").length;
  const rawScore = Math.min(100, errorCount * 35 + warningCount * 10);
  const score = errorCount === 0 && rawScore > 30 ? 30 : rawScore;
  const level =
    score === 0
      ? { label: "Низкий риск", color: "text-emerald-700", bar: "bg-emerald-500", width: "10%" }
      : score < 30
        ? { label: "Низкий риск", color: "text-emerald-700", bar: "bg-emerald-500", width: `${Math.max(10, score)}%` }
        : score < 60
          ? { label: "Средний риск", color: "text-amber-700", bar: "bg-amber-500", width: `${score}%` }
          : { label: "Высокий риск", color: "text-red-700", bar: "bg-red-500", width: `${score}%` };

  return (
    <div className="p-3 rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-bold ${level.color}`}>
          {level.label} · {errorCount} ошибок, {warningCount} предупреждений
        </span>
        <span className="text-[10px] text-gray-400">риск {score}/100</span>
      </div>
      <div className="h-2 rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500 overflow-hidden relative">
        <div
          className="absolute inset-y-0 left-0 bg-gray-200/40"
          style={{ width: `${100 - score}%`, right: 0, left: "auto" }}
        />
        <div className="absolute inset-y-0 left-0 w-0.5 bg-gray-900" style={{ left: `${score}%` }} />
      </div>
      <p className="mt-2 text-[10px] text-gray-500 leading-snug">
        {errorCount === 0 && warningCount === 0
          ? "Документ заполнен корректно, критических рисков не обнаружено."
          : errorCount > 0
            ? "Исправьте ошибки до подписания: они могут сделать документ недействительным."
            : "Документ можно подписывать, но рекомендуем устранить предупреждения."}
      </p>
    </div>
  );
}
