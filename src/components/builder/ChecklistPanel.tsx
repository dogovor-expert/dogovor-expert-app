"use client";

import { useMemo, useState } from "react";
import {
  Info,
  ExternalLink,
  FilePlus2,
  CheckCircle2,
  Circle,
} from "lucide-react";
import type { LegalTemplate } from "@/data/types";
import {
  getChecklist,
  groupChecklist,
  isItemSatisfied,
  type ChecklistCtx,
  type ChecklistItem,
} from "@/lib/checklist";

type Perspective = "all" | "buyer" | "seller";

interface ChecklistPanelProps {
  template: LegalTemplate;
  checklist: Record<string, boolean>;
  onChange: (item: string, checked: boolean) => void;
  packTemplateIds: string[];
  suggestedDocs: string[];
  onAddDoc: (docId: string) => void;
  formValues: Record<string, string>;
}

const KIND_BADGE: Record<ChecklistItem["kind"], { label: string; cls: string }> = {
  doc: { label: "Документ", cls: "bg-slate-100 text-slate-600" },
  gov: { label: "Гос. проверка", cls: "bg-sky-50 text-sky-600" },
  companion: { label: "Документ сервиса", cls: "bg-brand-50 text-brand-600" },
  contract: { label: "Условие договора", cls: "bg-violet-50 text-violet-600" },
  party: { label: "Стороны", cls: "bg-amber-50 text-amber-700" },
};

