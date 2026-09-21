"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { LegalTemplate, TemplateField } from "@/data/types";
import { normalizeOptions } from "@/lib/validation";
import { createClient } from "@/lib/supabase/client";
import { trackOwnOnly } from "@/lib/analytics";
import { Check, Loader2, Shield, AlertTriangle, Clock, Lock, Eye, EyeOff, Sparkles } from "lucide-react";

/* ── K-фактор: атрибуция регистрации по ссылке согласования ───────── */

const APPROVAL_REF_KEY = "dogovor_approval_ref";
const APPROVAL_REF_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/* ── API shape ─────────────────────────────────────────────────────── */

interface LockedData {
  locked: true;
  requiresPassword: boolean;
  templateId: string;
  expiresAt: string;
}

interface UnlockedData {
  locked: false;
  templateId: string;
  values: Record<string, string>;
  checklist: Record<string, boolean>;
  changed: boolean;
  expiresAt: string;
  accessToken?: string;
  accessExpiresAt?: string;
}

type ApprovalData = LockedData | UnlockedData;

/* ── Page ──────────────────────────────────────────────────────────── */

export default function ApprovePage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [data, setData] = useState<ApprovalData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [values, setValues] = useState<Record<string, string>>({});
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [template, setTemplate] = useState<LegalTemplate | null>(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  /* ── Auth state (чтобы не показывать CTA владельцу) ───────────── */

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: u }) => setIsAuthed(!!u.user))
      .catch(() => {});
  }, []);

  /* ── Restore accessToken from sessionStorage ──────────────────── */

  useEffect(() => {
    const stored = sessionStorage.getItem(`approval_access_${token}`);
    if (stored) setAccessToken(stored);
  }, [token]);

  /* ── Fetch approval data ──────────────────────────────────────── */

  const fetchData = useCallback(
    async (access?: string) => {
      setLoading(true);
      setError(null);
      try {
        const qs = access ? `?access=${encodeURIComponent(access)}` : "";
        const r = await fetch(`/api/approval/${token}${qs}`);
        if (!r.ok) {
          const j = (await r.json().catch(() => ({}))) as { error?: string };
          throw new Error(j.error || "Ошибка загрузки");
        }
        const d = (await r.json()) as ApprovalData;
        setData(d);

        if (!d.locked) {
          setValues(d.values || {});
          setChecklist(d.checklist || {});
          if (d.accessToken) {
            setAccessToken(d.accessToken);
            sessionStorage.setItem(`approval_access_${token}`, d.accessToken);
          }
          const tpl = await import("@/data/legalTemplates").then(({ LEGAL_TEMPLATES }) =>
            LEGAL_TEMPLATES.find((t) => t.id === d.templateId) || null
          );
          setTemplate(tpl);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ошибка");
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    void fetchData(accessToken ?? undefined);
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── K-фактор: открытие ссылки + маркер атрибуции ─────────────── */

  const openedTracked = useRef(false);
  useEffect(() => {
    if (!data) return;
    if (!openedTracked.current) {
      openedTracked.current = true;
      trackOwnOnly("approval_opened", { template: data.templateId });
    }
    try {
      const raw = localStorage.getItem(APPROVAL_REF_KEY);
      const prev = raw ? (JSON.parse(raw) as { ts?: number }) : null;
      const now = Date.now();
      if (!prev || typeof prev.ts !== "number" || now - prev.ts > APPROVAL_REF_TTL_MS) {
        localStorage.setItem(
          APPROVAL_REF_KEY,
          JSON.stringify({ template: data.templateId, ts: now })
        );
      }
    } catch {
      /* localStorage недоступен — не критично */
    }
  }, [data]);

  /* ── Unlock with password ─────────────────────────────────────── */

  const unlock = async () => {
    if (!password.trim()) return;
    setUnlocking(true);
    setUnlockError(null);
    try {
      const r = await fetch(`/api/approval/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error || "Неверный пароль");
      }
      const d = (await r.json()) as UnlockedData;
      setData(d);
      setValues(d.values || {});
      setChecklist(d.checklist || {});
      if (d.accessToken) {
        setAccessToken(d.accessToken);
        sessionStorage.setItem(`approval_access_${token}`, d.accessToken);
      }
      setPassword("");
      const tpl = await import("@/data/legalTemplates").then(({ LEGAL_TEMPLATES }) =>
        LEGAL_TEMPLATES.find((t) => t.id === d.templateId) || null
      );
      setTemplate(tpl);
      trackOwnOnly("approval_unlocked", { template: d.templateId });
    } catch (e) {
      setUnlockError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setUnlocking(false);
    }
  };

  /* ── Save edits ───────────────────────────────────────────────── */

  const save = async () => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = { values, checklist };
      if (accessToken) body.accessToken = accessToken;
      const r = await fetch(`/api/approval/${token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error("Не удалось сохранить");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Не удалось сохранить изменения. Попробуйте ещё раз.");
    } finally {
      setSaving(false);
    }
  };

  /* ── UI: loading ──────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
      </div>
    );
  }

  /* ── UI: error / expired ──────────────────────────────────────── */

  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {error === "expired" ? "Ссылка истекла" : "Ссылка не найдена"}
          </h1>
          <p className="text-sm text-gray-600">
            {error === "expired"
              ? "Срок действия ссылки истёк. Попросите контрагента отправить новую ссылку."
              : "Проверьте правильность ссылки или попросите отправить её заново."}
          </p>
        </div>
      </div>
    );
  }

  /* ── UI: locked (password required) ───────────────────────────── */

  if (data.locked) {
    const msLeft = Math.max(0, new Date(data.expiresAt).getTime() - Date.now());
    const hoursLeft = Math.ceil(msLeft / 3600000);
    const expiresLabel = hoursLeft < 24 ? `${hoursLeft} ч.` : `${Math.ceil(hoursLeft / 24)} дн.`;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white">
              <Lock className="w-7 h-7" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-gray-900 text-center mb-1">Доступ защищён</h1>
          <p className="text-sm text-gray-600 text-center mb-6">
            Этот документ защищён паролем. Запросите пароль у владельца.
          </p>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Пароль доступа</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setUnlockError(null); }}
                onKeyDown={(e) => { if (e.key === "Enter") void unlock(); }}
                placeholder="Введите пароль"
                autoFocus
                className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {unlockError && (
              <p className="mt-2 text-xs text-red-600">{unlockError}</p>
            )}

            <button
              onClick={() => void unlock()}
              disabled={unlocking || !password.trim()}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-60 transition-colors"
            >
              {unlocking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {unlocking ? "Проверка…" : "Открыть документ"}
            </button>
          </div>

          <p className="mt-4 text-[10px] text-gray-600 text-center">
            Ссылка действует {expiresLabel} · защищена по 152-ФЗ
          </p>
        </div>
      </div>
    );
  }

  /* ── UI: unlocked (form) ──────────────────────────────────────── */

  if (!template) {
    return <div className="p-6 text-center text-gray-600">Шаблон не найден</div>;
  }

  const msLeft = Math.max(0, new Date(data.expiresAt).getTime() - Date.now());
  const hoursLeft = Math.ceil(msLeft / 3600000);
  const expiresLabel = hoursLeft < 24 ? `${hoursLeft} ч.` : `${Math.ceil(hoursLeft / 24)} дн.`;
  const fields = template.fields.filter((f) => f.type !== "repeating");

  const setValue = (id: string, v: string) => setValues((prev) => ({ ...prev, [id]: v }));
  const setCond = (id: string, v: boolean) => setChecklist((prev) => ({ ...prev, [id]: v }));

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Согласование документа</h1>
            <p className="text-sm text-gray-600">
              {template.name} · отправлено для согласования
            </p>
          </div>
        </div>

        <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 leading-relaxed">
            <b>Внешняя ссылка для согласования</b> · действует {expiresLabel} · содержит
            персональные данные сторон по 152-ФЗ. Не передавайте её третьим лицам,
            не публикуйте в открытых источниках. После согласования попросите
            владельца закрыть доступ.
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
            <p className="text-sm font-medium text-gray-700">
              {data.changed ? "Контрагент уже вносил изменения — они видны владельцу" : "Заполните поля документа"}
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-1.5">
              <Clock className="w-3.5 h-3.5" />
              Ссылка действует {expiresLabel}
            </span>
          </div>

          {Object.keys(checklist).length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-purple-50 border border-purple-100">
              <p className="text-xs font-semibold text-purple-800 mb-2">
                Условия договора (вы можете изменить выбор)
              </p>
              <div className="space-y-1.5">
                {Object.entries(checklist).map(([id, val]) => (
                  <label key={id} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-purple-600"
                      checked={!!val}
                      onChange={(e) => setCond(id, e.target.checked)}
                    />
                    {id}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {fields.map((f: TemplateField) => {
              const val = values[f.id] ?? "";
              return (
                <div key={f.id}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {f.label}
                    {f.validation?.required && <span className="text-red-400 ml-0.5">*</span>}
                  </label>
                  {f.type === "select" || f.type === "radio" ? (
                    <select
                      value={val}
                      onChange={(e) => setValue(f.id, e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    >
                      <option value="">—</option>
                      {normalizeOptions(f.options).map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : f.type === "checkbox" ? (
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-brand-600"
                      checked={val === "true"}
                      onChange={(e) => setValue(f.id, e.target.checked ? "true" : "false")}
                    />
                  ) : (
                    <input
                      type={f.type === "date" ? "date" : "text"}
                      placeholder={f.placeholder}
                      value={val}
                      onChange={(e) => setValue(f.id, e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  )}
                  {f.validation?.helpText && (
                    <p className="mt-1 text-[10px] text-gray-600">{f.validation.helpText}</p>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={() => { void save(); }}
            disabled={saving}
            className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-60 transition-colors"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4" />
            ) : null}
            {saved ? "Изменения сохранены" : "Сохранить изменения"}
          </button>
          <p className="mt-3 text-[10px] text-gray-600 text-center">
            Внесённые изменения увидят владелец документа. Согласование не является юридической консультацией.
          </p>
        </div>

        {!isAuthed && (
          <div className="mt-6 bg-gradient-to-br from-brand-50 to-indigo-50 rounded-2xl border border-brand-100 p-6 text-center">
            <div className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-5 h-5 text-brand-500" />
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Нужен свой документ?</p>
            <p className="text-xs text-gray-600 mb-4">
              Соберите договор бесплатно в конструкторе Dogovor.expert — 369 шаблонов, экспорт в PDF и Word.
            </p>
            <Link
              href="/builder?ref=approval"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
            >
              Создать документ бесплатно
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
