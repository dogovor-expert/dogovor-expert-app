import type { AlertItem, WatchedPage } from "../lib/types";
import { formatRelative } from "../lib/format";
import { AlertOctagon, ArrowRight, Bell, GitCompareArrows, Sparkles } from "lucide-react";

interface AlertsViewProps {
  alerts: AlertItem[];
  pages: WatchedPage[];
  onOpenDiff: (pageId: string) => void;
  onOpenSnapshot: (pageId: string, snapshotId: string) => void;
}

export const AlertsView = ({ alerts, pages, onOpenDiff, onOpenSnapshot }: AlertsViewProps) => {
  const critical = alerts.filter((alert) => alert.severity === "critical");
  const warning = alerts.filter((alert) => alert.severity === "warning");
  const watch = alerts.filter((alert) => alert.severity === "watch");

  return (
    <section className="paper-card p-5 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--color-line-soft)] pb-5">
        <div>
          <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--color-ink-mute)]">
            Юридический пульс
          </div>
          <h2 className="mt-1 text-[20px] font-semibold tracking-tight text-[color:var(--color-ink)] sm:text-[22px]">
            Оповещения по вашим страницам
          </h2>
          <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-[color:var(--color-ink-soft)]">
            Мы сравниваем каждый новый слепок с предыдущим и подсвечиваем то, что касается ваших денег, персональных данных и права спора. Никаких «мы обновили условия» без деталей.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="chip chip--critical">
            <AlertOctagon size={12} strokeWidth={1.9} /> {critical.length} критично
          </div>
          <div className="chip chip--warning">
            <Bell size={12} strokeWidth={1.9} /> {warning.length} внимание
          </div>
          <div className="chip chip--watch">
            <Sparkles size={12} strokeWidth={1.9} /> {watch.length} тренд
          </div>
        </div>
      </header>

      <ul className="mt-5 space-y-3">
        {alerts.map((alert) => {
          const page = pages.find((item) => item.id === alert.pageId);
          if (!page) return null;
          return (
            <li
              key={alert.id}
              className="grid gap-3 rounded-[12px] border border-[color:var(--color-line)] bg-[color:var(--color-paper)] p-4 sm:grid-cols-[auto_1fr_auto]"
            >
              <div className="flex items-center gap-3 sm:flex-col sm:items-start">
                <div
                  className="grid h-10 w-10 place-items-center rounded-[10px] text-[13px] font-semibold text-white"
                  style={{ background: page.color }}
                  aria-hidden
                >
                  {page.favicon}
                </div>
                <div className="min-w-0">
                  <div className="mono text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--color-ink-mute)]">
                    {page.service}
                  </div>
                  <div className="text-[12.5px] font-medium text-[color:var(--color-ink)]">
                    {page.documentTitle}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`chip ${severityChipClass(alert.severity)}`}>
                    <span className={`severity-dot severity-dot--${alert.severity}`} />
                    {severityLabel(alert.severity)}
                  </span>
                  <span className="mono text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--color-ink-mute)]">
                    {formatRelative(alert.createdAt)}
                  </span>
                </div>
                <h3 className="mt-1 text-[14.5px] font-semibold text-[color:var(--color-ink)]">
                  {alert.title}
                </h3>
                <p className="mt-1 text-[12.5px] leading-relaxed text-[color:var(--color-ink-soft)]">
                  {alert.detail}
                </p>
                <blockquote className="mt-2 border-l-2 border-[color:var(--color-gold)]/50 bg-[color:var(--color-gold-soft)]/40 px-3 py-2 text-[12px] leading-relaxed text-[color:var(--color-ink-soft)]">
                  «{alert.clauseQuote}»
                </blockquote>
              </div>

              <div className="flex flex-col justify-between gap-2 sm:items-end">
                <div className="mono text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--color-ink-mute)]">
                  Действие
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenSnapshot(page.id, alert.snapshotId)}
                    className="inline-flex items-center gap-1.5 rounded-[8px] border border-[color:var(--color-line)] bg-[color:var(--color-paper-raised)] px-2.5 py-1.5 text-[11.5px] text-[color:var(--color-ink-soft)] hover:border-[color:var(--color-ink)]/30"
                  >
                    Показать пункт
                    <ArrowRight size={12} strokeWidth={1.9} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenDiff(page.id)}
                    className="inline-flex items-center gap-1.5 rounded-[8px] bg-[color:var(--color-ink)] px-2.5 py-1.5 text-[11.5px] text-[color:var(--color-paper)] hover:bg-[color:var(--color-ink)]/90"
                  >
                    <GitCompareArrows size={12} strokeWidth={1.9} />
                    {alert.actionLabel}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

const severityChipClass = (severity: AlertItem["severity"]) => {
  switch (severity) {
    case "critical":
      return "chip--critical";
    case "warning":
      return "chip--warning";
    case "watch":
      return "chip--watch";
    default:
      return "chip--safe";
  }
};

const severityLabel = (severity: AlertItem["severity"]) => {
  switch (severity) {
    case "critical":
      return "Критический риск";
    case "warning":
      return "Требует внимания";
    case "watch":
      return "Наблюдать";
    default:
      return "Информационно";
  }
};
