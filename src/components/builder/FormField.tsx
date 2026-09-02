import { AlertCircle, AlertTriangle, CheckCircle, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { TemplateField } from "@/data/types";
import { normalizeOptions, type AuditResult } from "@/lib/validation";
import { applyFieldFormat } from "@/lib/format";
import FioDeclineHint from "./FioDeclineHint";
import { useDadataSuggest, type SuggestOption } from "./DadataSuggest";

interface FormFieldProps {
  field: TemplateField;
  value: string;
  audit: AuditResult[];
  onChange: (fieldId: string, value: string) => void;
  onBlurNormalize: (fieldId: string) => void;
  onInnBlur: (fieldId: string) => void;
  onSuggestFill?: (pairs: Record<string, string>) => void;
}

const AUTOCOMPLETE_HINTS: Record<string, string> = {
  fio: "name",
  address: "street-address",
  city: "address-level2",
  phone: "tel",
  email: "email",
  inn: "organization",
};

function getInputHints(field: TemplateField) {
  const id = field.id.toLowerCase();
  const key = Object.keys(AUTOCOMPLETE_HINTS).find((k) => id.includes(k));
  return {
    autoComplete: key ? AUTOCOMPLETE_HINTS[key] : undefined,
    inputMode: field.type === "number" ? ("numeric" as const) : undefined,
  };
}

export default function FormField({
  field,
  value,
  audit,
  onChange,
  onBlurNormalize,
  onInnBlur,
  onSuggestFill,
}: FormFieldProps) {
  const [focused, setFocused] = useState(false);
  const hasError = audit.some((r) => r.type === "error");
  const hasWarn = !hasError && audit.some((r) => r.type === "warning");
  const errorMsg = audit.find((r) => r.type === "error")?.message;
  const warnMsg = !errorMsg && audit.find((r) => r.type === "warning")?.message;
  const successMsg =
    !hasError &&
    !hasWarn &&
    audit.find((r) => r.type === "success")?.message;

  const suggestOp =
    field.type === "text"
      ? field.id.includes("passport_code")
        ? ("suggest-fms-unit" as const)
        : field.id.includes("address")
          ? ("suggest-address" as const)
          : field.id.includes("fio")
            ? ("suggest-fio" as const)
            : field.id.includes("passport_series") || field.id.includes("passport_number")
              ? ("suggest-passport" as const)
              : null
      : null;
  const { suggestions, loading, query, clear } = useDadataSuggest(
    suggestOp === "suggest-fms-unit"
      ? "suggest-fms-unit"
      : suggestOp === "suggest-fio"
      ? "suggest-fio"
      : suggestOp === "suggest-passport"
      ? "suggest-passport"
      : "suggest-address"
  );
  const [showSuggest, setShowSuggest] = useState(false);
  const pickedRef = useRef(false);

  useEffect(() => {
    if (suggestOp && focused && !pickedRef.current) {
      query(value);
    }
  }, [value, focused, suggestOp, query]);

  const pickSuggestion = (opt: SuggestOption) => {
    pickedRef.current = true;
    onChange(field.id, opt.fillValue);
    let extra = opt.extra ?? {};
    if (suggestOp === "suggest-fms-unit" && opt.sub) {
      const prefix = field.id.replace(/_passport_code$/, "");
      extra = {
        ...extra,
        [`${prefix}_passport_issued_by`]: opt.sub,
        [`${prefix}_passport_by`]: opt.sub,
        [`${prefix}_passport_issued`]: opt.sub,
      };
    }
    if (suggestOp === "suggest-fio") {
      const prefix = field.id.replace(/_fio$/, "");
      extra = {
        ...extra,
        [`${prefix}birthday`]: extra.birthdate || "",
        [`${prefix}snils`]: extra.snils || "",
        [`${prefix}inn`]: extra.inn || "",
      };
    }
    if (suggestOp === "suggest-passport") {
      const prefix = field.id.replace(/(passport_series|passport_number)$/, "");
      extra = {
        ...extra,
        [`${prefix}passport_issued_by`]: extra.issued_by || extra.passport_issued_by || "",
        [`${prefix}passport_by`]: extra.issued_by || extra.passport_issued_by || "",
        [`${prefix}passport_issued`]: extra.issue_date || extra.passport_issue_date || "",
        [`${prefix}passport_code`]: extra.code || extra.passport_code || "",
      };
    }
    if (Object.keys(extra).length > 0 && onSuggestFill) {
      onSuggestFill(extra);
    }
    clear();
    setShowSuggest(false);
  };

  const showDropdown = showSuggest && suggestions.length > 0;

  const fieldMessage =
    (errorMsg && (
      <p className="flex items-center gap-1 mt-1 text-[11px] text-red-600">
        <AlertCircle className="w-3 h-3 flex-shrink-0" />
        {errorMsg}
      </p>
    )) ||
    (warnMsg && (
      <p className="flex items-center gap-1 mt-1 text-[11px] text-amber-700">
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

  const exampleHint =
    value === "" &&
    field.defaultValue !== "" &&
    (field.type === "text" || field.type === "number" || field.type === "textarea") ? (
      <p className="text-[10px] text-gray-600 mt-0.5">
        Пример: {field.defaultValue}
      </p>
    ) : null;

  const baseInputClass = `w-full px-3 py-2 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all ${
    hasError
      ? "border-red-400"
      : hasWarn
        ? "border-amber-300"
        : "border-gray-200"
  }`;

  const requiredMark = field.validation?.required && (
    <span className="text-red-500 ml-0.5">*</span>
  );

  if (field.type === "radio" && field.options) {
    const opts = normalizeOptions(field.options);
    return (
      <div data-field={field.id} className="col-span-2">
        <label className="block text-xs font-medium text-gray-700 mb-2">
          {field.label}
          {requiredMark}
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
                onChange={(e) => onChange(field.id, e.target.value)}
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
      <div data-field={field.id} className="col-span-2">
        <label className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={value === "true"}
            onChange={(e) =>
              onChange(field.id, e.target.checked ? "true" : "false")
            }
            className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-xs text-gray-700">{field.label}</span>
        </label>
        {fieldMessage}
      </div>
    );
  }

  if (field.type === "select" && field.options) {
    const opts = normalizeOptions(field.options);
    return (
      <div data-field={field.id}>\n        <label className="block text-xs font-medium text-gray-700 mb-1">
          {field.label}
          {requiredMark}
        </label>
        <select
          id={field.id}
          value={value}
          onChange={(e) => onChange(field.id, e.target.value)}
          className={baseInputClass}
        >
          <option value="">Выберите...</option>
          {opts.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {field.obsoleteValues?.includes(value) && (
          <p className="flex items-start gap-1.5 mt-1 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-px" />
            <span>
              Устаревшая версия бланка. Проверьте, что ваш документ примут к
              рассмотрению — рекомендуется действующая редакция.
            </span>
          </p>
        )}
        {field.validation?.helpText && (
          <p className="text-[10px] text-gray-600 mt-0.5">
            {field.validation.helpText}
          </p>
        )}
        {fieldMessage}
        {exampleHint}
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div data-field={field.id} className="col-span-2">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          {field.label}
          {requiredMark}
        </label>
        <textarea
          id={field.id}
          rows={field.rows || 3}
          value={value}
          placeholder={field.placeholder}
          onChange={(e) => onChange(field.id, applyFieldFormat(field, e.target.value))}
          onBlur={() => onBlurNormalize(field.id)}
          className={`${baseInputClass} resize-none`}
        />
        {field.validation?.helpText && (
          <p className="text-[10px] text-gray-600 mt-0.5">
            {field.validation.helpText}
          </p>
        )}
        {fieldMessage}
        {exampleHint}
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
      onChange(field.id, JSON.stringify(newItems));
    };

    const removeItem = (idx: number) => {
      const newItems = items.filter((_, i) => i !== idx);
      onChange(field.id, JSON.stringify(newItems));
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
      onChange(field.id, JSON.stringify(newItems));
    };

    const total = items.reduce((sum, item) => sum + Number(item.sum || 0), 0);

    return (
      <div data-field={field.id} className="col-span-2">
        <label className="block text-xs font-medium text-gray-700 mb-2">
          {field.label}
        </label>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Мобильные карточки */}
          <div className="block sm:hidden divide-y divide-gray-100">
            {items.map((item, idx) => (
              <div key={idx} className="p-3 space-y-2">
                {field.repeatingFields!.map((rf) => (
                  <div key={rf.id} className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 w-1/3">{rf.label}</span>
                    <input
                      type={rf.type === "number" ? "number" : "text"}
                      value={item[rf.id] || ""}
                      onChange={(e) => updateItem(idx, rf.id, e.target.value)}
                      className="flex-1 px-2 py-1 text-xs bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                ))}
                <div className="flex justify-end">
                  <button onClick={() => removeItem(idx)} className="p-1 hover:bg-red-50 rounded text-gray-600 hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {/* Десктопная таблица */}
          <table className="w-full text-xs hidden sm:table">
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
                      className="p-1 hover:bg-red-50 rounded text-gray-600 hover:text-red-500 transition-colors"
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
        {field.hint && (
          <p className="flex items-start gap-1.5 mt-1 text-[10px] text-brand-700 bg-brand-50 border border-brand-100 rounded-lg px-2.5 py-1.5">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-px" />
            <span>{field.hint}</span>
          </p>
        )}
        {fieldMessage}
      </div>
    );
  }

  const { autoComplete, inputMode } = getInputHints(field);

  return (
    <div data-field={field.id}>
      <label htmlFor={field.id} className="block text-xs font-medium text-gray-700 mb-1">
        {field.label}
        {requiredMark}
      </label>
      <div className="relative">
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
          autoComplete={autoComplete}
          inputMode={inputMode}
          onChange={(e) => {
            pickedRef.current = false;
            onChange(field.id, applyFieldFormat(field, e.target.value));
          }}
          onBlur={() => {
            setFocused(false);
            setShowSuggest(false);
            if (field.type === "text") {
              onBlurNormalize(field.id);
              if (field.id.includes("inn")) onInnBlur(field.id);
            }
          }}
          onFocus={() => {
            setFocused(true);
            if (suggestOp) setShowSuggest(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setShowSuggest(false);
              (e.target as HTMLInputElement).blur();
            }
          }}
          aria-invalid={hasError || undefined}
          list={
            field.suggestions && field.suggestions.length > 0
              ? `datalist-${field.id}`
              : undefined
          }
          className={baseInputClass}
        />
        {showDropdown && (
          <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            <ul className="max-h-56 overflow-y-auto">
              {suggestions.map((s, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pickSuggestion(s)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-800 hover:bg-brand-50 transition-colors"
                  >
                    <span className="block">{s.value}</span>
                    {s.sub && s.sub !== s.value && (
                      <span className="block text-[11px] text-gray-600">{s.sub}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-600">
            ищем…
          </span>
        )}
      </div>
      {field.suggestions && field.suggestions.length > 0 && (
        <datalist id={`datalist-${field.id}`}>
          {field.suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      )}
      {field.validation?.helpText && (
        <p className="text-[10px] text-gray-600 mt-0.5">
          {field.validation.helpText}
        </p>
      )}
      {field.hint && (
        <p className="flex items-start gap-1.5 mt-1 text-[10px] text-brand-700 bg-brand-50 border border-brand-100 rounded-lg px-2.5 py-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-px" />
          <span>{field.hint}</span>
        </p>
      )}
      {fieldMessage}
      {exampleHint}
      {field.type === "text" && field.id.includes("fio") && value.trim().split(/\s+/).length >= 2 && (
        <FioDeclineHint
          fio={value}
          focused={focused}
          onInsert={(v) => onChange(field.id, v)}
        />
      )}
      {field.type === "text" && field.id.includes("inn") && (
        <a
          href="https://egrul.nalog.ru"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-1 text-[10px] text-gray-600 hover:text-brand-600 transition-colors"
        >
          <Search className="w-3 h-3" />
          Свериться с ЕГРЮЛ на egrul.nalog.ru
        </a>
      )}
    </div>
  );
}
