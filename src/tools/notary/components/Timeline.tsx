import type { WatchedPage } from "../lib/types";
import { formatDateTime, formatRelative, shortenHash } from "../lib/format";
import { AlertOctagon, Fingerprint, ShieldCheck } from "lucide-react";

interface TimelineProps {
  page: WatchedPage;
  activeSnapshotId?: string;
  onSelect: (snapshotId: string) => void;
  onCompare?: (beforeId: string, afterId: string) => void;
}

// Vertical, notarial-looking timeline of every snapshot ever taken for a page.
// A subtle vertical rule stitches nodes together to reinforce the "chronicle"
// metaphor used by the product.
export const Timeline = ({ page, activeSnapshotId, onSelect, onCompare }: TimelineProps) => {
  return (
    <div className="paper-card p-5 sm:p-6">
      <div className="flex items-center gap-3 border-b border-[color:var(--color-line-soft)] pb-4">
        <div
          className="grid h-9 w-9 place-items-center rounded-[8px] text-[13px] font-semibold text-white"
          style={{ background: page.color }}
          aria-hidden
        >
          {page.favicon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--color-ink-mute)]">
            Хроника документа
          </div>
          <div className="truncate text-[15px] font-semibold text-[color:var(--color-ink)]">
            {page.service} · {page.documentTitle}
          </div>
        </div>
        <div className="chip chip--ink">
          <ShieldCheck size={11} strokeWidth={1.9} />
          {page.snapshots.length} слепков
        </div>
      </div>

      <ol className="relative mt-5 space-y-4 pl-6">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-2 left-[10px] w-px bg-[color:var(--color-line)]"
        />
        {page.snapshots.map((snapshot, index) => {
          const active = snapshot.id === activeSnapshotId;
          const risks = snapshot.risks.length;
          const highestSeverity = snapshot.risks.reduce<"info" | "watch" | "warning" | "critical">((acc, risk) => {
            const order = { info: 0, watch: 1, warning: 2, critical: 3 } as const;
            return order[risk.severity] > order[acc] ? risk.severity : acc;
          }, "info");
          const next = page.snapshots[index - 1];
          return (
            <li key={snapshot.id} className="relative">
              <span
                aria-hidden
                className={`absolute -left-6 top-2 grid h-5 w-5 place-items-center rounded-full border ${
                  active
                    ? "border-[color:var(--color-ink)] bg-[color:var(--color-ink)] text-[color:var(--color-paper)]"
                    : "border-[color:var(--color-line)] bg-[color:var(--color-paper-raised)] text-[color:var(--color-ink-mute)]"
                }`}
              >
                <Fingerprint size={11} strokeWidth={1.9} />
              </span>

              <button
                type="button"
                onClick={() => onSelect(snapshot.id)}
                className={`block w-full rounded-[12px] border px-4 py-3 text-left transition ${
                  active
                    ? "border-[color:var(--color-ink)] bg-[color:var(--color-ink)] text-[color:var(--color-paper)] shadow-[0_18px_40px_-24px_rgba(27,36,56,0.55)]"
                    : "border-[color:var(--color-line)] bg-[color:var(--color-paper)] hover:border-[color:var(--color-ink)]/25"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`mono text-[11px] uppercase tracking-[0.16em] ${
                      active ? "text-[color:var(--color-gold-soft)]" : "text-[color:var(--color-ink-mute)]"
                    }`}
                  >
                    #{page.snapshots.length - index}
                  </span>
                  <span
                    className={`text-[13.5px] font-semibold ${
                      active ? "text-[color:var(--color-paper)]" : "text-[color:var(--color-ink)]"
                    }`}
                  >
                    {formatDateTime(snapshot.capturedAt)}
                  </span>
                  <span
                    className={`mono ml-auto text-[10.5px] uppercase tracking-[0.16em] ${
                      active ? "text-[color:var(--color-gold-soft)]/85" : "text-[color:var(--color-ink-mute)]"
                    }`}
                  >
                    {formatRelative(snapshot.capturedAt)}
                  </span>
                </div>

                <div
                  className={`mt-1 text-[12.5px] leading-snug ${
                    active ? "text-[color:var(--color-paper)]/85" : "text-[color:var(--color-ink-soft)]"
                  }`}
                >
                  {snapshot.summary}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`mono rounded-[6px] border px-2 py-[2px] text-[10.5px] ${
                      active
                        ? "border-[color:var(--color-paper)]/25 bg-transparent text-[color:var(--color-paper)]/85"
                        : "border-[color:var(--color-line)] bg-[color:var(--color-paper-raised)] text-[color:var(--color-ink-mute)]"
                    }`}
                  >
                    SHA {shortenHash(snapshot.hash, 6, 4)}
                  </span>
                  <span className={`chip ${chipToneFor(highestSeverity, risks === 0)}`}>
                    {risks === 0 ? (
                      <>
                        <ShieldCheck size={11} strokeWidth={1.9} /> Без изменений
                      </>
                    ) : (
                      <>
                        <AlertOctagon size={11} strokeWidth={1.9} /> Рисков: {risks}
                      </>
                    )}
                  </span>
                  <span
                    className={`mono ml-auto text-[10.5px] uppercase tracking-[0.14em] ${
                      active ? "text-[color:var(--color-paper)]/70" : "text-[color:var(--color-ink-mute)]"
                    }`}
                  >
                    {snapshot.metrics.clauses} п. · {snapshot.metrics.words} слов
                  </span>
                </div>

                {next && onCompare && (
                  <div
                    onClick={(event) => {
                      event.stopPropagation();
                      onCompare(snapshot.id, next.id);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onCompare(snapshot.id, next.id);
                      }
                    }}
                    className={`mono mt-3 inline-flex cursor-pointer items-center gap-1 rounded-[6px] border px-2 py-[3px] text-[10.5px] uppercase tracking-[0.14em] ${
                      active
                        ? "border-[color:var(--color-paper)]/30 text-[color:var(--color-paper)]/85 hover:bg-[color:var(--color-paper)]/12"
                        : "border-[color:var(--color-ink)]/15 text-[color:var(--color-ink-soft)] hover:border-[color:var(--color-ink)]/30"
                    }`}
                  >
                    Сравнить с #{page.snapshots.length - (index - 1)}
                  </div>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

const chipToneFor = (severity: "info" | "watch" | "warning" | "critical", clean: boolean) => {
  if (clean) return "chip--safe";
  return severity === "critical"
    ? "chip--critical"
    : severity === "warning"
    ? "chip--warning"
    : severity === "watch"
    ? "chip--watch"
    : "chip--safe";
};
