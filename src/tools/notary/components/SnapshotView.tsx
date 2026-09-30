import type { Snapshot, WatchedPage } from "../lib/types";
import { formatDateTime, shortenHash } from "../lib/format";
import {
  AlertOctagon,
  Download,
  Fingerprint,
  Landmark,
  Link2,
  Printer,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { PagePreview } from "./PagePreview";

interface SnapshotViewProps {
  page: WatchedPage;
  snapshot: Snapshot;
  onCopyHash: (hash: string) => void;
  onCompare?: () => void;
}

// Detail view for a single snapshot: certificate-like meta panel + the archived
// render on the right.
export const SnapshotView = ({ page, snapshot, onCopyHash, onCompare }: SnapshotViewProps) => {
  const hasRisks = snapshot.risks.length > 0;
  return (
    <section className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="paper-card p-5 sm:p-6">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[color:var(--color-line-soft)] pb-4">
          <div>
            <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--color-ink-mute)]">
              Слепок · {page.category}
            </div>
            <h2 className="mt-1 text-[20px] font-semibold tracking-tight text-[color:var(--color-ink)] sm:text-[22px]">
              {snapshot.headline}
            </h2>
            <div className="mono mt-1 text-[11.5px] text-[color:var(--color-ink-soft)]">{page.url}</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {onCompare && (
              <button
                type="button"
                onClick={onCompare}
                className="inline-flex items-center gap-2 rounded-[9px] border border-[color:var(--color-line)] bg-[color:var(--color-paper)] px-3 py-1.5 text-[12px] text-[color:var(--color-ink-soft)] hover:border-[color:var(--color-ink)]/30"
              >
                <Sparkles size={13} strokeWidth={1.7} />
                Сравнить с прошлой
              </button>
            )}
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-[9px] bg-[color:var(--color-ink)] px-3 py-1.5 text-[12px] text-[color:var(--color-paper)] hover:bg-[color:var(--color-ink)]/90"
              onClick={() => window.print()}
            >
              <Printer size={13} strokeWidth={1.9} />
              PDF-протокол
            </button>
          </div>
        </header>

        <div className="mt-5">
          <PagePreview page={page} snapshot={snapshot} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="paper-card p-5">
          <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--color-ink-mute)]">
            Свидетельство о заверении
          </div>
          <div className="mt-2 flex items-center gap-2">
            <ShieldCheck size={16} strokeWidth={1.8} className="text-[color:var(--color-safe)]" />
            <div className="text-[14px] font-semibold text-[color:var(--color-ink)]">
              Слепок подписан локально
            </div>
          </div>
          <p className="mt-2 text-[12.5px] leading-relaxed text-[color:var(--color-ink-soft)]">
            Каждый слепок содержит копию рендера, HTML и криптографический отпечаток на момент захвата. Данные не покидают ваше устройство и защищены той же криптографией, что и HTTPS.
          </p>

          <div className="mt-4 space-y-3 text-[12.5px]">
            <MetaRow label="Дата и время" value={formatDateTime(snapshot.capturedAt)} icon={Fingerprint} />
            <MetaRow
              label="Отпечаток SHA-256"
              value={
                <button
                  type="button"
                  onClick={() => onCopyHash(snapshot.hash)}
                  className="mono flex items-center gap-1 text-left text-[12px] text-[color:var(--color-ink)] hover:text-[color:var(--color-accent)]"
                >
                  {shortenHash(snapshot.hash, 12, 10)}
                  <Link2 size={11} strokeWidth={1.9} />
                </button>
              }
              icon={Fingerprint}
            />
            <MetaRow label="Метод захвата" value="Локальный рендер + HTML" icon={Landmark} />
            <MetaRow label="Юрисдикция протокола" value="ФЗ-63, ст. 6 (личная подпись)" icon={Landmark} />
          </div>

          <a
            href={`data:text/plain;charset=utf-8,${encodeURIComponent(protocolText(page, snapshot))}`}
            download={`chronoleaf-${page.slug}-${snapshot.id}.txt`}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[9px] border border-[color:var(--color-line)] bg-[color:var(--color-paper)] px-3 py-2 text-[12.5px] text-[color:var(--color-ink-soft)] hover:border-[color:var(--color-ink)]/30"
          >
            <Download size={13} strokeWidth={1.9} />
            Скачать протокол в TXT
          </a>
        </div>

        <div className={`paper-card p-5 ${hasRisks ? "border-[color:var(--color-critical)]/30" : ""}`}>
          <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--color-ink-mute)]">
            Юридические риски
          </div>
          <div className="mt-2 flex items-center gap-2">
            {hasRisks ? (
              <AlertOctagon size={16} strokeWidth={1.8} className="text-[color:var(--color-critical)]" />
            ) : (
              <ShieldCheck size={16} strokeWidth={1.8} className="text-[color:var(--color-safe)]" />
            )}
            <div className="text-[14px] font-semibold text-[color:var(--color-ink)]">
              {hasRisks ? `${snapshot.risks.length} пункта требуют внимания` : "Всё в порядке"}
            </div>
          </div>

          <ul className="mt-3 space-y-3">
            {snapshot.risks.map((risk) => (
              <li
                key={risk.id}
                className="rounded-[10px] border border-[color:var(--color-line)] bg-[color:var(--color-paper)] p-3"
              >
                <div className="flex items-center gap-2">
                  <span className={`chip ${severityChipClass(risk.severity)}`}>
                    <span className={`severity-dot severity-dot--${risk.severity}`} />
                    {severityLabel(risk.severity)}
                  </span>
                </div>
                <div className="mt-1 text-[13px] font-medium text-[color:var(--color-ink)]">
                  {risk.label}
                </div>
                <blockquote className="mt-2 border-l-2 border-[color:var(--color-gold)]/60 bg-[color:var(--color-gold-soft)]/40 px-3 py-2 text-[12px] leading-relaxed text-[color:var(--color-ink-soft)]">
                  «{risk.quote}»
                </blockquote>
                <p className="mt-2 text-[12px] leading-relaxed text-[color:var(--color-ink-mute)]">
                  {risk.explainer}
                </p>
              </li>
            ))}
          </ul>

          {!hasRisks && (
            <p className="mt-3 text-[12.5px] leading-relaxed text-[color:var(--color-ink-soft)]">
              На этот момент документ соответствует предыдущему заверенному слепку. Chronoleaf продолжит следить в фоне.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

interface MetaRowProps {
  label: string;
  value: React.ReactNode;
  icon: typeof Fingerprint;
}

const MetaRow = ({ label, value, icon: Icon }: MetaRowProps) => (
  <div className="flex items-start justify-between gap-3 border-b border-[color:var(--color-line-soft)] pb-2 last:border-b-0 last:pb-0">
    <div className="mono flex items-center gap-2 text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--color-ink-mute)]">
      <Icon size={11} strokeWidth={1.9} />
      {label}
    </div>
    <div className="text-right text-[12.5px] text-[color:var(--color-ink)]">{value}</div>
  </div>
);

const severityChipClass = (severity: "info" | "watch" | "warning" | "critical") => {
  if (severity === "critical") return "chip--critical";
  if (severity === "warning") return "chip--warning";
  if (severity === "watch") return "chip--watch";
  return "chip--safe";
};

const severityLabel = (severity: "info" | "watch" | "warning" | "critical") => {
  if (severity === "critical") return "Критический риск";
  if (severity === "warning") return "Требует внимания";
  if (severity === "watch") return "Наблюдать";
  return "Информационно";
};

const protocolText = (page: WatchedPage, snapshot: Snapshot) => `Chronoleaf — Протокол заверения страницы

Сервис: ${page.service}
Документ: ${page.documentTitle}
URL: https://${page.url}
Категория: ${page.category}

Дата захвата: ${formatDateTime(snapshot.capturedAt)}
Отпечаток SHA-256: ${snapshot.hash}
Метод: Локальный рендер + HTML

Краткое содержание изменений: ${snapshot.summary}

Юридические риски: ${snapshot.risks.length === 0 ? "не выявлено" : snapshot.risks.map((r) => `\n  • [${r.severity}] ${r.label}: ${r.quote}`).join("")}

Настоящий протокол сформирован автоматически на устройстве пользователя.
`;
