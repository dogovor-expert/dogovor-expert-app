import { ArrowRight, FileText } from "lucide-react";
import type { LegalTemplate } from "@/data/types";

interface SimilarTemplatesPanelProps {
  similarTemplates: LegalTemplate[];
  onSelectTemplate: (id: string) => void;
}

export default function SimilarTemplatesPanel({
  similarTemplates,
  onSelectTemplate,
}: SimilarTemplatesPanelProps) {
  return (
    <div className="space-y-2">
      {similarTemplates.map((doc) => (
        <button
          key={doc.id}
          onClick={() => onSelectTemplate(doc.id)}
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
            <p className="text-[10px] text-gray-600 truncate">{doc.actSource}</p>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
        </button>
      ))}
    </div>
  );
}
