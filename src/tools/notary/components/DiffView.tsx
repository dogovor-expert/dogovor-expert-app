import { useMemo, useState } from "react";
import type { Snapshot, WatchedPage } from "../lib/types";
import { diffBlocks, summarizeDiff } from "../lib/diff";
import { formatDateTime, shortenHash } from "../lib/format";
import {
  ArrowLeftRight,
  ArrowRight,
  Calendar,
  Copy,
  Download,
  FileText,
  MinusCircle,
  PlusCircle,
  ScrollText,
} from "lucide-react";

interface DiffViewProps {
  page: WatchedPage;
  before: Snapshot;
  after: Snapshot;
  onSelectSnapshot?: (snapshotId: string) => void;
  onOpenSnapshot?: () => void;
}

type ViewMode = "side-by-side" | "unified";

export const DiffView = ({ page, before, after, onSelectSnapshot, onOpenSnapshot }: DiffViewProps) => {
  const [mode, setMode] = useState<ViewMode>("side-by-side");
  const [hidePlainContext, setHidePlainContext] = useState(false);
  const blocks = useMemo(() => diffBlocks(before.html, after.html), [before.html, after.html]);
  const summary = useMemo(() => summarizeDiff(blocks), [blocks]);

  return (
    <section className="paper-card p-5 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[color:var(--color-line-soft)] pb-5">
        <div className="min-w-0 flex-1">
          <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--color-ink-mute)]">
            Diff-обозреватель · {page.service}
          </div>
          <h2 className="mt-1 text-[20px] font-semibold tracking-tight text-[color:var(--color-ink)] sm:text-[22px]">
            {page.documentTitle}
          </h2>
          <div className="mt-1 flex items-center gap-2 text-[12.5px] text-[color:var(--color-ink-soft)]">
            <FileText size={13} strokeWidth={1.7} />
            <span className="mono truncate">{page.url}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex overflow-hidden rounded-[9px] border border-[color:var(--color-line)] bg-[color:var(--color-paper)]">
            <button
              type="button"
              onClick={() => setMode("side-by-side")}
              className={`px-3 py-1.5 text-[12px] transition ${
                mode === "side-by-side"
                  ? "bg-[color:var(--color-ink)] text-[color:var(--color-paper)]"
                  : "text-[color:var(--color-ink-soft)] hover:bg-[color:var(--color-paper-sunk)]"
              }`}
            >
              Рядом
            </button>
            <button
              type="button"
              onClick={() => setMode("unified")}
              className={`px-3 py-1.5 text-[12px] transition ${
                mode === "unified"
                  ? "bg-[color:var(--color-ink)] text-[color:var(--color-paper)]"
                  : "text-[color:var(--color-ink-soft)] hover:bg-[color:var(--color-paper-sunk)]"
              }`}
            >
              Единой лентой
            </button>
          </div>
          {onOpenSnapshot && (
            <button
              type="button"
              onClick={onOpenSnapshot}
              className="inline-flex items-center gap-1.5 rounded-[9px] border border-[color:var(--color-line)] bg-[color:var(--color-paper)] px-3 py-1.5 text-[12px] text-[color:var(--color-ink-soft)] hover:border-[color:var(--color-ink)]/25"
            >
              <ScrollText size={13} strokeWidth={1.7} />
              <span>Слепок целиком</span>
            </button>
          )}
        </div>
      </header>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryStat icon={MinusCircle} value={summary.removed + summary.changed} label="Удалено / переписано" tone="remove" />
        <SummaryStat icon={PlusCircle} value={summary.added + summary.changed} label="Добавлено / расширено" tone="add" />
        <SummaryStat icon={ArrowLeftRight} value={blocks.length} label="Всего блоков в документе" tone="ink" />
        <SummaryStat icon={ScrollText} value={summary.criticalCount + summary.warningCount} label="Юридических рисков" tone={summary.criticalCount > 0 ? "critical" : "warning"} />
      </div>

      <div className="mt-5 grid gap-3 rounded-[12px] border border-[color:var(--color-line)] bg-[color:var(--color-paper)] p-4 sm:grid-cols-2">
        <VersionLabel
          badge="Прошлая версия"
          snapshot={before}
          tone="remove"
          onSelect={onSelectSnapshot ? () => onSelectSnapshot(before.id) : undefined}
        />
        <VersionLabel
          badge="Текущая версия"
          snapshot={after}
          tone="add"
          onSelect={onSelectSnapshot ? () => onSelectSnapshot(after.id) : undefined}
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <label className="inline-flex items-center gap-2 text-[12px] text-[color:var(--color-ink-soft)]">
          <input
            type="checkbox"
            checked={hidePlainContext}
            onChange={(event) => setHidePlainContext(event.target.checked)}
            className="h-3.5 w-3.5 rounded border border-[color:var(--color-line)] accent-[color:var(--color-ink)]"
          />
          Скрыть неизменившиеся абзацы
        </label>
        <div className="mono flex items-center gap-3 text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--color-ink-mute)]">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-sm bg-[color:var(--color-diff-remove-border)]" /> удалено
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-sm bg-[color:var(--color-diff-add-border)]" /> добавлено
          </span>
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-[12px] border border-[color:var(--color-line)] bg-[color:var(--color-paper-raised)]">
        {mode === "side-by-side" ? (
          <SideBySide blocks={blocks} hideContext={hidePlainContext} />
        ) : (
          <UnifiedDiff blocks={blocks} hideContext={hidePlainContext} />
        )}
      </div>
    </section>
  );
};

