import { AlertTriangle, Check } from "lucide-react";
import type { LegalTemplate } from "@/data/types";

export default function TemplateInfoPanel({ template }: { template: LegalTemplate }) {
  return (
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
  );
}
