import { Check, Clock, Trash2 } from "lucide-react";
import { TEMPLATE_META } from "@/data/templatesMeta";
import type { DraftData } from "@/lib/autosave";

interface DraftsPanelProps {
  draftInfos: DraftData[];
  selectedTemplateId: string;
  onCreateVersion: () => void;
  onOpenDraft: (d: DraftData) => void;
  onRemoveDraft: (d: DraftData) => void;
}

export default function DraftsPanel({
  draftInfos,
  selectedTemplateId,
  onCreateVersion,
  onOpenDraft,
  onRemoveDraft,
}: DraftsPanelProps) {
  return (
    <div className="space-y-2">
      <button
        onClick={onCreateVersion}
        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-100 transition-colors"
      >
        <Check className="w-3.5 h-3.5" />
        Создать версию документа
      </button>
      <p className="text-[10px] text-gray-600 leading-relaxed">
        Версии сохраняются автоматически каждые 30 секунд работы и вручную. Откатиться к любой версии можно на странице «Мои документы».
      </p>
      {draftInfos.map((d) => {
        const t = TEMPLATE_META.find(
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
              onClick={() => onOpenDraft(d)}
              className="flex-1 min-w-0 text-left"
            >
              <p className="text-xs font-medium text-gray-700 truncate">
                {t?.name || d.templateId}
              </p>
              <p className="text-[10px] text-gray-600">
                {new Date(d.savedAt).toLocaleString("ru-RU")}
              </p>
            </button>
            <button
              onClick={() => onRemoveDraft(d)}
              title="Удалить черновик"
              className="p-1 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