interface VersionLabelProps {
  badge: string;
  snapshot: Snapshot;
  tone: "add" | "remove";
  onSelect?: () => void;
}

const VersionLabel = ({ badge, snapshot, tone, onSelect }: VersionLabelProps) => {
  const chipClass = tone === "add" ? "chip chip--safe" : "chip chip--critical";
  const icon = tone === "add" ? <PlusCircle size={13} strokeWidth={1.7} /> : <MinusCircle size={13} strokeWidth={1.7} />;
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group text-left"
      disabled={!onSelect}
    >
      <div className="flex items-center gap-2">
        <span className={chipClass}>
          {icon}
          {badge}
        </span>
        <span className="mono text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--color-ink-mute)]">
          <Calendar size={11} strokeWidth={1.8} className="mr-1 inline align-[-2px]" />
          {formatDateTime(snapshot.capturedAt)}
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="mono truncate text-[13px] text-[color:var(--color-ink)]">
          {shortenHash(snapshot.hash, 10, 6)}
        </div>
        <span className="mono text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--color-ink-mute)]">
          SHA-256
        </span>
      </div>
      <div className="mt-1 text-[12.5px] leading-snug text-[color:var(--color-ink-soft)]">
        {snapshot.summary}
      </div>
      {snapshot.metrics.prices && (
        <div className="mt-2 flex items-center gap-2 text-[11.5px]">
          <span className="mono text-[color:var(--color-ink-mute)]">Ключевой показатель:</span>
          <span className="mono font-medium text-[color:var(--color-ink)]">{snapshot.metrics.prices}</span>
        </div>
      )}
    </button>
  );
};

interface SummaryStatProps {
  icon: typeof MinusCircle;
  value: number | string;
  label: string;
  tone: "remove" | "add" | "ink" | "warning" | "critical";
}

const SummaryStat = ({ icon: Icon, value, label, tone }: SummaryStatProps) => {
  const toneClass = (() => {
    switch (tone) {
      case "remove":
        return "border-[color:var(--color-diff-remove-border)] bg-[color:var(--color-diff-remove-bg)]/45 text-[color:var(--color-diff-remove)]";
      case "add":
        return "border-[color:var(--color-diff-add-border)] bg-[color:var(--color-diff-add-bg)]/45 text-[color:var(--color-diff-add)]";
      case "critical":
        return "border-[color:var(--color-critical)]/30 bg-[color:var(--color-critical)]/10 text-[color:var(--color-critical)]";
      case "warning":
        return "border-[color:var(--color-warning)]/30 bg-[color:var(--color-warning)]/10 text-[color:var(--color-warning)]";
      default:
        return "border-[color:var(--color-line)] bg-[color:var(--color-paper)] text-[color:var(--color-ink)]";
    }
  })();
  return (
    <div className={`rounded-[12px] border p-3.5 ${toneClass}`}>
      <div className="flex items-center gap-2">
        <Icon size={16} strokeWidth={1.7} />
        <div className="mono text-[10.5px] uppercase tracking-[0.16em] opacity-75">{label}</div>
      </div>
      <div className="mono mt-2 text-[24px] font-medium leading-none">{value}</div>
    </div>
  );
};

