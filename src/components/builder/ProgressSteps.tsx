interface ProgressStepsProps {
  wizardStep: "select" | "form";
  viewMode: "form" | "preview";
  onSelectTemplateStep: () => void;
  onBackToForm: () => void;
  onGoToPreview: () => void;
}

export default function ProgressSteps({
  wizardStep,
  viewMode,
  onSelectTemplateStep,
  onBackToForm,
  onGoToPreview,
}: ProgressStepsProps) {
  return (
    <div className="flex items-center gap-2 min-[420px]:gap-3 mb-6 bg-white rounded-xl border border-gray-100 shadow-sm px-4 min-[420px]:px-5 py-3 max-w-4xl">
      <div
        className="flex flex-shrink-0 items-center gap-2"
        onClick={onSelectTemplateStep}
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
        <span className={`hidden min-[420px]:inline text-xs font-medium ${wizardStep === "select" ? "text-brand-700" : "text-gray-700"}`}>Шаблон</span>
      </div>
      <div className="w-4 min-[420px]:w-8 h-px bg-gray-200 flex-shrink-0" />
      <div className="flex flex-shrink-0 items-center gap-2"
        onClick={onBackToForm}
        title="Вернуться к заполнению"
        style={{ cursor: viewMode === "preview" ? "pointer" : "default" }}
      >
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${viewMode === "preview" ? "bg-emerald-500 text-white" : "bg-brand-500 text-white"}`}>
          {viewMode === "preview" ? "✓" : "2"}
        </div>
        <span className={`hidden min-[420px]:inline text-xs font-medium ${viewMode === "preview" ? "text-gray-700" : "text-brand-700"}`}>Заполнение</span>
      </div>
      <div className="w-4 min-[420px]:w-8 h-px bg-gray-200 flex-shrink-0" />
      <div
        className="flex flex-shrink-0 items-center gap-2"
        onClick={onGoToPreview}
        title="Перейти к предпросмотру"
        style={{ cursor: viewMode === "form" ? "pointer" : "default" }}
      >
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${viewMode === "preview" ? "bg-brand-500 text-white" : "bg-gray-200 text-gray-600"}`}>3</div>
        <span className={`hidden min-[420px]:inline text-xs font-medium ${viewMode === "preview" ? "text-brand-700" : "text-gray-600"}`}>Предпросмотр</span>
      </div>
    </div>
  );
}
