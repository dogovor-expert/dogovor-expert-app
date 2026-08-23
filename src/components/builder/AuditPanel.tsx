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

  const ringColor =
    score < 30 ? "#10b981" : score < 60 ? "#f59e0b" : "#ef4444";
  const R = 26;
  const C = 2 * Math.PI * R;
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-slate-50/60 p-4">
      <div className="relative w-[72px] h-[72px] shrink-0">
        <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90">
          <circle cx={36} cy={36} r={R} fill="none" stroke="#e2e8f0" strokeWidth={7} />
          <circle
            cx={36}
            cy={36}
            r={R}
            fill="none"
            stroke={ringColor}
            strokeWidth={7}
            strokeDasharray={`${(Math.min(100, score) / 100) * C} ${C}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold" style={{ color: ringColor }}>
            {score}
          </span>
        </div>
      </div>
      <div className="min-w-0">
        <div className={`text-[13px] font-bold ${level.color}`}>
          {level.label}
        </div>
        <div className="text-[10.5px] text-slate-600 mt-0.5">
          {errorCount} ошибок · {warningCount} предупреждений
        </div>
        <p className="mt-1.5 text-[10.5px] text-slate-600 leading-snug">
          {errorCount === 0 && warningCount === 0
            ? "Документ заполнен корректно, критических рисков нет."
            : errorCount > 0
              ? "Исправьте ошибки до подписания — они могут аннулировать договор."
              : "Можно подписывать, но устраните предупреждения."}
        </p>
      </div>
    </div>
  );
}

function getAuditIcon(type: string) {
  switch (type) {
    case "error":
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    case "warning":
      return <AlertTriangle className="w-4 h-4 text-amber-700" />;
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
            className={`w-full flex items-start gap-2 p-3 rounded-xl border text-xs text-left transition-all bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm ${r.type === "error" ? "hover:border-red-200" : r.type === "warning" ? "hover:border-amber-200" : "hover:border-emerald-200"}`}
          >
            {row}
          </button>
        ) : (
          <div
            key={i}
            className={`flex items-start gap-2 p-3 rounded-xl border text-xs bg-white border-slate-100 ${r.type === "error" ? "border-l-4 border-l-red-400" : r.type === "warning" ? "border-l-4 border-l-amber-400" : "border-l-4 border-l-emerald-400"}`}
          >
            {row}
          </div>
        );
      })}
    </div>
  );
}
