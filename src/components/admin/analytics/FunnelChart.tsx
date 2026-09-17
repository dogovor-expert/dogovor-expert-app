import type { FunnelStep } from "@/lib/userEventsQueries";

const pct = (v: number) => `${Math.round(v * 100)}%`;

export function FunnelChart({ steps }: { steps: FunnelStep[] }) {
  const maxCount = Math.max(1, ...steps.map((s) => s.count));
  return (
    <div className="space-y-3">
      {steps.map((s, i) => (
        <div key={s.event}>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="font-medium text-gray-800">
              {i + 1}. {s.label}
            </span>
            <span className="text-gray-500 tabular-nums">
              {s.count.toLocaleString("ru-RU")}
              {i > 0 && (
                <span className="text-gray-400"> · {pct(s.ratioFromStart)} от старта</span>
              )}
            </span>
          </div>
          <div className="h-6 rounded-lg bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-lg bg-gradient-to-r from-brand-500 to-purple-500 transition-all"
              style={{ width: `${Math.max((s.count / maxCount) * 100, s.count > 0 ? 2 : 0)}%` }}
            />
          </div>
          {i > 0 && s.ratioFromPrev !== null && (
            <p className="text-[11px] text-gray-400 mt-0.5">
              {s.ratioFromPrev < 1
                ? `−${pct(1 - s.ratioFromPrev)} отвалилось на этом шаге`
                : "без потерь"}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