interface SideBySideProps {
  blocks: ReturnType<typeof diffBlocks>;
  hideContext: boolean;
}

const SideBySide = ({ blocks, hideContext }: SideBySideProps) => {
  const filtered = hideContext ? blocks.filter((block) => block.type !== "context") : blocks;
  if (filtered.length === 0) {
    return <EmptyDiff />;
  }
  return (
    <div className="divide-y divide-[color:var(--color-line-soft)]">
      {filtered.map((block, index) => (
        <div key={index} className="grid grid-cols-1 gap-0 md:grid-cols-2">
          <BlockSide side="before" block={block} />
          <div className="hidden md:block md:border-l md:border-[color:var(--color-line-soft)]" />
          <BlockSide side="after" block={block} />
        </div>
      ))}
    </div>
  );
};

interface BlockSideProps {
  side: "before" | "after";
  block: ReturnType<typeof diffBlocks>[number];
}

const BlockSide = ({ side, block }: BlockSideProps) => {
  const html = side === "before" ? block.before : block.after;
  const emptyLabel = side === "before" ? "нового содержания не было" : "содержание было удалено";
  const toneClass = (() => {
    if (block.type === "context") return "bg-transparent";
    if (block.type === "add") {
      return side === "after" ? "bg-[color:var(--color-diff-add-bg)]/55" : "bg-[color:var(--color-paper)]";
    }
    if (block.type === "remove") {
      return side === "before" ? "bg-[color:var(--color-diff-remove-bg)]/55" : "bg-[color:var(--color-paper)]";
    }
    return side === "before"
      ? "bg-[color:var(--color-diff-remove-bg)]/45"
      : "bg-[color:var(--color-diff-add-bg)]/45";
  })();
  const label = (() => {
    if (block.type === "context") return "Без изменений";
    if (block.type === "add") return side === "after" ? "Добавлено" : "—";
    if (block.type === "remove") return side === "before" ? "Удалено" : "—";
    return side === "before" ? "Было" : "Стало";
  })();

  const riskChip = block.riskLevel ? riskChipFor(block.riskLevel) : null;

  return (
    <div className={`chronoleaf-page relative px-5 py-4 text-[13px] ${toneClass}`}>
      <div className="mb-2 flex items-center gap-2">
        <span className={`mono text-[10px] uppercase tracking-[0.18em] ${labelToneClass(block.type, side)}`}>
          {label}
        </span>
        {riskChip}
      </div>
      {html ? (
        <div className={`diff-block diff-block--${block.type}`}>
          {block.type === "changed" && side === "before" ? (
            <WordDiff tokens={block.wordDiff ?? []} direction="before" />
          ) : block.type === "changed" && side === "after" ? (
            <WordDiff tokens={block.wordDiff ?? []} direction="after" />
          ) : (
            <div dangerouslySetInnerHTML={{ __html: html }} />
          )}
        </div>
      ) : (
        <div className="mono text-[11px] italic text-[color:var(--color-ink-mute)]">— {emptyLabel} —</div>
      )}
    </div>
  );
};

interface WordDiffProps {
  tokens: { text: string; kind: "same" | "add" | "remove" }[];
  direction: "before" | "after";
}

