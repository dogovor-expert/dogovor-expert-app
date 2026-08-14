import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";
import type { AuditResult } from "@/lib/validation";

function RiskHeatmap({ results }: { results: AuditResult[] }) {
  const errorCount = results.filter((r) => r.type === "error").length;
  const warningCount = results.filter((r) => r.type === "warning").length;
  const rawScore = Math.min(100, errorCount * 35 + warningCount * 10);
  const score = errorCount === 0 && rawScore > 30 ? 30 : rawScore;
  const level =
    score === 0
      ? { label: "Низкий риск", color: "text-emerald-700", bar: "bg-emerald-500", width: "10%" }
      : score < 30
        ? { label: "Низкий риск", color: "text-emerald-700", bar: "bg-emerald-500", width: `${Math.max(10, score)}%` }
        : score < 60
          ? { label: "Средний риск", color: "text-amber-700", bar: "bg-amber-500", width: `${score}%` }
          : { label: "Высокий риск", color: "text-red-700", bar: "bg-red-500", width: `${score}%` };

  return (
    <div className="p-3 rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-bold ${level.color}`}>
          {level.label} · {errorCount} ошибок, {warningCount} предупреждений
        </span>
        <span className="text-[10px] text-gray-400">риск {score}/100</span>
      </div>
      <div className="h-2 rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500 overflow-hidden relative">
        <div
          className="absolute inset-y-0 left-0 bg-gray-200/40"
          style={{ width: `${100 - score}%`, right: 0, left: "auto" }}
        />
        <div className="absolute inset-y-0 left-0 w-0.5 bg-gray-900" style={{ left: `${score}%` }} />
      </div>
      <p className="mt-2 text-[10px] text-gray-500 leading-snug">
        {errorCount === 0 && warningCount === 0
          ? "Документ заполнен корректно, критических рисков не обнаружено."
          : errorCount > 0
            ? "Исправьте ошибки до подписания: они могут сделать документ недействительным."
            : "Документ можно подписывать, но рекомендуем устранить предупреждения."}
      </p>
    </div>
  );
}

function getAuditIcon(type: string) {
  switch (type) {
    case "error":
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    case "warning":
      return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    case "success":
      return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    default:
      return null;
  }
}

function getAuditBg(type: string) {
  switch (type) {
    case "error":
      return "bg-red-50 border-red-200";
    case "warning":
      return "bg-amber-50 border-amber-200";
    case "success":
      return "bg-emerald-50 border-emerald-200";
    default:
      return "bg-gray-50 border-gray-200";
  }
}

export default function AuditPanel({
  results,
  onResultClick,
}: {
  results: AuditResult[];
  onResultClick?: (fieldId: string) => void;
}) {
  return (
    <div className="space-y-2">
      <RiskHeatmap results={results} />
      {results.map((r, i) => {
        const clickable = !!onResultClick && r.field !== "_all";
        const row = (
          <>
            {getAuditIcon(r.type)}
            <span
              className={
                r.type === "success"
                  ? "text-emerald-700"
                  : r.type === "error"
                    ? "text-red-700"
                    : "text-amber-700"
              }
            >
              {r.message}
            </span>
          </>
        );
        return clickable ? (
          <button
            key={i}
            type="button"
            onClick={() => onResultClick(r.field)}
            title="Перейти к полю"
            className={`w-full flex items-start gap-2 p-2.5 rounded-lg border text-xs text-left transition-colors ${getAuditBg(r.type)} hover:bg-white`}
          >
            {row}
          </button>
        ) : (
          <div
            key={i}
            className={`flex items-start gap-2 p-2.5 rounded-lg border text-xs ${getAuditBg(r.type)}`}
          >
            {row}
          </div>
        );
      })}
    </div>
  );
}
