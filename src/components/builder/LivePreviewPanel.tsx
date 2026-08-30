import { memo, useMemo } from "react";
import { ArrowRight, Eye, FileText } from "lucide-react";
import type { LegalTemplate } from "@/data/types";
import DocPreview from "@/components/DocPreview";

interface LivePreviewPanelProps {
  template: LegalTemplate;
  renderPreview: () => string;
  onOpenFullPreview: () => void;
  onPagesChange: (count: number) => void;
}

function LivePreviewPanel({
  template,
  renderPreview,
  onOpenFullPreview,
  onPagesChange,
}: LivePreviewPanelProps) {
  // M3: не пересобираем тяжёлый HTML предпросмотра на каждый ре-рендер
  // (он вызывается из конструктора при каждом наборе символов).
  const html = useMemo(() => renderPreview(), [renderPreview, template]);
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-brand-600" />
          <h2 className="text-sm font-semibold text-gray-900">
            Живой предпросмотр
          </h2>
          <span className="text-[10px] text-gray-600 hidden sm:inline">
            {template.name}
          </span>
        </div>
        <button
          onClick={onOpenFullPreview}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-500 text-white hover:bg-brand-600 transition-colors flex-shrink-0"
        >
          <FileText className="w-3.5 h-3.5" />
          Полный предпросмотр
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
      <div className="max-h-[70vh] overflow-y-auto bg-gray-100">
        <DocPreview
          html={html}
          showPageNumbers={false}
          onPagesChange={onPagesChange}
        />
      </div>
    </div>
  );
}

export default memo(LivePreviewPanel);
