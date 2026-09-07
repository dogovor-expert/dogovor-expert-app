"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { LegalTemplate, TemplateField } from "@/data/types";
import { normalizeOptions } from "@/lib/validation";
import { Check, Loader2, Shield, AlertTriangle, Clock } from "lucide-react";

interface ApprovalData {
  templateId: string;
  mode: "fill" | "edit";
  values: Record<string, string>;
  checklist: Record<string, boolean>;
  changed: boolean;
  expiresAt: string;
}

export default function ApprovePage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const [data, setData] = useState<ApprovalData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<Record<string, string>>({});
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [template, setTemplate] = useState<LegalTemplate | null>(null);

  useEffect(() => {
    fetch(`/api/approval/${token}?view=1`)
      .then((r) => (r.ok ? r.json() : r.json().then((j) => Promise.reject(new Error(j.error || "Ошибка")))))
      .then((d) => {
        setData(d);
        setValues(d.values || {});
        setChecklist(d.checklist || {});
        return import("@/data/legalTemplates").then(({ LEGAL_TEMPLATES }) =>
          LEGAL_TEMPLATES.find((t) => t.id === d.templateId) || null
        );
      })
      .then((tpl) => setTemplate(tpl))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
      </div>
    );
  }

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
              ? "Срок действия ссылки (7 дней) истёк. Попросите контрагента отправить новую ссылку."
              : "Проверьте правильность ссылки или попросите отправить её заново."}
          </p>
        </div>
      </div>
    );
  }

  if (!template) {
    return <div className="p-6 text-center text-gray-600">Шаблон не найден</div>;
  }

  const msLeft = Math.max(0, new Date(data.expiresAt).getTime() - Date.now());
  const hoursLeft = Math.ceil(msLeft / 3600000);
  const expiresLabel = hoursLeft < 24 ? `${hoursLeft} ч.` : `${Math.ceil(hoursLeft / 24)} дн.`;
  const canEditConditions = data.mode === "edit";
  const fields = template.fields.filter((f) => f.type !== "repeating");

  const setValue = (id: string, v: string) => setValues((prev) => ({ ...prev, [id]: v }));
  const setCond = (id: string, v: boolean) => setChecklist((prev) => ({ ...prev, [id]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const r = await fetch(`/api/approval/${params.token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values, checklist }),
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

        {/* Баннер: ссылка одноразовая, не передавайте третьим лицам.
            Содержит ПДн сторон, не предназначена для публикации. */}
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

          {canEditConditions && (
            <div className="mb-6 p-4 rounded-xl bg-purple-50 border border-purple-100">
              <p className="text-xs font-semibold text-purple-800 mb-2">
                Условия договора (вы можете изменить выбор)
              </p>
              {Object.keys(checklist).length > 0 ? (
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
              ) : (
                <p className="text-xs text-purple-500">Условия не требуют выбора</p>
              )}
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
            onClick={() => {
              void save();
            }}
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
      </div>
    </div>
  );
}
