import type { Snapshot, WatchedPage } from "../lib/types";
import { formatDate, shortenHash } from "../lib/format";

interface PagePreviewProps {
  page: WatchedPage;
  snapshot: Snapshot;
  compact?: boolean;
}

// Renders a stylised "browser tab" showing what the archived page looked like
// on the given day. The HTML comes from the demo dataset and is stored inside
// the bundle; no network requests are made.
export const PagePreview = ({ page, snapshot, compact = false }: PagePreviewProps) => {
  return (
    <div className={`overflow-hidden rounded-[14px] border border-[color:var(--color-line)] bg-[color:var(--color-paper-raised)] shadow-[0_20px_50px_-32px_rgba(27,36,56,0.35)] ${compact ? "" : "min-h-[420px]"}`}>
      <div
        className="flex items-center gap-3 border-b border-[color:var(--color-line)] px-4 py-2.5"
        style={{ background: `linear-gradient(180deg, ${snapshot.previewPalette[0]}, ${snapshot.previewPalette[1]})` }}
      >
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--color-critical)]/50" />
          <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--color-warning)]/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--color-safe)]/60" />
        </div>
        <div className="mono flex-1 truncate rounded-[6px] border border-black/5 bg-white/70 px-2.5 py-[3px] text-[10.5px] text-[color:var(--color-ink-soft)]">
          https://{page.url}
        </div>
        <div className="mono hidden text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-ink-mute)] sm:block">
          {formatDate(snapshot.capturedAt)}
        </div>
      </div>

      <div className="chronoleaf-page max-h-[420px] overflow-y-auto px-6 pb-6 pt-4">
        <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-[color:var(--color-line-soft)] pb-3">
          <div
            className="grid h-7 w-7 place-items-center rounded-[6px] text-[11px] font-semibold text-white"
            style={{ background: page.color }}
            aria-hidden
          >
            {page.favicon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold text-[color:var(--color-ink)]">{page.service}</div>
            <div className="mono truncate text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--color-ink-mute)]">
              {snapshot.headline}
            </div>
          </div>
          <div className="mono rounded-[6px] border border-[color:var(--color-line)] bg-[color:var(--color-paper)] px-2 py-[3px] text-[10px] text-[color:var(--color-ink-mute)]">
            SHA-256 · {shortenHash(snapshot.hash, 6, 6)}
          </div>
        </div>
        {/* Rendering static demo HTML into a controlled container. */}
        <div dangerouslySetInnerHTML={{ __html: snapshot.html }} />
      </div>
    </div>
  );
};
