import type { AlertItem, WatchedPage } from "../lib/types";
import { formatCount, formatRelative, shortenHash } from "../lib/format";
import {
  AlertOctagon,
  ArrowRight,
  Bell,
  Camera,
  Clock,
  Fingerprint,
  GitCompareArrows,
  MinusCircle,
  PlusCircle,
  ScrollText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { PagePreview } from "./PagePreview";

interface DashboardProps {
  pages: WatchedPage[];
  alerts: AlertItem[];
  onOpenDiff: (pageId: string) => void;
  onOpenSnapshot: (pageId: string, snapshotId: string) => void;
  onOpenAlerts: () => void;
  onCapture: () => void;
  onOpenHow: () => void;
}

export const Dashboard = ({
  pages,
  alerts,
  onOpenDiff,
  onOpenSnapshot,
  onOpenAlerts,
  onCapture,
  onOpenHow,
}: DashboardProps) => {
  const featuredPage = pages[0];
  const featuredSnapshot = featuredPage.snapshots[0];
  const featuredAlert = alerts.find((alert) => alert.pageId === featuredPage.id) ?? alerts[0];

  const totalSnapshots = pages.reduce((sum, page) => sum + page.snapshots.length, 0);
  const totalRisks = alerts.filter((alert) => alert.severity !== "info").length;
  const criticalCount = alerts.filter((alert) => alert.severity === "critical").length;

  const recentChanges = pages
    .flatMap((page) => page.snapshots.slice(0, 1).map((snapshot) => ({ page, snapshot })))
    .sort((a, b) => new Date(b.snapshot.capturedAt).getTime() - new Date(a.snapshot.capturedAt).getTime());

  return (
    <div className="space-y-6">
      <section className="paper-card overflow-hidden">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-0 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="relative p-6 sm:p-8">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[color:var(--color-gold)]/40 to-transparent" />
            <div className="mono text-[10.5px] uppercase tracking-[0.22em] text-[color:var(--color-ink-mute)]">
              Веб-нотариус · The Living Time-Capsule of the Web
            </div>
            <h1 className="mt-3 text-[30px] font-semibold leading-[1.05] tracking-tight text-[color:var(--color-ink)] sm:text-[38px]">
              Оферта тихо изменилась?
              <br />
              <span className="gold-underline">Chronoleaf это помнит.</span>
            </h1>
            <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-[color:var(--color-ink-soft)]">
              Сохраняйте юридически значимый слепок любой страницы в один клик. Мы храним HTML, скриншот и криптографический отпечаток, а при следующем визите показываем diff: что удалили, что дописали мелким шрифтом и какие пункты — юридический риск.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onCapture}
                className="inline-flex items-center gap-2 rounded-[10px] bg-[color:var(--color-ink)] px-4 py-2.5 text-[13.5px] font-medium text-[color:var(--color-paper)] transition hover:bg-[color:var(--color-ink)]/90"
              >
                <Camera size={15} strokeWidth={1.9} />
                Заверить страницу
              </button>
              <button
                type="button"
                onClick={() => onOpenDiff(featuredPage.id)}
                className="inline-flex items-center gap-2 rounded-[10px] border border-[color:var(--color-line)] bg-[color:var(--color-paper)] px-4 py-2.5 text-[13.5px] text-[color:var(--color-ink)] hover:border-[color:var(--color-ink)]/30"
              >
                <GitCompareArrows size={15} strokeWidth={1.9} />
                Смотреть готовый diff
              </button>
              <button
                type="button"
                onClick={onOpenHow}
                className="inline-flex items-center gap-2 rounded-[10px] px-3 py-2 text-[12.5px] text-[color:var(--color-ink-mute)] hover:text-[color:var(--color-ink)]"
              >
                <Sparkles size={13} strokeWidth={1.9} />
                Как это работает
              </button>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-4">
              <HeroStat icon={Fingerprint} value={formatCount(totalSnapshots)} label="Слепков" />
              <HeroStat icon={ScrollText} value={String(pages.length)} label="Страниц под контролем" />
              <HeroStat icon={AlertOctagon} value={String(totalRisks)} label="Юр. рисков сегодня" tone={criticalCount > 0 ? "critical" : "ink"} />
              <HeroStat icon={ShieldCheck} value="0" label="Данных на серверах" tone="safe" />
            </div>
          </div>

          <div className="relative border-t border-[color:var(--color-line)] bg-[color:var(--color-paper-sunk)]/50 p-6 sm:p-8 lg:border-l lg:border-t-0">
            <div className="mono flex items-center justify-between text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--color-ink-mute)]">
              <span>Сегодняшняя новость архива</span>
              <span className="flex items-center gap-1">
                <span className="severity-dot severity-dot--critical" /> live
              </span>
            </div>

            <div className="mt-3 rounded-[14px] border border-[color:var(--color-critical)]/30 bg-[color:var(--color-paper-raised)] p-4 shadow-[0_18px_36px_-24px_rgba(161,48,48,0.45)]">
              <div className="flex items-center gap-2">
                <span className="chip chip--critical">
                  <AlertOctagon size={11} strokeWidth={1.9} />
                  Критический риск
                </span>
                <span className="mono text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--color-ink-mute)]">
                  {featuredAlert ? formatRelative(featuredAlert.createdAt) : ""}
                </span>
              </div>
              <div className="mt-2 text-[15px] font-semibold text-[color:var(--color-ink)]">
                {featuredAlert?.title}
              </div>
              <div className="mt-2 text-[12.5px] leading-relaxed text-[color:var(--color-ink-soft)]">
                {featuredAlert?.detail}
              </div>

              <div className="mt-3 rounded-[10px] border border-[color:var(--color-line)] bg-[color:var(--color-paper)] p-3 text-[12px] leading-relaxed">
                <div className="flex items-center gap-2 text-[color:var(--color-diff-remove)]">
                  <MinusCircle size={13} strokeWidth={1.9} />
                  <span className="line-through">5 (пяти) календарных дней</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-[color:var(--color-diff-add)]">
                  <PlusCircle size={13} strokeWidth={1.9} />
                  <span className="font-medium">30 (тридцати) рабочих дней с даты положительного решения службы контроля качества</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="mono text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--color-ink-mute)]">
                  {featuredPage.service} · SHA {shortenHash(featuredSnapshot.hash, 5, 4)}
                </div>
                <button
                  type="button"
                  onClick={() => onOpenDiff(featuredPage.id)}
                  className="inline-flex items-center gap-1.5 rounded-[8px] bg-[color:var(--color-ink)] px-2.5 py-1.5 text-[11.5px] text-[color:var(--color-paper)] hover:bg-[color:var(--color-ink)]/90"
                >
                  Открыть diff
                  <ArrowRight size={12} strokeWidth={1.9} />
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-[11.5px] text-[color:var(--color-ink-mute)]">
              <Bell size={12} strokeWidth={1.9} />
              <span>Оповещения приходят в архив тихо, без email-спама и push-нотификаций.</span>
              <button
                onClick={onOpenAlerts}
                className="ml-auto text-[color:var(--color-ink)] underline decoration-[color:var(--color-line)] underline-offset-[3px] hover:decoration-[color:var(--color-ink)]/60"
              >
                Все оповещения
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="paper-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--color-line-soft)] pb-4">
            <div>
              <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--color-ink-mute)]">
                Свежий рендер · сегодня
              </div>
              <div className="mt-1 text-[15px] font-semibold text-[color:var(--color-ink)]">
                Как выглядит страница {featuredPage.service} прямо сейчас
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenSnapshot(featuredPage.id, featuredSnapshot.id)}
              className="inline-flex items-center gap-1.5 rounded-[8px] border border-[color:var(--color-line)] bg-[color:var(--color-paper)] px-2.5 py-1.5 text-[11.5px] text-[color:var(--color-ink-soft)] hover:border-[color:var(--color-ink)]/30"
            >
              Открыть слепок целиком
              <ArrowRight size={12} strokeWidth={1.9} />
            </button>
          </div>

          <div className="mt-4">
            <PagePreview page={featuredPage} snapshot={featuredSnapshot} />
          </div>
        </div>

        <div className="paper-card p-5">
          <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--color-ink-mute)]">
            Живая лента изменений
          </div>
          <div className="mt-1 text-[15px] font-semibold text-[color:var(--color-ink)]">
            Что переписали за последние 30 дней
          </div>

          <ol className="mt-4 space-y-3">
            {recentChanges.map(({ page, snapshot }) => (
              <li
                key={page.id + snapshot.id}
                className="flex items-start gap-3 rounded-[10px] border border-[color:var(--color-line)] bg-[color:var(--color-paper)] p-3"
              >
                <div
                  className="grid h-9 w-9 place-items-center rounded-[8px] text-[12.5px] font-semibold text-white"
                  style={{ background: page.color }}
                  aria-hidden
                >
                  {page.favicon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="truncate text-[13px] font-medium text-[color:var(--color-ink)]">
                      {page.service}
                    </div>
                    <span className="mono ml-auto flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-ink-mute)]">
                      <Clock size={10} strokeWidth={1.9} />
                      {formatRelative(snapshot.capturedAt)}
                    </span>
                  </div>
                  <div className="mono text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--color-ink-mute)]">
                    {page.documentTitle}
                  </div>
                  <div className="mt-1 text-[12.5px] leading-snug text-[color:var(--color-ink-soft)]">
                    {snapshot.summary}
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenDiff(page.id)}
                    className="mono mt-2 inline-flex items-center gap-1 rounded-[6px] border border-[color:var(--color-line)] bg-[color:var(--color-paper-raised)] px-2 py-[3px] text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--color-ink-soft)] hover:border-[color:var(--color-ink)]/30"
                  >
                    Смотреть diff <ArrowRight size={10} strokeWidth={1.9} />
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="paper-card overflow-hidden py-4">
        <div className="mono flex items-center justify-between px-6 pb-3 text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--color-ink-mute)]">
          <span>Сообщество наблюдает</span>
          <span>Прокрутка не требует внимания</span>
        </div>
        <div className="relative overflow-hidden">
          <div className="marquee py-1 pl-6">
            {[...pages, ...pages].map((page, index) => (
              <div
                key={`${page.id}-${index}`}
                className="flex min-w-max items-center gap-3 rounded-[10px] border border-[color:var(--color-line)] bg-[color:var(--color-paper)] px-4 py-2"
              >
                <div
                  className="grid h-7 w-7 place-items-center rounded-[6px] text-[11px] font-semibold text-white"
                  style={{ background: page.color }}
                >
                  {page.favicon}
                </div>
                <div className="min-w-0 text-[12.5px] font-medium text-[color:var(--color-ink)]">
                  {page.service}
                </div>
                <span className="mono text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--color-ink-mute)]">
                  {formatCount(page.followers)} следят
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

interface HeroStatProps {
  icon: typeof Fingerprint;
  value: string;
  label: string;
  tone?: "ink" | "critical" | "safe";
}

const HeroStat = ({ icon: Icon, value, label, tone = "ink" }: HeroStatProps) => {
  const toneClass =
    tone === "critical"
      ? "border-[color:var(--color-critical)]/30 bg-[color:var(--color-critical)]/8 text-[color:var(--color-critical)]"
      : tone === "safe"
      ? "border-[color:var(--color-safe)]/30 bg-[color:var(--color-safe)]/10 text-[color:var(--color-safe)]"
      : "border-[color:var(--color-line)] bg-[color:var(--color-paper)] text-[color:var(--color-ink)]";
  return (
    <div className={`rounded-[12px] border p-3 ${toneClass}`}>
      <div className="mono flex items-center gap-2 text-[10.5px] uppercase tracking-[0.16em]">
        <Icon size={13} strokeWidth={1.9} />
        {label}
      </div>
      <div className="mono mt-2 text-[24px] font-medium leading-none">{value}</div>
    </div>
  );
};