export default function ChecklistPanel({
  template,
  checklist,
  onChange,
  packTemplateIds,
  suggestedDocs,
  onAddDoc,
  formValues,
}: ChecklistPanelProps) {
  const [perspective, setPerspective] = useState<Perspective>("all");

  const ctx = useMemo<ChecklistCtx>(
    () => ({
      template,
      formValues: {
        ...formValues,
        // Статус брака продавца управляется самим чек-листом (нет необходимости
        // править каждый шаблон): сохраняем в записи чек-листа под служебным ключом.
        seller_married: checklist["_seller_married"] ? "yes" : "",
      },
      suggestedDocs,
    }),
    [template, formValues, suggestedDocs, checklist]
  );

  const showMarital =
    template.category === "realty" || template.category === "auto";
  const married = !!checklist["_seller_married"];

  const groups = useMemo(() => {
    const all = getChecklist(ctx);
    const filtered = all.filter(
      (it) =>
        perspective === "all" ||
        !it.perspective ||
        it.perspective === perspective
    );
    return groupChecklist(filtered);
  }, [ctx, perspective]);

  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const done = groups.reduce(
    (n, g) =>
      n +
      g.items.filter((it) => isItemSatisfied(it, ctx, checklist, packTemplateIds))
        .length,
    0
  );
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div>
      {/* Переключатель роли */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-3">
        {(
          [
            ["all", "Все"],
            ["buyer", "Покупатель"],
            ["seller", "Продавец"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setPerspective(id)}
            className={`flex-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
              perspective === id
                ? "bg-white text-brand-700 shadow-sm"
                : "text-slate-600 hover:text-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Прогресс */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <span className="text-[11px] font-medium text-slate-600">
          Готово {done}/{total}
        </span>
        <div className="flex-1 mx-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              pct === 100 ? "bg-emerald-500" : "bg-brand-500"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-[11px] font-medium text-slate-600">{pct}%</span>
      </div>

      <div className="space-y-3">
        {showMarital && (
          <div className="rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-2.5">
            <p className="text-[11px] font-medium text-amber-800 mb-1.5">
              Продавец состоит в браке?
            </p>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => onChange("_seller_married", true)}
                className={`flex-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  married
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-white text-amber-700 border border-amber-200"
                }`}
              >
                Да
              </button>
              <button
                type="button"
                onClick={() => onChange("_seller_married", false)}
                className={`flex-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  checklist["_seller_married"] === false
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-white text-amber-700 border border-amber-200"
                }`}
              >
                Нет / не знаю
              </button>
            </div>
            <p className="mt-1.5 text-[10px] leading-snug text-amber-700">
              Если да — появится пункт «Согласие супруга» (нужно при совместном
              имуществе).
            </p>
          </div>
        )}
        {groups.map((g) => {
          const groupDone = g.items.filter((it) =>
            isItemSatisfied(it, { ...ctx, formValues: {} }, checklist, packTemplateIds)
          ).length;
          return (
            <div key={g.group}>
              <div className="flex items-center justify-between px-1 mb-1.5">
                <span className="text-[11px] font-semibold text-slate-600">
                  {g.group}
                </span>
                <span className="text-[10px] text-slate-600">
                  {groupDone}/{g.items.length}
                </span>
              </div>
              <div className="space-y-1.5">
                {g.items.map((item) => (
                  <ChecklistRow
                    key={item.id}
                    item={item}
                    satisfied={isItemSatisfied(
                      item,
                      { ...ctx, formValues: {} },
                      checklist,
                      packTemplateIds
                    )}
                    checked={!!checklist[item.id]}
                    inPack={
                      !!item.docId && packTemplateIds.includes(item.docId)
                    }
                    packAvailable={
                      !!item.docId && suggestedDocs.includes(item.docId)
                    }
                    onToggle={() => onChange(item.id, !checklist[item.id])}
                    onAddDoc={() => item.docId && onAddDoc(item.docId)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 px-1 text-[10px] leading-relaxed text-slate-600">
        Чек-лист — памятка для самопроверки, а не юридическая гарантия. Для
        сложных или крупных сделок рекомендуем консультацию юриста.
      </p>
    </div>
  );
}

function ChecklistRow({
  item,
  satisfied,
  checked,
  inPack,
  packAvailable,
  onToggle,
  onAddDoc,
}: {
  item: ChecklistItem;
  satisfied: boolean;
  checked: boolean;
  inPack: boolean;
  packAvailable: boolean;
  onToggle: () => void;
  onAddDoc: () => void;
}) {
  const badge = KIND_BADGE[item.kind];
  const autoSatisfied = satisfied && !checked;

  return (
    <div
      className={`rounded-xl border px-2.5 py-2 transition-colors ${
        satisfied
          ? "bg-emerald-50/50 border-emerald-100"
          : "bg-white border-slate-100"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <button
          type="button"
          onClick={onToggle}
          className="mt-0.5 flex-shrink-0"
          aria-label={satisfied ? "Снять отметку" : "Отметить выполненным"}
        >
          {satisfied ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <Circle className="w-4 h-4 text-slate-300" />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                badge.cls
              }`}
            >
              {badge.label}
            </span>
            {item.why && (
              <span title={item.why} className="text-slate-300 cursor-help">
                <Info className="w-3 h-3" />
              </span>
            )}
            {autoSatisfied && (
              <span className="text-[10px] text-emerald-600 font-medium">
                авто
              </span>
            )}
          </div>
          <p
            className={`text-xs mt-1 leading-snug ${
              satisfied ? "text-emerald-800" : "text-slate-700"
            }`}
          >
            {item.label}
          </p>

          {/* Действия */}
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {item.kind === "gov" && item.govUrl && (
              <a
                href={item.govUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] font-medium text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-2 py-1 rounded-md transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                {item.govLabel || "Проверить"}
              </a>
            )}
            {item.kind === "companion" && item.docId && (
              inPack ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                  <CheckCircle2 className="w-3 h-3" />
                  В пакете документов
                </span>
              ) : packAvailable ? (
                <button
                  type="button"
                  onClick={onAddDoc}
                  className="inline-flex items-center gap-1 text-[10px] font-medium text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-2 py-1 rounded-md transition-colors"
                >
                  <FilePlus2 className="w-3 h-3" />
                  {item.docLabel || "Сформировать"}
                </button>
              ) : null
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