const WordDiff = ({ tokens, direction }: WordDiffProps) => {
  return (
    <p className="text-[13px] leading-[1.7]">
      {tokens.map((token, idx) => {
        const shouldShow =
          token.kind === "same" ||
          (direction === "before" && token.kind === "remove") ||
          (direction === "after" && token.kind === "add");
        if (!shouldShow) {
          return null;
        }
        const spacer = token.text.match(/^[.,;:!?)"»—-]$/) ? "" : " ";
        if (token.kind === "same") {
          return (
            <span key={idx} className="text-[color:var(--color-ink-soft)]">
              {spacer}
              {token.text}
            </span>
          );
        }
        if (token.kind === "remove") {
          return (
            <span
              key={idx}
              className="mx-[1px] rounded-[3px] bg-[color:var(--color-diff-remove-bg)] px-[3px] text-[color:var(--color-diff-remove)] line-through decoration-[color:var(--color-diff-remove)]/50"
            >
              {token.text}
            </span>
          );
        }
        return (
          <span
            key={idx}
            className="mx-[1px] rounded-[3px] bg-[color:var(--color-diff-add-bg)] px-[3px] font-medium text-[color:var(--color-diff-add)]"
          >
            {token.text}
          </span>
        );
      })}
    </p>
  );
};

const labelToneClass = (type: ReturnType<typeof diffBlocks>[number]["type"], side: "before" | "after") => {
  if (type === "context") return "text-[color:var(--color-ink-mute)]";
  if (type === "add") return side === "after" ? "text-[color:var(--color-diff-add)]" : "text-[color:var(--color-ink-mute)]";
  if (type === "remove") return side === "before" ? "text-[color:var(--color-diff-remove)]" : "text-[color:var(--color-ink-mute)]";
  return side === "before" ? "text-[color:var(--color-diff-remove)]" : "text-[color:var(--color-diff-add)]";
};

const riskChipFor = (severity: "info" | "watch" | "warning" | "critical") => {
  const label = severity === "critical" ? "Юр. риск" : severity === "warning" ? "Требует внимания" : severity === "watch" ? "Под наблюдением" : "Ок";
  const cls =
    severity === "critical"
      ? "chip chip--critical"
      : severity === "warning"
      ? "chip chip--warning"
      : severity === "watch"
      ? "chip chip--watch"
      : "chip chip--safe";
  return (
    <span className={cls}>
      <span className={`severity-dot severity-dot--${severity === "info" ? "info" : severity}`} />
      {label}
    </span>
  );
};

interface UnifiedDiffProps {
  blocks: ReturnType<typeof diffBlocks>;
  hideContext: boolean;
}

const UnifiedDiff = ({ blocks, hideContext }: UnifiedDiffProps) => {
  const filtered = hideContext ? blocks.filter((block) => block.type !== "context") : blocks;
  if (filtered.length === 0) {
    return <EmptyDiff />;
  }
  return (
    <div className="divide-y divide-[color:var(--color-line-soft)]">
      {filtered.map((block, index) => {
        if (block.type === "context") {
          return (
            <div key={index} className="chronoleaf-page px-5 py-3">
              <div className="mono mb-1.5 text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink-mute)]">
                Без изменений
              </div>
              <div dangerouslySetInnerHTML={{ __html: block.after ?? block.before ?? "" }} />
            </div>
          );
        }
        if (block.type === "remove") {
          return (
            <div key={index} className="chronoleaf-page bg-[color:var(--color-diff-remove-bg)]/55 px-5 py-3">
              <div className="mono mb-1.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-diff-remove)]">
                <MinusCircle size={12} strokeWidth={1.9} /> Удалено
              </div>
              <div dangerouslySetInnerHTML={{ __html: block.before ?? "" }} />
            </div>
          );
        }
        if (block.type === "add") {
          return (
            <div key={index} className="chronoleaf-page bg-[color:var(--color-diff-add-bg)]/55 px-5 py-3">
              <div className="mono mb-1.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-diff-add)]">
                <PlusCircle size={12} strokeWidth={1.9} /> Добавлено
              </div>
              <div dangerouslySetInnerHTML={{ __html: block.after ?? "" }} />
            </div>
          );
        }
        return (
          <div key={index} className="chronoleaf-page space-y-3 px-5 py-3">
            <div className="mono flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink-mute)]">
              <ArrowLeftRight size={12} strokeWidth={1.9} /> Переписано
              {block.riskLevel && (
                <span className="ml-auto">{riskChipFor(block.riskLevel)}</span>
              )}
            </div>
            <WordDiff tokens={block.wordDiff ?? []} direction="before" />
            <div className="flex items-center gap-2 text-[10.5px] text-[color:var(--color-ink-mute)]">
              <ArrowRight size={12} strokeWidth={1.9} /> новая редакция
            </div>
            <WordDiff tokens={block.wordDiff ?? []} direction="after" />
          </div>
        );
      })}
    </div>
  );
};

const EmptyDiff = () => (
  <div className="chronoleaf-page px-6 py-10 text-center text-[13px] text-[color:var(--color-ink-mute)]">
    <div className="mx-auto mb-3 grid h-9 w-9 place-items-center rounded-full border border-[color:var(--color-line)] text-[color:var(--color-ink-mute)]">
      <Copy size={15} />
    </div>
    Документ идентичен во всех блоках. Дифф пуст.
    <div className="mt-2 mono text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--color-ink-mute)]">
      Ничего не переписали — можно выдохнуть.
    </div>
    <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[color:var(--color-ink-mute)]">
      <Download size={12} /> при желании скачайте PDF-протокол
    </div>
  </div>
);
