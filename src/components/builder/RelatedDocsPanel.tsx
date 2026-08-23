import { FileText, X } from "lucide-react";
import type { LegalTemplate } from "@/data/types";
import { TEMPLATE_META } from "@/data/templatesMeta";

interface RelatedDocsPanelProps {
  relatedDocs: LegalTemplate[];
  packTemplateIds: string[];
  onTogglePack: (id: string) => void;
  onSelectTemplate: (id: string) => void;
}

export default function RelatedDocsPanel({
  relatedDocs,
  packTemplateIds,
  onTogglePack,
  onSelectTemplate,
}: RelatedDocsPanelProps) {
  return (
    <div className="space-y-2">
      <p className="text-[10.5px] text-slate-600 leading-snug">
        Добавьте документы в пакет — при экспорте они соберутся в один PDF.
      </p>
      {packTemplateIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pb-1.5 border-b border-gray-100">
          <span className="text-[10px] font-medium text-gray-600 uppercase tracking-wide">
            В пакете:
          </span>
          {packTemplateIds.map((id) => {
            const packDoc = TEMPLATE_META.find(
              (x) => x.id === id
            );
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-brand-50 border border-brand-100 text-[10px] font-medium text-brand-700"
              >
                {packDoc?.name || id}
                <button
                  onClick={() => onTogglePack(id)}
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
      <p className="text-[10px] text-gray-600 pb-1">
        Отметьте документы — они соберутся в один PDF-файл.
      </p>
      {relatedDocs.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center gap-2"
        >
          <button
            onClick={() => onSelectTemplate(doc.id)}
            className="flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white border border-slate-100 hover:border-brand-200 hover:bg-brand-50/50 text-left transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white flex-shrink-0">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-700">
                {doc.name.length > 32
                  ? doc.name.slice(0, 32) + "..."
                  : doc.name}
              </p>
              <p className="text-[10px] text-gray-600">
                {doc.actSource}
              </p>
            </div>
          </button>
          <label
            className="flex items-center gap-1 text-[10px] text-gray-600 cursor-pointer shrink-0"
            title="Добавить в пакет документов"
          >
            <input
              type="checkbox"
              className="w-3.5 h-3.5 accent-brand-600"
              checked={packTemplateIds.includes(doc.id)}
              onChange={() => onTogglePack(doc.id)}
            />
            пакет
          </label>
        </div>
      ))}
    </div>
  );
}
